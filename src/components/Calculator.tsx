'use client'

import { useState } from 'react'
import Image from 'next/image'
import CustomSelect from './CustomSelect'

const roofOptions = [
  { value: 'inclinado', label: 'Inclinado', icon: '⛰️' },
  { value: 'plano', label: 'Plano', icon: '➖' },
]

const gridOptions = [
  { value: 'monofasica', label: 'Monofásica', icon: '🔌' },
  { value: 'trifasica', label: 'Trifásica', icon: '⚡' },
  { value: 'offgrid', label: 'Sem ligação à rede', icon: '🔋' },
]

interface FormData {
  // Step 1: House data
  address: string
  roofType: string
  electricityBill: number
  gridType: string
  // Step 2: Contact data
  name: string
  email: string
  phone: string
  consent: boolean
}

export default function Calculator() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    address: '',
    roofType: 'inclinado',
    electricityBill: 150,
    gridType: 'monofasica',
    name: '',
    email: '',
    phone: '',
    consent: false,
  })

  const billProgress = ((formData.electricityBill - 70) / (700 - 70)) * 100

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleStep1Next = () => {
    if (!formData.address.trim()) {
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

    // Send to CRM
    try {
      const crmEndpoint = process.env.NEXT_PUBLIC_CRM_API_URL || '/api/leads'
      await fetch(crmEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // House data
          address: formData.address,
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
      // Continue anyway - don't block user from seeing results
    }

    setIsSubmitting(false)
    setStep(3)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Hero Image */}
      <div className="card flex flex-col items-center justify-center min-h-[500px] order-2 lg:order-1 overflow-hidden p-0">
        <div className="relative w-full h-full min-h-[500px]">
          <Image
            src="/hero-solar.png.webp"
            alt="Casa com painéis solares"
            fill
            className="object-contain p-6"
            priority
          />
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="card order-1 lg:order-2">
        {/* Step 1: House Data */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold text-solar-blue mb-6">
              SIMULE O SEU SISTEMA
            </h2>

            {/* Address */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-solar-blue mb-2">
                Endereço completo:
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, cidade..."
                className="w-full bg-solar-gray border-0 rounded-lg px-4 py-3 text-solar-blue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-orange"
              />
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

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-solar-blue mb-2">Obrigado, {formData.name}!</h2>
            <p className="text-gray-600 mb-6">Step 3: Resultados do cálculo (em desenvolvimento)</p>
            <button
              onClick={() => setStep(1)}
              className="text-solar-orange hover:underline"
            >
              ← Nova simulação
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
