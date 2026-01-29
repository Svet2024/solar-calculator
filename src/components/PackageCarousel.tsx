'use client'

import { useState, useCallback, useRef, TouchEvent } from 'react'
import { Package } from '@/data/packages'

interface PackageCarouselProps {
  packages: Package[]
  currentIndex: number
  onIndexChange: (index: number) => void
  onSelect: (pkg: Package) => void
}

export default function PackageCarousel({
  packages,
  currentIndex,
  onIndexChange,
  onSelect,
}: PackageCarouselProps) {
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  const currentPackage = packages[currentIndex]

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? packages.length - 1 : currentIndex - 1
    onIndexChange(newIndex)
  }, [currentIndex, packages.length, onIndexChange])

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === packages.length - 1 ? 0 : currentIndex + 1
    onIndexChange(newIndex)
  }, [currentIndex, packages.length, onIndexChange])

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        goToNext()
      } else {
        goToPrevious()
      }
    }
  }

  return (
    <div
      className="flex flex-col h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevious}
          className="p-2 hover:bg-solar-gray rounded-full transition-colors"
          aria-label="Anterior"
        >
          <svg className="w-6 h-6 text-solar-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-solar-blue">
            {currentPackage.name}
          </h3>
          <p className="text-3xl font-bold text-solar-orange">
            €{currentPackage.price.toLocaleString()}
          </p>
          {currentPackage.recommended && (
            <span className="inline-block mt-1 px-3 py-1 bg-solar-orange text-white text-xs font-bold rounded-full">
              Recomendado
            </span>
          )}
        </div>

        <button
          onClick={goToNext}
          className="p-2 hover:bg-solar-gray rounded-full transition-colors"
          aria-label="Seguinte"
        >
          <svg className="w-6 h-6 text-solar-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mb-6">
        {packages.map((_, index) => (
          <button
            key={index}
            onClick={() => onIndexChange(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-solar-orange' : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Ir para pacote ${index + 1}`}
          />
        ))}
      </div>

      {/* Package details */}
      <div className="flex-1 space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-solar-gray rounded-lg p-3">
            <div className="text-sm text-gray-500">Potência</div>
            <div className="text-lg font-bold text-solar-blue">{currentPackage.power} kWp</div>
          </div>
          <div className="bg-solar-gray rounded-lg p-3">
            <div className="text-sm text-gray-500">Economia/mês</div>
            <div className="text-lg font-bold text-green-600">€{currentPackage.monthlySavings}</div>
          </div>
          <div className="bg-solar-gray rounded-lg p-3">
            <div className="text-sm text-gray-500">Retorno</div>
            <div className="text-lg font-bold text-solar-blue">{currentPackage.paybackYears} anos</div>
          </div>
          <div className="bg-solar-gray rounded-lg p-3">
            <div className="text-sm text-gray-500">Garantia</div>
            <div className="text-lg font-bold text-solar-blue">{currentPackage.warranty} anos</div>
          </div>
        </div>

        {/* Equipment list */}
        <div className="bg-solar-gray rounded-lg p-4">
          <h4 className="text-sm font-semibold text-solar-blue mb-3">Equipamento incluído:</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-solar-orange">•</span>
              <span className="text-gray-700">
                {currentPackage.equipment.panels.quantity}x Painel {currentPackage.equipment.panels.brand} {currentPackage.equipment.panels.wattage}W
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-solar-orange">•</span>
              <span className="text-gray-700">
                Inversor {currentPackage.equipment.inverter.brand} {currentPackage.equipment.inverter.power}
              </span>
            </li>
            {currentPackage.equipment.battery && (
              <li className="flex items-start gap-2">
                <span className="text-solar-orange">•</span>
                <span className="text-gray-700">
                  Bateria {currentPackage.equipment.battery.brand} {currentPackage.equipment.battery.capacity}
                </span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-solar-orange">•</span>
              <span className="text-gray-700">Instalação completa incluída</span>
            </li>
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onSelect(currentPackage)}
        className="w-full bg-solar-orange hover:bg-solar-orange-hover text-white font-bold py-4 px-6 rounded-full transition-colors text-lg mt-4"
      >
        Pedir orçamento
      </button>

      {/* Swipe hint on mobile */}
      <p className="text-center text-xs text-gray-400 mt-2 lg:hidden">
        Deslize para ver outros pacotes
      </p>
    </div>
  )
}
