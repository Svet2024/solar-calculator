'use client'

import { useState, useCallback, useRef, TouchEvent, useEffect } from 'react'
import { Package } from '@/data/packages'

interface PackageCarouselProps {
  packages: Package[]
  currentIndex: number
  onIndexChange: (index: number) => void
  onSelect: (pkg: Package) => void
  electricityBill: number
}

interface DeltaValues {
  savings: number
  coverage: number
  production: number
  payback: number
}

export default function PackageCarousel({
  packages,
  currentIndex,
  onIndexChange,
  onSelect,
  electricityBill,
}: PackageCarouselProps) {
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const [animatedValues, setAnimatedValues] = useState({
    savings: 0,
    coverage: 0,
    production: 0
  })
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null)
  const [deltas, setDeltas] = useState<DeltaValues>({ savings: 0, coverage: 0, production: 0, payback: 0 })
  const [showDeltas, setShowDeltas] = useState(false)
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set())
  const prevIndexRef = useRef<number>(currentIndex)
  const prevValuesRef = useRef<{ savings: number; coverage: number; production: number; payback: number } | null>(null)

  const currentPackage = packages[currentIndex]

  // Calculate values based on package
  const monthlySavings = currentPackage.monthlySavings
  const yearlySavings = monthlySavings * 12
  const paybackYears = currentPackage.paybackYears
  const coveragePercent = Math.min(Math.round((monthlySavings / electricityBill) * 100), 100)
  const monthlyProduction = Math.round(currentPackage.power * 1400 / 12) // kWh/month estimate
  const batteryCapacity = currentPackage.equipment.battery?.capacity || 'Sem bateria'

  // Calculate and show deltas when package changes
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex && prevValuesRef.current) {
      const newDeltas: DeltaValues = {
        savings: monthlySavings - prevValuesRef.current.savings,
        coverage: coveragePercent - prevValuesRef.current.coverage,
        production: monthlyProduction - prevValuesRef.current.production,
        payback: paybackYears - prevValuesRef.current.payback,
      }

      setDeltas(newDeltas)
      setShowDeltas(true)

      // Highlight changed fields
      const changedFields = new Set<string>()
      if (newDeltas.savings !== 0) changedFields.add('savings')
      if (newDeltas.coverage !== 0) changedFields.add('coverage')
      if (newDeltas.production !== 0) changedFields.add('production')
      if (newDeltas.payback !== 0) changedFields.add('payback')
      setHighlightedFields(changedFields)

      // Hide deltas after 600ms
      const timer = setTimeout(() => {
        setShowDeltas(false)
        setHighlightedFields(new Set())
      }, 600)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, monthlySavings, coveragePercent, monthlyProduction, paybackYears])

  // Store previous values before change
  useEffect(() => {
    prevValuesRef.current = {
      savings: monthlySavings,
      coverage: coveragePercent,
      production: monthlyProduction,
      payback: paybackYears,
    }
    prevIndexRef.current = currentIndex
  }, [currentIndex, monthlySavings, coveragePercent, monthlyProduction, paybackYears])

  // Animate values on package change
  useEffect(() => {
    setAnimatedValues({ savings: 0, coverage: 0, production: 0 })

    const duration = 800
    const steps = 30
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const easeOut = 1 - Math.pow(1 - progress, 3)

      setAnimatedValues({
        savings: Math.round(monthlySavings * easeOut),
        coverage: Math.round(coveragePercent * easeOut),
        production: Math.round(monthlyProduction * easeOut)
      })

      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [currentIndex, monthlySavings, coveragePercent, monthlyProduction])

  // Helper to format delta
  const formatDelta = (value: number, suffix: string = '') => {
    if (value === 0) return null
    const sign = value > 0 ? '+' : ''
    return `${sign}${value}${suffix}`
  }

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

  // Get brand names for display
  const getBrands = () => {
    const brands = [currentPackage.equipment.inverter.brand]
    if (currentPackage.equipment.battery) {
      brands.push(currentPackage.equipment.battery.brand)
    }
    return brands.join(' + ')
  }

  return (
    <div
      className="flex flex-col flex-1"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={goToPrevious}
          className="p-2 hover:bg-solar-gray rounded-full transition-colors flex-shrink-0"
          aria-label="Anterior"
        >
          <svg className="w-6 h-6 text-solar-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center flex-1">
          <h3 className="text-2xl font-bold text-solar-blue">
            {currentPackage.name}
          </h3>
          <p className="text-sm text-gray-500">
            {getBrands()}
          </p>
          {currentPackage.recommended && (
            <span className="inline-block mt-1 px-3 py-1 bg-solar-orange text-white text-xs font-bold rounded-full">
              Recomendado
            </span>
          )}
        </div>

        <button
          onClick={goToNext}
          className="p-2 hover:bg-solar-gray rounded-full transition-colors flex-shrink-0"
          aria-label="Seguinte"
        >
          <svg className="w-6 h-6 text-solar-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mb-3">
        {packages.map((_, index) => (
          <button
            key={index}
            onClick={() => onIndexChange(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-solar-orange scale-125' : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Ir para pacote ${index + 1}`}
          />
        ))}
      </div>

      {/* Animated Summary Stats - Savings, Payback, Coverage */}
      <div className="animated-border mb-3">
        <div className="bg-white rounded-xl p-3">
          <div className="grid grid-cols-3 gap-2">
            {/* Savings */}
            <div className={`text-center group cursor-default relative transition-all duration-300 rounded-lg ${highlightedFields.has('savings') ? 'bg-green-50 ring-2 ring-green-300' : ''}`}>
              <div className="relative">
                <div className="text-2xl font-bold text-green-600 transition-transform group-hover:scale-110">
                  €{animatedValues.savings}
                </div>
                {showDeltas && deltas.savings !== 0 && (
                  <span className={`absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-fade-in ${deltas.savings > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {formatDelta(deltas.savings, '€')}
                  </span>
                )}
                <div className="text-xs text-gray-400">€{yearlySavings}/ano</div>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Poupança/mês
              </div>
            </div>

            {/* Payback */}
            <div className={`text-center border-x border-gray-200 group cursor-default relative transition-all duration-300 rounded-lg ${highlightedFields.has('payback') ? 'bg-blue-50 ring-2 ring-blue-300' : ''}`}>
              <div className="text-2xl font-bold text-solar-blue transition-transform group-hover:scale-110 relative">
                {paybackYears}-{paybackYears + 2}
                {showDeltas && deltas.payback !== 0 && (
                  <span className={`absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-fade-in ${deltas.payback < 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {formatDelta(deltas.payback, ' anos')}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <svg className="w-3 h-3 text-solar-blue" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Anos retorno
              </div>
            </div>

            {/* Coverage */}
            <div className={`text-center group cursor-default relative transition-all duration-300 rounded-lg ${highlightedFields.has('coverage') ? 'bg-orange-50 ring-2 ring-orange-300' : ''}`}>
              <div className="relative">
                <div className="text-2xl font-bold text-solar-orange transition-transform group-hover:scale-110">
                  {animatedValues.coverage}%
                </div>
                {showDeltas && deltas.coverage !== 0 && (
                  <span className={`absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-fade-in ${deltas.coverage > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {formatDelta(deltas.coverage, '%')}
                  </span>
                )}
                {/* Mini progress bar */}
                <div className="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-solar-orange rounded-full transition-all duration-700"
                    style={{ width: `${animatedValues.coverage}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <svg className="w-3 h-3 text-solar-orange" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                </svg>
                Cobertura
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Characteristics - Power, Battery, Production */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {/* Panel Power */}
        <div className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2.5 text-center hover:shadow-md transition-all duration-300 cursor-default group ${highlightedFields.has('production') ? 'ring-2 ring-blue-400' : ''}`}>
          <div className="w-8 h-8 mx-auto mb-1 bg-solar-blue rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
            </svg>
          </div>
          <div className="text-lg font-bold text-solar-blue">{currentPackage.power} kWp</div>
          <div className="text-[10px] text-gray-500">Potência instalada</div>
        </div>

        {/* Battery */}
        <div className={`rounded-lg p-2.5 text-center hover:shadow-md transition-shadow cursor-default group ${
          currentPackage.equipment.battery
            ? 'bg-gradient-to-br from-green-50 to-green-100'
            : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}>
          <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
            currentPackage.equipment.battery ? 'bg-green-600' : 'bg-gray-400'
          }`}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.5a1 1 0 00-.5.13V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v.13A1 1 0 009.5 4H4zm8 6a1 1 0 01-1 1H6a1 1 0 110-2h5a1 1 0 011 1z" />
            </svg>
          </div>
          <div className={`text-lg font-bold ${currentPackage.equipment.battery ? 'text-green-600' : 'text-gray-400'}`}>
            {batteryCapacity}
          </div>
          <div className="text-[10px] text-gray-500">Armazenamento</div>
        </div>

        {/* Monthly Production */}
        <div className={`bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-2.5 text-center hover:shadow-md transition-all duration-300 cursor-default group relative ${highlightedFields.has('production') ? 'ring-2 ring-orange-400' : ''}`}>
          <div className="w-8 h-8 mx-auto mb-1 bg-solar-orange rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-lg font-bold text-solar-orange relative inline-block">
            {animatedValues.production}
            {showDeltas && deltas.production !== 0 && (
              <span className={`absolute -top-2 -right-6 text-[9px] font-bold px-1 py-0.5 rounded-full animate-fade-in whitespace-nowrap ${deltas.production > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {formatDelta(deltas.production)}
              </span>
            )}
          </div>
          <div className="text-[10px] text-gray-500">kWh/mês produção</div>
        </div>
      </div>

      {/* Production vs Consumption Chart */}
      <div className="bg-white rounded-lg p-3 mb-3 border border-gray-100">
        {/* Legend */}
        <div className="flex justify-center gap-6 mb-2 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-solar-blue rounded" />
            <span className="text-gray-600">Geração (kWh/mês)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-gray-300 rounded" />
            <span className="text-gray-600">Consumo (kWh/mês)</span>
          </div>
        </div>

        {/* Chart */}
        {(() => {
          const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
          // Production: peak in summer (Jun-Aug), based on panel count
          const productionFactors = [0.50, 0.60, 0.75, 0.90, 1.00, 1.12, 1.18, 1.12, 0.92, 0.72, 0.55, 0.45]
          // Consumption: based on electricity bill, peak in winter (Dec-Feb)
          const consumptionFactors = [1.20, 1.15, 1.00, 0.85, 0.72, 0.65, 0.60, 0.65, 0.75, 0.88, 1.05, 1.25]

          // Consumption from electricity bill (€ to kWh estimate)
          const baseConsumption = electricityBill * 2
          const consumptions = consumptionFactors.map(f => Math.round(baseConsumption * f))

          // Production from panels (kWp * sun hours factor)
          const productions = productionFactors.map(f => Math.round(monthlyProduction * f))

          const maxValue = Math.max(...productions, ...consumptions) * 1.15
          const chartHeight = 120

          // Create SVG path for smooth consumption curve
          const points = consumptions.map((c, i) => {
            const x = (i / (consumptions.length - 1)) * 100
            const y = chartHeight - (c / maxValue) * chartHeight
            return { x, y, value: c }
          })

          // Smooth bezier curve
          let pathD = `M 0 ${chartHeight} L 0 ${points[0].y}`
          for (let i = 0; i < points.length - 1; i++) {
            const cp1x = points[i].x + (points[i + 1].x - points[i].x) / 3
            const cp2x = points[i].x + 2 * (points[i + 1].x - points[i].x) / 3
            pathD += ` C ${cp1x} ${points[i].y}, ${cp2x} ${points[i + 1].y}, ${points[i + 1].x} ${points[i + 1].y}`
          }
          pathD += ` L 100 ${chartHeight} Z`

          return (
            <div className="relative" style={{ height: '160px' }}>
              {/* Consumption area (smooth curve in background) */}
              <svg
                className="absolute top-0 left-0 w-full"
                style={{ height: `${chartHeight}px` }}
                viewBox={`0 0 100 ${chartHeight}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="consumptionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#D1D5DB" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#D1D5DB" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <path d={pathD} fill="url(#consumptionGradient)" />
                <path
                  d={pathD.replace(/ L 100 \d+ Z$/, '')}
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="0.8"
                />
              </svg>

              {/* Production bars (foreground) */}
              <div
                className="absolute top-0 left-0 right-0 flex items-end justify-between gap-1 px-1"
                style={{ height: `${chartHeight}px` }}
              >
                {months.map((month, index) => {
                  const production = productions[index]
                  const consumption = consumptions[index]
                  const barHeight = (production / maxValue) * chartHeight
                  const isHovered = hoveredMonth === index

                  return (
                    <div
                      key={month}
                      className="flex-1 flex items-end justify-center cursor-pointer relative"
                      style={{ height: `${chartHeight}px` }}
                      onMouseEnter={() => setHoveredMonth(index)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-solar-blue text-white text-[9px] px-2 py-1 rounded shadow-lg z-30 whitespace-nowrap">
                          <div>Geração: {production} kWh</div>
                          <div>Consumo: {consumption} kWh</div>
                        </div>
                      )}

                      {/* Production bar */}
                      <div
                        className={`w-[75%] rounded-t-sm transition-all duration-200 ${
                          isHovered ? 'bg-solar-blue' : 'bg-solar-blue/80'
                        }`}
                        style={{ height: `${barHeight}px` }}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Month labels */}
              <div
                className="absolute left-0 right-0 flex justify-between px-1"
                style={{ top: `${chartHeight + 4}px` }}
              >
                {months.map((month, index) => (
                  <span
                    key={month}
                    className={`text-[8px] flex-1 text-center transition-colors ${
                      hoveredMonth === index ? 'text-solar-blue font-bold' : 'text-gray-400'
                    }`}
                  >
                    {month}
                  </span>
                ))}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Price and CTA - Sticky decision zone */}
      <div className="mt-auto pt-3 sticky bottom-0 bg-white pb-2">
        <div className="text-center mb-2">
          <div className="text-xs text-gray-500 mb-0.5">Sob chave</div>
          <span className="text-4xl font-bold text-solar-orange">
            €{currentPackage.price.toLocaleString()}
          </span>
          <span className="text-sm text-gray-400 ml-2">(IVA incluído)</span>
        </div>
        <button
          onClick={() => onSelect(currentPackage)}
          className="w-full bg-solar-orange hover:bg-solar-orange-hover text-white font-bold py-3.5 px-6 rounded-full transition-all hover:scale-[1.02] hover:shadow-lg text-lg"
        >
          Pedir orçamento
        </button>
        <p className="text-center text-[11px] text-gray-400 mt-2">
          Sem compromisso. Contacto em 24h.
        </p>
      </div>

    </div>
  )
}
