'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api'
import CustomSelect from './CustomSelect'
import PackageCarousel from './PackageCarousel'
import InteractiveEquipment from './InteractiveEquipment'
import { packages, Package } from '@/data/packages'

const libraries: ("places")[] = ['places']

const roofOptions = [
  { value: 'inclinado', label: 'Inclinado', icon: '⛰️' },
  { value: 'plano', label: 'Plano', icon: '➖' },
]

const gridOptions = [
  { value: 'monofasica', label: 'Monofásica', icon: '🔌' },
  { value: 'trifasica', label: 'Trifásica', icon: '⚡' },
  { value: 'offgrid', label: 'Sem ligação à rede', icon: '🔋' },
]

interface Location {
  address: string
  lat: number | null
  lng: number | null
  placeId?: string
}

interface FormData {
  // Step 1: House data
  location: Location
  roofType: string
  electricityBill: number
  gridType: string
  // Step 2: Contact data
  name: string
  email: string
  phone: string
  consent: boolean
}

const defaultCenter = { lat: 38.7223, lng: -9.1393 } // Lisboa

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '450px',
  borderRadius: '12px',
}

export default function Calculator() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    location: { address: '', lat: null, lng: null },
    roofType: 'inclinado',
    electricityBill: 150,
    gridType: 'monofasica',
    name: '',
    email: '',
    phone: '',
    consent: false,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Package selection state (Step 3)
  const [currentPackageIndex, setCurrentPackageIndex] = useState(1) // Start with recommended (Standard)
  const currentPackage = packages[currentPackageIndex]

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  })

  const billProgress = ((formData.electricityBill - 70) / (700 - 70)) * 100

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }, [])

  const autocompleteOptions = {
    componentRestrictions: { country: 'pt' },
    fields: ['formatted_address', 'geometry', 'place_id'],
  }

  const onPlaceChanged = useCallback(() => {
    console.log('onPlaceChanged called')
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()
      console.log('place:', place)

      if (place.geometry?.location) {
        const newLocation: Location = {
          address: place.formatted_address || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          placeId: place.place_id,
        }

        setFormData(prev => ({ ...prev, location: newLocation }))

        // Update input value
        if (inputRef.current && place.formatted_address) {
          inputRef.current.value = place.formatted_address
        }

        // Pan map to location
        if (map) {
          map.panTo({ lat: newLocation.lat!, lng: newLocation.lng! })
          map.setZoom(19)
        }
      }
    }
  }, [map])

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLat = e.latLng.lat()
      const newLng = e.latLng.lng()

      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const newLocation: Location = {
            address: results[0].formatted_address,
            lat: newLat,
            lng: newLng,
            placeId: results[0].place_id,
          }
          setFormData(prev => ({ ...prev, location: newLocation }))

          if (inputRef.current) {
            inputRef.current.value = results[0].formatted_address
          }
        } else {
          setFormData(prev => ({
            ...prev,
            location: { ...prev.location, lat: newLat, lng: newLng }
          }))
        }
      })
    }
  }, [])

  const handleStep1Next = () => {
    if (!formData.location.address.trim()) {
      alert('Por favor, introduza o seu endereço')
      return
    }
    setStep(2)
  }

  const handleStep2Submit = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert('Por favor, preencha todos os campos')
      return
    }
    if (!formData.consent) {
      alert('Por favor, aceite os termos para continuar')
      return
    }

    setIsSubmitting(true)

    try {
      const crmEndpoint = process.env.NEXT_PUBLIC_CRM_API_URL || '/api/leads'
      await fetch(crmEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Location data
          address: formData.location.address,
          lat: formData.location.lat,
          lng: formData.location.lng,
          placeId: formData.location.placeId,
          // House data
          roofType: formData.roofType,
          electricityBill: formData.electricityBill,
          gridType: formData.gridType,
          // Contact data
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          // Metadata
          source: 'solar-calculator',
          createdAt: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error('CRM Error:', error)
    }

    setIsSubmitting(false)
    setStep(3)
  }

  // Handle package selection and send to CRM
  const handlePackageSelect = async (pkg: Package) => {
    setIsSubmitting(true)

    try {
      const crmEndpoint = process.env.NEXT_PUBLIC_CRM_API_URL || '/api/leads'
      await fetch(crmEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Location data
          address: formData.location.address,
          lat: formData.location.lat,
          lng: formData.location.lng,
          placeId: formData.location.placeId,
          // House data
          roofType: formData.roofType,
          electricityBill: formData.electricityBill,
          gridType: formData.gridType,
          // Contact data
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          // Selected package
          selectedPackage: {
            id: pkg.id,
            name: pkg.name,
            price: pkg.price,
            power: pkg.power,
          },
          // Metadata
          source: 'solar-calculator',
          stage: 'package-selected',
          createdAt: new Date().toISOString(),
        }),
      })

      // Show confirmation
      alert(`Obrigado ${formData.name}! Entraremos em contacto em breve sobre o pacote ${pkg.name}.`)
    } catch (error) {
      console.error('CRM Error:', error)
      alert('Pedido registado! Entraremos em contacto em breve.')
    }

    setIsSubmitting(false)
  }

  // Reset calculator
  const handleReset = () => {
    setStep(1)
    setCurrentPackageIndex(1)
    setFormData({
      location: { address: '', lat: null, lng: null },
      roofType: 'inclinado',
      electricityBill: 150,
      gridType: 'monofasica',
      name: '',
      email: '',
      phone: '',
      consent: false,
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-6 lg:min-h-[85vh] max-w-[1280px] mx-auto">
      {/* Left Panel - Map or Hero Image */}
      <div className="card flex flex-col items-center justify-center min-h-[700px] lg:h-auto order-2 lg:order-1 overflow-hidden p-4">
        {step === 1 && isLoaded && !loadError ? (
          <div className="relative w-full h-full min-h-[450px]">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={formData.location.lat
                ? { lat: formData.location.lat, lng: formData.location.lng! }
                : defaultCenter
              }
              zoom={formData.location.lat ? 19 : 10}
              onLoad={onMapLoad}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                zoomControl: true,
                mapTypeId: 'satellite',
              }}
            >
              {formData.location.lat && (
                <Marker
                  position={{ lat: formData.location.lat, lng: formData.location.lng! }}
                  draggable={true}
                  onDragEnd={onMarkerDragEnd}
                />
              )}
            </GoogleMap>

            {formData.location.lat && (
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-solar-blue shadow">
                <div className="font-medium mb-1">Arraste o marcador para ajustar</div>
                <div className="text-gray-500">
                  {formData.location.lat.toFixed(5)}, {formData.location.lng?.toFixed(5)}
                </div>
              </div>
            )}

            {!formData.location.lat && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg text-center shadow">
                  <div className="text-solar-blue font-medium">Introduza o seu endereço</div>
                  <div className="text-gray-500 text-sm">para ver no mapa</div>
                </div>
              </div>
            )}
          </div>
        ) : step === 1 && loadError ? (
          <div className="text-center text-red-500 p-4">
            <p>Erro ao carregar o mapa</p>
            <p className="text-sm">Verifique a API key</p>
          </div>
        ) : step === 3 ? (
          <InteractiveEquipment currentPackage={currentPackage} />
        ) : (
          <div className="relative w-full h-full min-h-[450px]">
            <Image
              src="/hero-solar.png.webp"
              alt="Casa com painéis solares"
              fill
              className="object-contain p-4"
              priority
            />
          </div>
        )}
      </div>

      {/* Right Panel - Form */}
      <div className="card order-1 lg:order-2 min-h-[700px] lg:h-auto lg:min-w-[520px] flex flex-col">
        {/* Step 1: House Data */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold text-solar-blue mb-6">
              SIMULE O SEU SISTEMA
            </h2>

            {/* Address with Autocomplete */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-solar-blue mb-2">
                Endereço completo:
              </label>
              {isLoaded ? (
                <Autocomplete
                  onLoad={onAutocompleteLoad}
                  onPlaceChanged={onPlaceChanged}
                  options={autocompleteOptions}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    name="address"
                    defaultValue={formData.location.address}
                    placeholder="Comece a escrever o seu endereço..."
                    className="w-full bg-solar-gray border-0 rounded-lg px-4 py-3 text-solar-blue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-orange"
                  />
                </Autocomplete>
              ) : (
                <input
                  type="text"
                  name="address"
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  placeholder="Rua, número, cidade..."
                  className="w-full bg-solar-gray border-0 rounded-lg px-4 py-3 text-solar-blue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-orange"
                />
              )}
            </div>

            {/* Roof Type */}
            <CustomSelect
              label="Tipo de telhado:"
              options={roofOptions}
              value={formData.roofType}
              onChange={(v) => handleInputChange('roofType', v)}
            />

            {/* Electricity Bill Slider */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-solar-blue mb-2">
                Fatura de eletricidade €/mês <span className="text-solar-orange">*</span>
              </label>
              <div className="text-2xl font-bold text-solar-blue mb-2">
                €{formData.electricityBill}
              </div>
              <input
                type="range"
                min="70"
                max="700"
                value={formData.electricityBill}
                onChange={(e) => handleInputChange('electricityBill', parseInt(e.target.value))}
                className="w-full"
                style={{ '--progress': `${billProgress}%` } as React.CSSProperties}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>70</span>
                <span>700</span>
              </div>
            </div>

            {/* Grid Type */}
            <CustomSelect
              label="Tipo de rede:"
              options={gridOptions}
              value={formData.gridType}
              onChange={(v) => handleInputChange('gridType', v)}
            />

            {/* Next Button */}
            <button
              onClick={handleStep1Next}
              className="w-full bg-solar-orange hover:bg-solar-orange-hover text-white font-bold py-4 px-6 rounded-full transition-colors text-lg mt-2"
            >
              Continuar
            </button>
          </>
        )}

        {/* Step 2: Contact Data */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-solar-blue mb-6">
              OS SEUS DADOS
            </h2>

            {/* Name */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-solar-blue mb-2">
                Nome completo:
              </label>
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="O seu nome"
                className="w-full bg-solar-gray border-0 rounded-lg px-4 py-3 text-solar-blue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-orange"
              />
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-solar-blue mb-2">
                Email:
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-solar-gray border-0 rounded-lg px-4 py-3 text-solar-blue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-orange"
              />
            </div>

            {/* Phone */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-solar-blue mb-2">
                Telemóvel:
              </label>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+351 912 345 678"
                className="w-full bg-solar-gray border-0 rounded-lg px-4 py-3 text-solar-blue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-orange"
              />
            </div>

            {/* Consent Checkbox */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) => handleInputChange('consent', e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-solar-orange focus:ring-solar-orange cursor-pointer"
                />
                <span className="text-sm text-gray-600">
                  Aceito receber comunicações sobre a minha simulação e concordo com a{' '}
                  <a href="/privacy" className="text-solar-orange hover:underline">
                    política de privacidade
                  </a>
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 text-solar-blue hover:bg-gray-100 rounded-full transition-colors font-medium"
              >
                ← Voltar
              </button>
              <button
                onClick={handleStep2Submit}
                disabled={isSubmitting}
                className="flex-1 bg-solar-orange hover:bg-solar-orange-hover disabled:opacity-50 text-white font-bold py-4 px-6 rounded-full transition-colors text-lg"
              >
                {isSubmitting ? 'A processar...' : 'Mostrar resultados'}
              </button>
            </div>
          </>
        )}

        {/* Step 3: Results with Package Carousel */}
        {step === 3 && (
          <div className="flex flex-col flex-1">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-solar-blue">
                RESULTADO DA SIMULAÇÃO
              </h2>
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-solar-orange transition-colors"
              >
                Nova simulação
              </button>
            </div>

            {/* Greeting */}
            <p className="text-sm text-gray-600 mb-2">
              Olá {formData.name}, com base na sua fatura de <span className="font-semibold text-solar-blue">€{formData.electricityBill}/mês</span>:
            </p>

            {/* Package Carousel */}
            <PackageCarousel
              packages={packages}
              currentIndex={currentPackageIndex}
              onIndexChange={setCurrentPackageIndex}
              onSelect={handlePackageSelect}
              electricityBill={formData.electricityBill}
            />
          </div>
        )}
      </div>
    </div>
  )
}
