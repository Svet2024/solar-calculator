'use client'

import { useState } from 'react'
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

export default function Calculator() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    address: '',
    roofType: 'inclinado',
    electricityBill: 150,
    gridType: 'monofasica',
  })

  const billProgress = ((formData.electricityBill - 70) / (700 - 70)) * 100

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (!formData.address.trim()) {
      alert('Por favor, introduza o seu endereço')
      return
    }
    setStep(2)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Map placeholder */}
      <div className="card flex flex-col items-center justify-center min-h-[500px] order-2 lg:order-1">
        <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center gap-4 p-8">
          <svg className="w-16 h-16 text-solar-blue opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-solar-blue opacity-40 text-sm font-medium text-center">
            Mapa interativo<br />em breve
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="card order-1 lg:order-2">
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

            {/* Submit Button */}
            <button
              onClick={handleNext}
              className="w-full bg-solar-orange hover:bg-solar-orange-hover text-white font-bold py-4 px-6 rounded-full transition-colors text-lg mt-2"
            >
              Calcular sistema
            </button>
          </>
        )}

        {step === 2 && (
          <div className="text-center py-8">
            <p className="text-solar-blue">Step 2: Resultados (em desenvolvimento)</p>
            <button
              onClick={() => setStep(1)}
              className="mt-4 text-solar-orange hover:underline"
            >
              ← Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
