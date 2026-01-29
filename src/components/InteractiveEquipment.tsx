'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Package } from '@/data/packages'

interface InteractiveEquipmentProps {
  currentPackage: Package
}

type EquipmentType = 'panel' | 'inverter' | 'battery' | null

export default function InteractiveEquipment({ currentPackage }: InteractiveEquipmentProps) {
  const [activeModal, setActiveModal] = useState<EquipmentType>(null)

  const hasBattery = !!currentPackage.equipment.battery

  const openModal = (type: EquipmentType) => {
    setActiveModal(type)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  return (
    <div className="relative w-full h-full min-h-[650px] rounded-xl overflow-hidden">
      {/* Bottom to top gray gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-100 via-gray-50 to-white" />

      {/* Equipment display - center composition, moved up */}
      <div className="absolute inset-0 flex items-start justify-center pt-4">

        {/* Solar Panel - Center, VERY LARGE */}
        <div className="relative">
          {/* Pulsing button for panel - on right side */}
          <button
            onClick={() => openModal('panel')}
            className="absolute top-1/4 -right-5 z-30 w-10 h-10 bg-solar-orange rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-white"
          >
            <span className="absolute w-full h-full bg-solar-orange rounded-full animate-ping opacity-40" />
            <span className="relative text-white text-sm font-bold">i</span>
          </button>

          <Image
            src={currentPackage.equipment.panels.image}
            alt="Painel Solar"
            width={420}
            height={580}
            className="object-contain"
          />
        </div>

        {/* Battery - Left, just below panel */}
        {hasBattery && currentPackage.equipment.battery && (
          <div className="absolute left-4 top-[45%] z-10">
            {/* Pulsing button - on left side */}
            <button
              onClick={() => openModal('battery')}
              className="absolute top-1/3 -left-5 z-30 w-10 h-10 bg-solar-orange rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-white"
            >
              <span className="absolute w-full h-full bg-solar-orange rounded-full animate-ping opacity-40" />
              <span className="relative text-white text-sm font-bold">i</span>
            </button>

            <Image
              src={currentPackage.equipment.battery.image}
              alt="Bateria"
              width={260}
              height={380}
              className="object-contain"
            />
          </div>
        )}

        {/* Inverter - Right, just below panel */}
        <div className={`absolute top-[50%] z-10 ${hasBattery ? 'right-4' : 'right-8'}`}>
          {/* Pulsing button - on right side */}
          <button
            onClick={() => openModal('inverter')}
            className="absolute top-1/3 -right-5 z-30 w-10 h-10 bg-solar-orange rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-white"
          >
            <span className="absolute w-full h-full bg-solar-orange rounded-full animate-ping opacity-40" />
            <span className="relative text-white text-sm font-bold">i</span>
          </button>

          <Image
            src={currentPackage.equipment.inverter.image}
            alt="Inversor"
            width={240}
            height={300}
            className="object-contain"
          />
        </div>
      </div>

      {/* Hint text */}
      <div className="absolute bottom-3 left-0 right-0 text-center">
        <p className="inline-flex items-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 bg-solar-orange rounded-full animate-pulse" />
          Clique nos pontos para ver detalhes
        </p>
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
                    {activeModal === 'inverter' && 'Inversor'}
                    {activeModal === 'battery' && 'Bateria de Armazenamento'}
                  </span>
                  <h3 className="text-xl font-bold mt-1">
                    {activeModal === 'panel' && `${currentPackage.equipment.panels.brand} ${currentPackage.equipment.panels.model}`}
                    {activeModal === 'inverter' && `${currentPackage.equipment.inverter.brand} ${currentPackage.equipment.inverter.model}`}
                    {activeModal === 'battery' && currentPackage.equipment.battery && `${currentPackage.equipment.battery.brand} ${currentPackage.equipment.battery.model}`}
                  </h3>
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
            <div className="p-5">
              {/* Panel Modal Content */}
              {activeModal === 'panel' && (
                <>
                  {/* Key Parameters */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-solar-gray rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-solar-blue">{currentPackage.equipment.panels.quantity}</div>
                      <div className="text-xs text-gray-500">Painéis</div>
                    </div>
                    <div className="bg-solar-gray rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-solar-blue">{currentPackage.equipment.panels.wattage}W</div>
                      <div className="text-xs text-gray-500">Por painel</div>
                    </div>
                    <div className="bg-solar-gray rounded-lg p-3 text-center col-span-2">
                      <div className="text-2xl font-bold text-solar-orange">{currentPackage.power} kWp</div>
                      <div className="text-xs text-gray-500">Potência total do sistema</div>
                    </div>
                  </div>

                  {/* What it means */}
                  <div className="bg-blue-50 border-l-4 border-solar-blue rounded-r-lg p-4 mb-5">
                    <h4 className="font-semibold text-solar-blue mb-1">O que significa para si?</h4>
                    <p className="text-sm text-gray-600">
                      Com {currentPackage.power} kWp de potência instalada, este sistema pode gerar até {Math.round(currentPackage.power * 1400 / 12)} kWh por mês, reduzindo significativamente a sua fatura de eletricidade.
                    </p>
                  </div>

                  {/* Installation includes */}
                  <div>
                    <h4 className="font-semibold text-solar-blue mb-2">Instalação inclui:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Estrutura de montagem em alumínio
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Cabos e conectores solares
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Garantia de {currentPackage.warranty} anos
                      </li>
                    </ul>
                  </div>
                </>
              )}

              {/* Inverter Modal Content */}
              {activeModal === 'inverter' && (
                <>
                  {/* Key Parameters */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-solar-gray rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-solar-blue">{currentPackage.equipment.inverter.power}</div>
                      <div className="text-xs text-gray-500">Potência</div>
                    </div>
                    <div className="bg-solar-gray rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-solar-blue">98%</div>
                      <div className="text-xs text-gray-500">Eficiência</div>
                    </div>
                    <div className="bg-solar-gray rounded-lg p-3 text-center col-span-2">
                      <div className="text-lg font-bold text-solar-orange">Monitorização via App</div>
                      <div className="text-xs text-gray-500">Acompanhe a produção em tempo real</div>
                    </div>
                  </div>

                  {/* What it means */}
                  <div className="bg-blue-50 border-l-4 border-solar-blue rounded-r-lg p-4 mb-5">
                    <h4 className="font-semibold text-solar-blue mb-1">O que significa para si?</h4>
                    <p className="text-sm text-gray-600">
                      O inversor converte a energia dos painéis para uso doméstico. Com a app, pode ver quanto está a produzir e poupar em tempo real.
                    </p>
                  </div>

                  {/* Installation includes */}
                  <div>
                    <h4 className="font-semibold text-solar-blue mb-2">Instalação inclui:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Instalação e configuração completa
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Ligação à rede elétrica
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Garantia de 10 anos
                      </li>
                    </ul>
                  </div>
                </>
              )}

              {/* Battery Modal Content */}
              {activeModal === 'battery' && currentPackage.equipment.battery && (
                <>
                  {/* Key Parameters */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-solar-gray rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-solar-blue">{currentPackage.equipment.battery.capacity}</div>
                      <div className="text-xs text-gray-500">Capacidade</div>
                    </div>
                    <div className="bg-solar-gray rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-solar-blue">10+</div>
                      <div className="text-xs text-gray-500">Anos de vida útil</div>
                    </div>
                    <div className="bg-solar-gray rounded-lg p-3 text-center col-span-2">
                      <div className="text-lg font-bold text-solar-orange">Independência Energética</div>
                      <div className="text-xs text-gray-500">Use energia solar mesmo à noite</div>
                    </div>
                  </div>

                  {/* What it means */}
                  <div className="bg-blue-50 border-l-4 border-solar-blue rounded-r-lg p-4 mb-5">
                    <h4 className="font-semibold text-solar-blue mb-1">O que significa para si?</h4>
                    <p className="text-sm text-gray-600">
                      A bateria armazena energia excedente para usar à noite ou em dias nublados. Reduz ainda mais a sua dependência da rede elétrica.
                    </p>
                  </div>

                  {/* Installation includes */}
                  <div>
                    <h4 className="font-semibold text-solar-blue mb-2">Instalação inclui:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Sistema de gestão de bateria (BMS)
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Integração com o inversor
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Garantia de 10 anos
                      </li>
                    </ul>
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
