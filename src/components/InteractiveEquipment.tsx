'use client'

import { useState } from 'react'
import Image from 'next/image'
import { type RoofType, type BrandType, type GridType, calculatePower, calculateMonthlyProduction, calculateMonthlySavings } from '@/data/packages'
import { panels, getDeyeInverter, getHuaweiInverter, getDeyeBattery, huaweiBattery } from '@/data/equipment'

interface InteractiveEquipmentProps {
  panelCount: number
  inverterKw: number
  brand: BrandType
  roofType: RoofType
  gridType: GridType
  hasBattery: boolean
  batteryKwh?: number // For Deye (variable battery sizes)
}

type EquipmentType = 'panel' | 'inverter' | 'battery' | null

export default function InteractiveEquipment({
  panelCount,
  inverterKw,
  brand,
  roofType,
  gridType,
  hasBattery,
  batteryKwh,
}: InteractiveEquipmentProps) {
  const [activeModal, setActiveModal] = useState<EquipmentType>(null)
  const [hoveredItem, setHoveredItem] = useState<EquipmentType>(null)

  // Get equipment info
  const panelInfo = panels[roofType]
  const inverterInfo = brand === 'deye' ? getDeyeInverter(inverterKw, gridType) : getHuaweiInverter(inverterKw, gridType)
  const batteryInfo = brand === 'deye' && batteryKwh
    ? getDeyeBattery(batteryKwh)
    : hasBattery ? huaweiBattery : null

  // Calculate estimates
  const powerKwp = calculatePower(panelCount)
  const monthlyProduction = calculateMonthlyProduction(panelCount)
  const monthlySavings = calculateMonthlySavings(monthlyProduction)
  const panelArea = Math.round(panelCount * 2.2) // ~2.2m² per panel

  const openModal = (type: EquipmentType) => {
    setActiveModal(type)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  return (
    <div className="relative w-full h-full flex flex-col rounded-xl overflow-hidden">
      {/* Equipment image with hotspots */}
      <div className="relative flex-1 flex items-center justify-center min-h-0">
        <Image
          src="/equipment/All-together.jpg"
          alt="Equipamento solar"
          width={550}
          height={440}
          className="object-contain max-h-full"
        />

        {/* Button for left equipment (small inverter) */}
        <button
          onClick={() => openModal('inverter')}
          onMouseEnter={() => setHoveredItem('inverter')}
          onMouseLeave={() => setHoveredItem(null)}
          className={`absolute z-30 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg border-2 border-white ${
            hoveredItem === 'inverter' ? 'bg-solar-blue scale-125' : 'bg-solar-orange hover:scale-110'
          }`}
          style={{ left: '28%', top: '45%' }}
        >
          <span className={`absolute w-full h-full rounded-full animate-ping opacity-40 ${hoveredItem === 'inverter' ? 'bg-solar-blue' : 'bg-solar-orange'}`} />
          <span className="relative text-white text-sm font-bold">i</span>
        </button>

        {/* Button for center tall battery */}
        {batteryInfo && (
          <button
            onClick={() => openModal('battery')}
            onMouseEnter={() => setHoveredItem('battery')}
            onMouseLeave={() => setHoveredItem(null)}
            className={`absolute z-30 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg border-2 border-white ${
              hoveredItem === 'battery' ? 'bg-solar-blue scale-125' : 'bg-solar-orange hover:scale-110'
            }`}
            style={{ left: '44%', top: '20%' }}
          >
            <span className={`absolute w-full h-full rounded-full animate-ping opacity-40 ${hoveredItem === 'battery' ? 'bg-solar-blue' : 'bg-solar-orange'}`} />
            <span className="relative text-white text-sm font-bold">i</span>
          </button>
        )}

        {/* Button for right equipment */}
        <button
          onClick={() => openModal('panel')}
          onMouseEnter={() => setHoveredItem('panel')}
          onMouseLeave={() => setHoveredItem(null)}
          className={`absolute z-30 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg border-2 border-white ${
            hoveredItem === 'panel' ? 'bg-solar-blue scale-125' : 'bg-solar-orange hover:scale-110'
          }`}
          style={{ left: '62%', top: '35%' }}
        >
          <span className={`absolute w-full h-full rounded-full animate-ping opacity-40 ${hoveredItem === 'panel' ? 'bg-solar-blue' : 'bg-solar-orange'}`} />
          <span className="relative text-white text-sm font-bold">i</span>
        </button>
      </div>

      {/* Equipment list below image */}
      <div className="bg-white border-t border-gray-100 p-4">
        {/* EQUIPMENT SECTION */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Equipamento
          </h4>
          <div className="space-y-2">
            {/* Panels */}
            <button
              onClick={() => openModal('panel')}
              onMouseEnter={() => setHoveredItem('panel')}
              onMouseLeave={() => setHoveredItem(null)}
              className={`w-full p-3 rounded-lg border transition-all cursor-pointer text-left ${
                hoveredItem === 'panel'
                  ? 'border-solar-blue bg-blue-50/50 shadow-sm'
                  : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  hoveredItem === 'panel' ? 'bg-solar-blue' : 'bg-gray-400'
                }`}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 5a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V9zm0 5a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-solar-blue">Painéis Solares</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-0.5">
                    {panelInfo.brand} {panelInfo.model}
                  </div>
                  <div className="text-[10px] text-gray-400 mb-1.5">
                    {panelInfo.structureShort}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-solar-blue/10 text-solar-blue text-[10px] font-semibold rounded">
                      {panelCount}x
                    </span>
                    <span className="px-2 py-0.5 bg-solar-orange/10 text-solar-orange text-[10px] font-semibold rounded">
                      {panelInfo.wattage}W
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded">
                      {panelInfo.warrantyProduct}a produto / {panelInfo.warrantyPerformance}a performance
                    </span>
                  </div>
                </div>
                <svg className={`w-5 h-5 flex-shrink-0 transition-colors ${hoveredItem === 'panel' ? 'text-solar-blue' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Inverter */}
            <button
              onClick={() => openModal('inverter')}
              onMouseEnter={() => setHoveredItem('inverter')}
              onMouseLeave={() => setHoveredItem(null)}
              className={`w-full p-3 rounded-lg border transition-all cursor-pointer text-left ${
                hoveredItem === 'inverter'
                  ? 'border-solar-blue bg-blue-50/50 shadow-sm'
                  : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  hoveredItem === 'inverter' ? 'bg-solar-blue' : 'bg-gray-400'
                }`}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-solar-blue">Inversor Híbrido</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-0.5">
                    {inverterInfo.brand} {inverterInfo.model}
                  </div>
                  <div className="text-[10px] text-gray-400 mb-1.5">
                    {inverterInfo.phaseLabel}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-solar-orange/10 text-solar-orange text-[10px] font-semibold rounded">
                      {inverterInfo.power}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded">
                      98% eficiência
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded">
                      {inverterInfo.warranty}a garantia
                    </span>
                  </div>
                </div>
                <svg className={`w-5 h-5 flex-shrink-0 transition-colors ${hoveredItem === 'inverter' ? 'text-solar-blue' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Battery */}
            {batteryInfo && (
              <button
                onClick={() => openModal('battery')}
                onMouseEnter={() => setHoveredItem('battery')}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full p-3 rounded-lg border transition-all cursor-pointer text-left ${
                  hoveredItem === 'battery'
                    ? 'border-solar-blue bg-blue-50/50 shadow-sm'
                    : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    hoveredItem === 'battery' ? 'bg-solar-blue' : 'bg-gray-400'
                  }`}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.5a1 1 0 00-.5.13V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v.13A1 1 0 009.5 4H4zm8 6a1 1 0 01-1 1H6a1 1 0 110-2h5a1 1 0 011 1z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-solar-blue">Bateria de Armazenamento</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1.5">
                      {batteryInfo.brand} {batteryInfo.model}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded">
                        {batteryInfo.capacity}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded">
                        6000+ ciclos
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded">
                        {batteryInfo.warranty}a garantia
                      </span>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 flex-shrink-0 transition-colors ${hoveredItem === 'battery' ? 'text-solar-blue' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* SERVICES SECTION */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Serviço incluído
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center text-center p-2 rounded-lg bg-green-50/70 border border-green-100">
              <svg className="w-5 h-5 text-green-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] font-medium text-green-700">Instalação</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-lg bg-green-50/70 border border-green-100">
              <svg className="w-5 h-5 text-green-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-[10px] font-medium text-green-700">Documentação</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-lg bg-green-50/70 border border-green-100">
              <svg className="w-5 h-5 text-green-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-[10px] font-medium text-green-700">Monitorização</span>
            </div>
          </div>
          <div className="mt-2 text-center">
            <span className="text-[10px] text-gray-500">
              Garantia de instalação: <span className="font-semibold text-green-600">25 anos</span>
            </span>
          </div>
        </div>
      </div>

      {/* Full Modal */}
      {activeModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-solar-blue to-blue-800 p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-blue-200 uppercase tracking-wider">
                    {activeModal === 'panel' && 'Painéis Solares'}
                    {activeModal === 'inverter' && 'Inversor Híbrido'}
                    {activeModal === 'battery' && 'Bateria de Armazenamento'}
                  </span>
                  <h3 className="text-xl font-bold mt-1">
                    {activeModal === 'panel' && `${panelInfo.brand} ${panelInfo.model}`}
                    {activeModal === 'inverter' && `${inverterInfo.brand} ${inverterInfo.model}`}
                    {activeModal === 'battery' && batteryInfo && `${batteryInfo.brand} ${batteryInfo.model}`}
                  </h3>
                  {/* Quick specs badges */}
                  <div className="flex gap-2 mt-2">
                    {activeModal === 'panel' && (
                      <>
                        <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">
                          {panelCount}x
                        </span>
                        <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">
                          {panelInfo.wattage}W
                        </span>
                      </>
                    )}
                    {activeModal === 'inverter' && (
                      <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">
                        {inverterInfo.power}
                      </span>
                    )}
                    {activeModal === 'battery' && batteryInfo && (
                      <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">
                        {batteryInfo.capacity}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Panel Modal Content */}
              {activeModal === 'panel' && (
                <>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Garantias
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xl font-bold text-green-700">{panelInfo.warrantyProduct} anos</div>
                        <div className="text-xs text-green-600">Produto / Defeitos</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-green-700">{panelInfo.warrantyPerformance} anos</div>
                        <div className="text-xs text-green-600">Performance (80%+)</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Especificações</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-gray-500">Eficiência</div>
                      <div className="text-gray-900 font-medium text-right">21.3%</div>
                      <div className="text-gray-500">Tecnologia</div>
                      <div className="text-gray-900 font-medium text-right">N-Type</div>
                      <div className="text-gray-500">Estrutura</div>
                      <div className="text-gray-900 font-medium text-right">{panelInfo.structureShort}</div>
                      <div className="text-gray-500">Dimensões</div>
                      <div className="text-gray-900 font-medium text-right">1722 x 1134 mm</div>
                      <div className="text-gray-500">Potência total</div>
                      <div className="text-gray-900 font-medium text-right">{powerKwp.toFixed(1)} kWp</div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-solar-blue rounded-r-lg p-4">
                    <h4 className="font-semibold text-solar-blue mb-2">O que significa para si?</h4>
                    <div className="space-y-1.5 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Produção estimada:</span>
                        <span className="font-semibold text-solar-blue">{monthlyProduction} kWh/mês</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Área no telhado:</span>
                        <span className="font-semibold text-solar-blue">~{panelArea} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Impacto na fatura:</span>
                        <span className="font-semibold text-green-600">~€{monthlySavings}/mês</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Inverter Modal Content */}
              {activeModal === 'inverter' && (
                <>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Garantias
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xl font-bold text-green-700">{inverterInfo.warranty} anos</div>
                        <div className="text-xs text-green-600">Garantia total</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-green-700">+5 anos</div>
                        <div className="text-xs text-green-600">Extensão disponível</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Especificações</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-gray-500">Potência</div>
                      <div className="text-gray-900 font-medium text-right">{inverterInfo.power}</div>
                      <div className="text-gray-500">Fase</div>
                      <div className="text-gray-900 font-medium text-right">{inverterInfo.phaseLabel}</div>
                      <div className="text-gray-500">Eficiência</div>
                      <div className="text-gray-900 font-medium text-right">98%</div>
                      <div className="text-gray-500">Tipo</div>
                      <div className="text-gray-900 font-medium text-right">Híbrido</div>
                      <div className="text-gray-500">Monitorização</div>
                      <div className="text-gray-900 font-medium text-right">App + WiFi</div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-solar-blue rounded-r-lg p-4">
                    <h4 className="font-semibold text-solar-blue mb-2">O que significa para si?</h4>
                    <div className="space-y-1.5 text-sm text-gray-600">
                      <p>O inversor híbrido converte a energia DC dos painéis em AC para uso doméstico.</p>
                      <p className="font-medium text-solar-blue">Monitorize a produção em tempo real através da app no seu telemóvel.</p>
                    </div>
                  </div>
                </>
              )}

              {/* Battery Modal Content */}
              {activeModal === 'battery' && batteryInfo && (
                <>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Garantias
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xl font-bold text-green-700">{batteryInfo.warranty} anos</div>
                        <div className="text-xs text-green-600">Garantia total</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-green-700">6000+</div>
                        <div className="text-xs text-green-600">Ciclos de vida</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Especificações</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-gray-500">Capacidade</div>
                      <div className="text-gray-900 font-medium text-right">{batteryInfo.capacity}</div>
                      <div className="text-gray-500">Tecnologia</div>
                      <div className="text-gray-900 font-medium text-right">LiFePO4</div>
                      <div className="text-gray-500">Profundidade descarga</div>
                      <div className="text-gray-900 font-medium text-right">90%</div>
                      <div className="text-gray-500">Vida útil</div>
                      <div className="text-gray-900 font-medium text-right">15+ anos</div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-solar-blue rounded-r-lg p-4">
                    <h4 className="font-semibold text-solar-blue mb-2">O que significa para si?</h4>
                    <div className="space-y-1.5 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Autonomia à noite:</span>
                        <span className="font-semibold text-solar-blue">~5-7 horas</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cobertura blackout:</span>
                        <span className="font-semibold text-green-600">Sim (backup)</span>
                      </div>
                      <p className="pt-1 text-gray-500">Armazene o excedente solar para usar à noite ou em dias nublados.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
