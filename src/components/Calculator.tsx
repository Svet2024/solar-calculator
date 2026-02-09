'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api'
import PackageCarousel, { type SelectedPackage, type CurrentPackageInfo } from './PackageCarousel'
import InteractiveEquipment from './InteractiveEquipment'
import { ChatPanel } from './ChatPanel'
import {
  type GridType,
  type RoofType,
  type BrandType,
} from '@/data/packages'

const libraries: ("places")[] = ['places']

const roofOptions = [
  { value: 'inclinada', label: 'Inclinado', icon: '⛰️' },
  { value: 'plana', label: 'Plano', icon: '➖' },
]

const gridOptions = [
  { value: 'monofasica', label: 'Monofásica', icon: '🔌' },
  { value: 'trifasica', label: 'Trifásica', icon: '⚡' },
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
  roofType: RoofType
  electricityBill: number
  gridType: GridType
  // Step 2: Contact data
  name: string
  email: string
  phone: string
  consent: boolean
  // Honeypot (anti-spam) - should remain empty
  website: string
}

// Validation helpers
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim())
}

function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  // Accept international numbers: at least 7 digits, optionally starting with +
  return /^\+?\d{7,15}$/.test(cleaned)
}

const defaultCenter = { lat: 38.7223, lng: -9.1393 } // Lisboa

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '450px',
  borderRadius: '12px',
}

interface CalculatorProps {
  onStepChange?: (step: number) => void
}

