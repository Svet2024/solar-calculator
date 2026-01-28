'use client'

import { useState } from 'react'

export default function Calculator() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    address: '',
    roofType: 'inclinado',
    electricityBill: 150,
    gridType: 'monofasica',
  })

  // Calculate slider progress for gradient
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
    <div className="card">
      {step === 1 && (
        <>
          {/* Header */}
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
          <div className="mb-5">
            <label className="block text-sm font-semibold text-solar-blue mb-2">
              Tipo de telhado:
            </label>
            <select
              value={formData.roofType}
              onChange={(e) => handleInputChange('roofType', e.target.value)}
            >
              <option value="inclinado">Inclinado</option>
              <option value="plano">Plano</option>
            </select>
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

          {/* Grid Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-solar-blue mb-2">
              Tipo de rede:
            </label>
            <select
              value={formData.gridType}
              onChange={(e) => handleInputChange('gridType', e.target.value)}
            >
              <option value="monofasica">Monofásica</option>
              <option value="trifasica">Trifásica</option>
              <option value="offgrid">Sem ligação à rede</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleNext}
            className="w-full bg-solar-orange hover:bg-solar-orange-hover text-white font-bold py-4 px-6 rounded-full transition-colors text-lg"
          >
            Calcular sistema
          </button>
        </>
      )}

      {step === 2 && (
        <div className="text-center py-8">
          <p className="text-solar-blue">Step 2: Результаты (в разработке)</p>
          <button
            onClick={() => setStep(1)}
            className="mt-4 text-solar-orange hover:underline"
          >
            ← Voltar
          </button>
        </div>
      )}
    </div>
  )
}