export default function Calculator({ onStepChange }: CalculatorProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    location: { address: '', lat: null, lng: null },
    roofType: 'inclinada',
    electricityBill: 150,
    gridType: 'monofasica',
    name: '',
    email: '',
    phone: '',
    consent: false,
    website: '', // Honeypot
  })

  // Brand selection state (Step 3)
  const [selectedBrand, setSelectedBrand] = useState<BrandType>('deye')
  const [hasBattery, setHasBattery] = useState(true)
  const [selectedBatteryKwh, setSelectedBatteryKwh] = useState(5) // Default: 5 kWh for Deye

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Package selection state (Step 3)
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0)
  const [selectedPackage, setSelectedPackage] = useState<SelectedPackage | null>(null)
  const [currentPackageInfo, setCurrentPackageInfo] = useState<CurrentPackageInfo | null>(null)

  // Chat state (mobile)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Equipment modal state (to hide sticky footer)
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false)

  // Validation errors state
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    phone?: string
  }>({})

  // Notify parent of step changes
  useEffect(() => {
    onStepChange?.(step)
  }, [step, onStepChange])

  // Validate a single field
  const validateField = (field: string, value: string): string | undefined => {
    if (!value.trim()) return undefined // Don't show error for empty fields until submit
    switch (field) {
      case 'email':
        if (!validateEmail(value)) return 'Email inválido'
        break
      case 'phone':
        if (!validatePhone(value)) return 'Número de telefone inválido'
        break
      case 'name':
        if (value.trim().length < 2) return 'Nome muito curto'
        break
    }
    return undefined
  }

  // Handle field blur for inline validation
  const handleFieldBlur = (field: string, value: string) => {
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  // Clear error when user starts typing
  const handleFieldFocus = (field: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

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

  // Geolocation - get user's current position
  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador')
      return
    }

    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        // Update location in form
        setFormData(prev => ({
          ...prev,
          location: {
            address: 'A carregar endereço...',
            lat: latitude,
            lng: longitude,
          }
        }))

        // Pan map to location
        if (map) {
          map.panTo({ lat: latitude, lng: longitude })
          map.setZoom(19)
        }

        // Reverse geocode to get address
        if (isLoaded) {
          const geocoder = new google.maps.Geocoder()
          try {
            const response = await geocoder.geocode({ location: { lat: latitude, lng: longitude } })
            if (response.results[0]) {
              setFormData(prev => ({
                ...prev,
                location: {
                  address: response.results[0].formatted_address,
                  lat: latitude,
                  lng: longitude,
                  placeId: response.results[0].place_id,
                }
              }))
              // Update input field
              if (inputRef.current) {
                inputRef.current.value = response.results[0].formatted_address
              }
            }
          } catch (error) {
            console.error('Geocoding error:', error)
          }
        }

        setIsLocating(false)
      },
      (error) => {
        setIsLocating(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Permissão de localização negada. Por favor, ative nas configurações do navegador.')
            break
          case error.POSITION_UNAVAILABLE:
            alert('Informação de localização não disponível.')
            break
          case error.TIMEOUT:
            alert('Tempo esgotado ao obter localização.')
            break
          default:
            alert('Erro ao obter localização.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [map, isLoaded])

  const onAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }, [])

  const autocompleteOptions = {
    componentRestrictions: { country: 'pt' },
    fields: ['formatted_address', 'geometry', 'place_id'],
  }

  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()

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
    // Inline validation
    const newErrors: typeof errors = {}

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Por favor, introduza o seu nome'
    }
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.phone.trim() || !validatePhone(formData.phone)) {
      newErrors.phone = 'Número de telefone inválido'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (!formData.consent) {
      alert('Por favor, aceite os termos para continuar')
      return
    }

    setIsSubmitting(true)

    try {
      const crmEndpoint = process.env.NEXT_PUBLIC_CRM_API_URL || '/api/leads'
      const response = await fetch(crmEndpoint, {
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
          // Honeypot (anti-spam)
          website: formData.website,
          // Metadata
          source: 'solar-calculator',
          createdAt: new Date().toISOString(),
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        alert(result.error || 'Erro ao processar pedido')
        setIsSubmitting(false)
        return
      }
    } catch (error) {
      console.error('CRM Error:', error)
    }

    setIsSubmitting(false)
    setStep(3)
  }

  // Handle package selection and send to CRM
  const handlePackageSelect = async (pkg: SelectedPackage) => {
    setSelectedPackage(pkg)
    setIsSubmitting(true)

    try {
      const crmEndpoint = process.env.NEXT_PUBLIC_CRM_API_URL || '/api/leads'
      const response = await fetch(crmEndpoint, {
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
          // Honeypot (anti-spam)
          website: formData.website,
          // Selected package
          selectedPackage: {
            id: pkg.id,
            brand: pkg.brand,
            panelCount: pkg.panelCount,
            price: pkg.price,
            power: pkg.power,
            hasBattery: pkg.hasBattery,
            batteryCapacity: pkg.batteryCapacity,
          },
          // Metadata
          source: 'solar-calculator',
          stage: 'package-selected',
          createdAt: new Date().toISOString(),
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        // Show error but still proceed to success page
        console.error('API Error:', result.error)
      }

      // Go to success page
      setStep(4)
    } catch (error) {
      console.error('CRM Error:', error)
      // Still show success page (lead might be saved)
      setStep(4)
    }

    setIsSubmitting(false)
  }

  // Reset calculator
  const handleReset = () => {
    setStep(1)
    setCurrentPackageIndex(0)
    setSelectedBrand('deye')
    setHasBattery(true)
    setFormData({
      location: { address: '', lat: null, lng: null },
      roofType: 'inclinada',
      electricityBill: 150,
      gridType: 'monofasica',
      name: '',
      email: '',
      phone: '',
      consent: false,
      website: '', // Honeypot
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-6 lg:min-h-[85vh] max-w-[1280px] mx-auto">
      {/* Left Panel - Map or Hero Image */}
      <div id="map-section" className="card flex flex-col items-center justify-center min-h-[700px] lg:h-auto order-2 lg:order-1 overflow-hidden p-4">
        {/* Step 1: Map loading state */}
        {step === 1 && !isLoaded && !loadError ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[450px] text-center">
            <svg className="w-12 h-12 text-solar-orange animate-spin mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-solar-blue font-medium">A carregar mapa...</p>
            <p className="text-gray-500 text-sm mt-1">Por favor aguarde</p>
          </div>
        ) : step === 1 && isLoaded && !loadError ? (
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

            {/* Geolocation button */}
            <button
              onClick={handleGetLocation}
              disabled={isLocating}
              className="absolute top-4 right-4 bg-white hover:bg-gray-50 text-solar-blue p-3 rounded-lg shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-wait"
              title="Usar a minha localização"
            >
              {isLocating ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>

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
          <div className="flex flex-col items-center justify-center h-full min-h-[450px] text-center p-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-solar-blue font-medium mb-1">Erro ao carregar o mapa</p>
            <p className="text-gray-500 text-sm mb-4">Pode continuar sem o mapa</p>
            <p className="text-xs text-gray-400">Introduza o endereço manualmente</p>
          </div>
        ) : step === 3 && currentPackageInfo ? (
          <InteractiveEquipment
            panelCount={currentPackageInfo.panelCount}
            inverterKw={currentPackageInfo.inverterKw}
            brand={selectedBrand}
            roofType={formData.roofType}
            gridType={formData.gridType}
            hasBattery={selectedBrand === 'deye' || hasBattery}
            batteryKwh={currentPackageInfo.batteryKwh ?? undefined}
            electricityBill={formData.electricityBill}
            onModalChange={setIsEquipmentModalOpen}
          />
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

            {/* Address with Autocomplete + Geolocation button */}
            <div className="mb-3">
              <label className="block text-sm font-semibold text-solar-blue mb-2">
                Endereço completo:
              </label>
              <div className="relative">
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
                      className="w-full bg-solar-gray border-0 rounded-lg pl-4 pr-12 py-3 text-solar-blue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-orange"
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
                    className="w-full bg-solar-gray border-0 rounded-lg pl-4 pr-12 py-3 text-solar-blue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-orange"
                  />
                )}
                {/* Geolocation button inside input */}
                <button
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-solar-blue hover:text-solar-orange transition-colors disabled:opacity-50"
                  title="Usar a minha localização"
                  type="button"
                >
                  {isLocating ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Scroll to map button - mobile only */}
            <button
              onClick={() => {
                const mapSection = document.getElementById('map-section')
                if (mapSection) {
                  mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className="flex items-center justify-center gap-2 w-full mb-5 py-2 text-sm text-solar-blue hover:text-solar-orange transition-colors lg:hidden"
              type="button"
            >
              <span>Escolher o meu telhado no mapa</span>
              <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Roof Type - Segmented Control */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-solar-blue mb-2">
                Tipo de telhado
              </label>
              <div className="flex rounded-lg border-2 border-gray-200 overflow-hidden">
                {roofOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange('roofType', option.value)}
                    className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${
                      formData.roofType === option.value
                        ? 'bg-solar-orange text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

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

            {/* Grid Type - Segmented Control */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-solar-blue mb-2">
                Tipo de rede
              </label>
              <div className="flex rounded-lg border-2 border-gray-200 overflow-hidden">
                {gridOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange('gridType', option.value)}
                    className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${
                      formData.gridType === option.value
                        ? 'bg-solar-orange text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

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
                onBlur={(e) => handleFieldBlur('name', e.target.value)}
                onFocus={() => handleFieldFocus('name')}
                placeholder="O seu nome"
                className={`w-full bg-solar-gray border-2 rounded-lg px-4 py-3 text-solar-blue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-orange ${
                  errors.name ? 'border-red-400' : 'border-transparent'
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>
              )}
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
                onBlur={(e) => handleFieldBlur('email', e.target.value)}
                onFocus={() => handleFieldFocus('email')}
                placeholder="seu@email.com"
                className={`w-full bg-solar-gray border-2 rounded-lg px-4 py-3 text-solar-blue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-orange ${
                  errors.email ? 'border-red-400' : 'border-transparent'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
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
                onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                onFocus={() => handleFieldFocus('phone')}
                placeholder="+351 912 345 678"
                className={`w-full bg-solar-gray border-2 rounded-lg px-4 py-3 text-solar-blue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-orange ${
                  errors.phone ? 'border-red-400' : 'border-transparent'
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Honeypot field - hidden from users, bots will fill it */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
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
              currentIndex={currentPackageIndex}
              onIndexChange={setCurrentPackageIndex}
              onSelect={handlePackageSelect}
              onCurrentPackageChange={setCurrentPackageInfo}
              electricityBill={formData.electricityBill}
              gridType={formData.gridType}
              roofType={formData.roofType}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              hasBattery={hasBattery}
              onBatteryChange={setHasBattery}
              selectedBatteryKwh={selectedBatteryKwh}
              onBatteryKwhChange={setSelectedBatteryKwh}
              hideFooter={isEquipmentModalOpen}
            />
          </div>
        )}

        {/* Step 4: Success Page */}
        {step === 4 && selectedPackage && (
          <div className="flex flex-col items-center justify-center flex-1 py-8">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-fade-in">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Thank You Message */}
            <h2 className="text-2xl font-bold text-solar-blue mb-2 text-center">
              Obrigado, {formData.name}!
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Recebemos o seu pedido.<br/>
              Entraremos em contacto em breve.
            </p>

            {/* Order Summary */}
            <div className="bg-solar-gray rounded-xl p-6 w-full max-w-sm mb-6">
              <h3 className="font-semibold text-solar-blue mb-4 text-center">Resumo do pedido</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sistema:</span>
                  <span className="font-medium text-solar-blue capitalize">{selectedPackage.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Painéis:</span>
                  <span className="font-medium text-solar-blue">{selectedPackage.panelCount} painéis</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Potência:</span>
                  <span className="font-medium text-solar-blue">{selectedPackage.power.toFixed(1)} kWp</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bateria:</span>
                  <span className="font-medium text-solar-blue">{selectedPackage.batteryCapacity || 'Sem bateria'}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Preço total:</span>
                    <span className="font-bold text-solar-orange text-lg">€{selectedPackage.price.toLocaleString('pt-PT')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Options */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <a
                href="https://wa.me/351934566607?text=Olá! Acabei de fazer uma simulação no vosso site e gostaria de mais informações."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <button
                onClick={handleReset}
                className="flex-1 bg-solar-gray hover:bg-gray-200 text-solar-blue font-semibold py-3 px-6 rounded-full transition-colors"
              >
                Nova simulação
              </button>
            </div>

            {/* Additional Info */}
            <p className="text-xs text-gray-400 mt-6 text-center">
              Também enviámos um email de confirmação para {formData.email}
            </p>
          </div>
        )}
      </div>

      {/* Chat Panel - Only on Step 3 (Results) */}
      {step === 3 && (
        <>
          {/* Toggle button - right edge */}
          {!isChatOpen && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-solar-orange hover:bg-solar-orange-hover text-white px-2 py-4 rounded-l-xl shadow-lg transition-all hover:pr-3 group"
              aria-label="Abrir chat com Helius AI"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">☀️</span>
                <span className="text-[10px] font-semibold writing-mode-vertical hidden lg:block" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  Helius AI
                </span>
              </div>
            </button>
          )}

          {/* Slide-out sidebar overlay */}
          <div
            className={`fixed inset-0 z-50 transition-opacity duration-300 ${
              isChatOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setIsChatOpen(false)}
            />

            {/* Sliding panel */}
            <div
              className={`absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out ${
                isChatOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <ChatPanel isOpen={true} onClose={() => setIsChatOpen(false)} />
            </div>
          </div>
        </>
      )}

      {/* WhatsApp Floating Button - always visible except on success page */}
      {step !== 4 && (
        <a
          href="https://wa.me/351924472548?text=Olá! Gostaria de mais informações sobre energia solar."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          aria-label="Contactar via WhatsApp"
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}

      {/* Testimonials + FAQ + Contacts - Below main grid on equipment and success pages */}
      {(step === 3 || (step === 4 && selectedPackage)) && (
        <div className="col-span-full order-last mt-8 max-w-[1280px] mx-auto space-y-8">

          {/* Testemunhos dos nossos clientes */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h3 className="text-xl font-bold text-solar-blue mb-1 text-center">Testemunhos dos nossos clientes</h3>
            <p className="text-gray-500 text-sm text-center mb-6">Mais de 500 Instalações em Portugal</p>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {/* Review 1 */}
              <div className="min-w-[280px] flex-1 bg-gray-50 rounded-xl p-5 snap-start">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                  <svg className="w-5 h-5 ml-auto" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </div>
                <p className="text-sm text-gray-700 mb-3">&ldquo;Equipa fantástica e profissional... recomendo&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">PR</div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">Paulo Rodrigues</p>
                    <p className="text-xs text-gray-400">16 Março 2025</p>
                  </div>
                </div>
              </div>
              {/* Review 2 */}
              <div className="min-w-[280px] flex-1 bg-gray-50 rounded-xl p-5 snap-start">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(4)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <svg className="w-5 h-5 ml-auto" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </div>
                <p className="text-sm text-gray-700 mb-3">&ldquo;Trabalho 5 estrelas. Comunicação impecável. Explicações claras. Recomendo e voltarei a chamar...&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-600">FA</div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">Fernando Almeida</p>
                    <p className="text-xs text-gray-400">14 Fevereiro 2025</p>
                  </div>
                </div>
              </div>
              {/* Review 3 */}
              <div className="min-w-[280px] flex-1 bg-gray-50 rounded-xl p-5 snap-start">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                  <svg className="w-5 h-5 ml-auto" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </div>
                <p className="text-sm text-gray-700 mb-3">&ldquo;Yuri and his team are great. Super helpful, clean, tidy and respectful from beginning to end. From planning to installation to support...&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">MH</div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">Mark Hartnell</p>
                    <p className="text-xs text-gray-400">4 Fevereiro 2025</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Trustindex badge */}
            <div className="flex justify-center mt-4">
              <a href="https://www.trustindex.io/reviews/svetsolar.pt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-600 text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-green-700 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Certificado: Trustindex
              </a>
            </div>
          </div>

          {/* Perguntas Frequentes (FAQ) */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h3 className="text-xl font-bold text-solar-blue mb-1 text-center">Perguntas Frequentes (FAQ)</h3>
            <p className="text-gray-500 text-sm text-center mb-6">Tudo o que precisa saber sobre energia solar</p>
            <div className="space-y-3 max-w-4xl mx-auto">
              <details className="border border-gray-200 rounded-lg px-4 group">
                <summary className="font-medium text-solar-blue cursor-pointer list-none flex justify-between items-center py-3">
                  Como funcionam os painéis solares?
                  <svg className="w-5 h-5 transition-transform group-open:rotate-180 text-solar-orange flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-sm text-gray-600 pb-3">Os painéis solares são compostos por células fotovoltaicas que transformam a energia solar em eletricidade. O processo utiliza o efeito fotovoltaico em estruturas de silício, gerando corrente contínua que é convertida em corrente alternada mediante inversor para uso doméstico e comercial.</p>
              </details>
              <details className="border border-gray-200 rounded-lg px-4 group">
                <summary className="font-medium text-solar-blue cursor-pointer list-none flex justify-between items-center py-3">
                  Quais são as vantagens da geração de energia solar?
                  <svg className="w-5 h-5 transition-transform group-open:rotate-180 text-solar-orange flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-sm text-gray-600 pb-3">Além da redução significativa nos custos de eletricidade, a energia solar é uma fonte limpa e renovável, contribuindo para a diminuição do consumo de energia da rede e, consequentemente, a sua pegada de carbono.</p>
              </details>
              <details className="border border-gray-200 rounded-lg px-4 group">
                <summary className="font-medium text-solar-blue cursor-pointer list-none flex justify-between items-center py-3">
                  Qual é o benefício e o retorno do investimento em painéis solares?
                  <svg className="w-5 h-5 transition-transform group-open:rotate-180 text-solar-orange flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-sm text-gray-600 pb-3">A instalação de painéis solares pode reduzir significativamente a sua conta de eletricidade, com poupanças até 90%. O retorno do investimento varia, mas normalmente situa-se entre 3 a 10 anos, considerando a longa vida útil dos painéis, que é superior a 25 anos.</p>
              </details>
              <details className="border border-gray-200 rounded-lg px-4 group">
                <summary className="font-medium text-solar-blue cursor-pointer list-none flex justify-between items-center py-3">
                  Quantos painéis solares são necessários para a minha casa ou empresa?
                  <svg className="w-5 h-5 transition-transform group-open:rotate-180 text-solar-orange flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-sm text-gray-600 pb-3">A quantidade de painéis solares necessários depende de vários fatores, como o espaço disponível, o consumo de eletricidade, a orientação dos painéis, a incidência de sombras, e o tipo de inversor.</p>
              </details>
              <details className="border border-gray-200 rounded-lg px-4 group">
                <summary className="font-medium text-solar-blue cursor-pointer list-none flex justify-between items-center py-3">
                  Por que é importante instalar uma bateria junto com os painéis solares?
                  <svg className="w-5 h-5 transition-transform group-open:rotate-180 text-solar-orange flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-sm text-gray-600 pb-3">A instalação de uma bateria em sistemas fotovoltaicos tem como principal vantagem a capacidade de armazenar energia solar excedente gerada durante o dia, para utilização em períodos sem sol, como à noite ou em dias nublados. Isso aumenta a eficiência e a independência do seu sistema solar.</p>
              </details>
              <details className="border border-gray-200 rounded-lg px-4 group">
                <summary className="font-medium text-solar-blue cursor-pointer list-none flex justify-between items-center py-3">
                  É possível vender os excedentes de energia produzida pelos meus painéis solares para a rede?
                  <svg className="w-5 h-5 transition-transform group-open:rotate-180 text-solar-orange flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-sm text-gray-600 pb-3">Sim, é possível e economicamente vantajoso vender o excedente de energia solar gerada pelo seu sistema fotovoltaico para a rede elétrica. Isso não só contribui para uma maior economia nas contas de energia, mas também apoia a sustentabilidade energética, injetando energia limpa na rede.</p>
              </details>
              <details className="border border-gray-200 rounded-lg px-4 group">
                <summary className="font-medium text-solar-blue cursor-pointer list-none flex justify-between items-center py-3">
                  Como é feita a manutenção dos painéis solares?
                  <svg className="w-5 h-5 transition-transform group-open:rotate-180 text-solar-orange flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-sm text-gray-600 pb-3">A manutenção é mínima, geralmente envolvendo limpeza ocasional com água e escova para manter a eficiência máxima dos painéis.</p>
              </details>
              <details className="border border-gray-200 rounded-lg px-4 group">
                <summary className="font-medium text-solar-blue cursor-pointer list-none flex justify-between items-center py-3">
                  Os painéis solares funcionam em qualquer condição climática?
                  <svg className="w-5 h-5 transition-transform group-open:rotate-180 text-solar-orange flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-sm text-gray-600 pb-3">Sim, os painéis solares não requerem luz solar direta para funcionar eficientemente. Funcionam em dias nublados, sendo Portugal ideal pela alta incidência solar anual.</p>
              </details>
            </div>
          </div>

          {/* Contacte-nos */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h3 className="text-xl font-bold text-solar-blue mb-1 text-center">Contacte-nos</h3>
            <p className="text-gray-500 text-sm text-center mb-6">Alguma pergunta? Contacte-nos!</p>
            <div className="max-w-lg mx-auto space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <div>
                  <p className="text-sm font-medium text-gray-800">+351 934 566 607</p>
                  <p className="text-xs text-gray-400">Rede móvel nacional</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-solar-orange mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <p className="text-sm font-medium text-gray-800">geral@svetsolar.pt</p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-solar-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Sede</p>
                  <p className="text-sm text-gray-800">Av. do Atlântico n.º 16, 14.º piso, Escritório 8, 1990-019 Lisboa</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Armazém adicional com equipa</p>
                  <p className="text-sm text-gray-800">Caldas da Rainha, Leiria</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <p className="text-sm text-gray-800">NIF: 515445860</p>
              </div>
              <div className="flex gap-3 pt-4">
                <a href="https://wa.me/351934566607" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a href="mailto:geral@svetsolar.pt" className="flex-1 flex items-center justify-center gap-2 bg-solar-orange hover:bg-orange-600 text-white font-medium py-3 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  Enviar Email
                </a>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
