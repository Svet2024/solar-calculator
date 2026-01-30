'use client'

import { useState, useCallback, useRef, TouchEvent, useEffect, useMemo } from 'react'
import {
  type GridType,
  type RoofType,
  type BrandType,
  type HuaweiPackageConfig,
  type DeyePackageConfig,
  getAvailableDeyePackages,
  getAvailableHuaweiPackages,
  getDeyePrice,
  getHuaweiPrice,
  findRecommendedIndex,
  calculatePower,
  calculateMonthlyProduction,
  calculateMonthlySavings,
  calculatePaybackYears,
  getMonthlyProductionArray,
} from '@/data/packages'
import { panels, getDeyeInverter, getHuaweiInverter, getDeyeBattery, huaweiBattery } from '@/data/equipment'

// Current package info for equipment display
export interface CurrentPackageInfo {
  panelCount: number
  inverterKw: number
  batteryKwh: number | null
}

interface PackageCarouselProps {
  currentIndex: number
  onIndexChange: (index: number) => void
  onSelect: (pkg: SelectedPackage) => void
  onCurrentPackageChange: (info: CurrentPackageInfo) => void
  electricityBill: number
  gridType: GridType
  roofType: RoofType
  selectedBrand: BrandType
  onBrandChange: (brand: BrandType) => void
  hasBattery: boolean
  onBatteryChange: (hasBattery: boolean) => void
}

// Package data sent to CRM
export interface SelectedPackage {
  id: string
  brand: BrandType
  panelCount: number
  price: number
  power: number
  hasBattery: boolean
  batteryCapacity: string | null
}

interface DeltaValues {
  savings: number
  coverage: number
  production: number
  payback: number
}

export default function PackageCarousel({
  currentIndex,
  onIndexChange,
  onSelect,
  onCurrentPackageChange,
  electricityBill,
  gridType,
  roofType,
  selectedBrand,
  onBrandChange,
  hasBattery,
  onBatteryChange,
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

  // Get available packages based on brand, grid type, and roof type
  // Reorder so recommended package is first
  const availablePackages = useMemo(() => {
    const packages = selectedBrand === 'deye'
      ? getAvailableDeyePackages(gridType, roofType)
      : getAvailableHuaweiPackages(gridType, roofType, hasBattery)

    // Find recommended index in original array
    const recIdx = findRecommendedIndex(packages, electricityBill)

    // Reorder: recommended first, then others
    if (recIdx > 0 && recIdx < packages.length) {
      const recommended = packages[recIdx]
      const before = packages.slice(0, recIdx)
      const after = packages.slice(recIdx + 1)
      return [recommended, ...before, ...after]
    }
    return packages
  }, [selectedBrand, gridType, roofType, hasBattery, electricityBill])

  // Ensure currentIndex is valid
  useEffect(() => {
    if (currentIndex >= availablePackages.length) {
      onIndexChange(Math.max(0, availablePackages.length - 1))
    }
  }, [availablePackages.length, currentIndex, onIndexChange])

  // Get current package
  const currentPackage = availablePackages[currentIndex] || availablePackages[0]
  if (!currentPackage) return null

  // Calculate price based on brand
  const price = selectedBrand === 'deye'
    ? getDeyePrice(currentPackage as DeyePackageConfig, gridType, roofType) || 0
    : getHuaweiPrice(currentPackage as HuaweiPackageConfig, gridType, roofType, hasBattery) || 0

  // Calculate values based on package
  const powerKwp = calculatePower(currentPackage.panelCount)
  const monthlyProduction = calculateMonthlyProduction(currentPackage.panelCount)
  const monthlySavings = calculateMonthlySavings(monthlyProduction)
  const yearlySavings = monthlySavings * 12
  const paybackYears = calculatePaybackYears(price, monthlySavings)
  const coveragePercent = Math.min(Math.round((monthlySavings / electricityBill) * 100), 100)

  // Get battery info
  const getBatteryCapacity = () => {
    if (selectedBrand === 'deye') {
      const deyePkg = currentPackage as DeyePackageConfig
      return `${deyePkg.batteryKwh} kWh`
    } else if (hasBattery) {
      return huaweiBattery.capacity
    }
    return null
  }
  const batteryCapacity = getBatteryCapacity()

  // Get panel info
  const panelInfo = panels[roofType]

  // Get inverter info
  const inverterInfo = selectedBrand === 'deye'
    ? getDeyeInverter(currentPackage.inverterKw)
    : getHuaweiInverter(currentPackage.inverterKw)

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

      const changedFields = new Set<string>()
      if (newDeltas.savings !== 0) changedFields.add('savings')
      if (newDeltas.coverage !== 0) changedFields.add('coverage')
      if (newDeltas.production !== 0) changedFields.add('production')
      if (newDeltas.payback !== 0) changedFields.add('payback')
      setHighlightedFields(changedFields)

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

  // Notify parent of current package info for equipment display
  useEffect(() => {
    const batteryKwh = selectedBrand === 'deye'
      ? (currentPackage as DeyePackageConfig).batteryKwh
      : hasBattery ? 7 : null

    onCurrentPackageChange({
      panelCount: currentPackage.panelCount,
      inverterKw: currentPackage.inverterKw,
      batteryKwh,
    })
  }, [currentPackage, selectedBrand, hasBattery, onCurrentPackageChange])

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
  }, [currentIndex, monthlySavings, coveragePercent, monthlyProduction, selectedBrand, hasBattery])

  // Helper to format delta
  const formatDelta = (value: number, suffix: string = '') => {
    if (value === 0) return null
    const sign = value > 0 ? '+' : ''
    return `${sign}${value}${suffix}`
  }

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? availablePackages.length - 1 : currentIndex - 1
    onIndexChange(newIndex)
  }, [currentIndex, availablePackages.length, onIndexChange])

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === availablePackages.length - 1 ? 0 : currentIndex + 1
    onIndexChange(newIndex)
  }, [currentIndex, availablePackages.length, onIndexChange])

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

  // Handle package selection
  const handleSelect = () => {
    onSelect({
      id: currentPackage.id,
      brand: selectedBrand,
      panelCount: currentPackage.panelCount,
      price,
      power: powerKwp,
      hasBattery: selectedBrand === 'deye' ? true : hasBattery,
      batteryCapacity,
    })
  }

  // Find recommended index for current bill
  // Recommended is always first after reordering
  const recommendedIndex = 0

  return (
    <div
      className="flex flex-col flex-1"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Brand Selection */}
      <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Escolha a marca do equipamento
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onBrandChange('deye')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all border-2 ${
              selectedBrand === 'deye'
                ? 'bg-solar-orange text-white border-solar-orange shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              Deye
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                selectedBrand === 'deye' ? 'bg-white/20' : 'bg-solar-orange/10 text-solar-orange'
              }`}>
                Recomendado
              </span>
            </span>
          </button>
          <button
            onClick={() => onBrandChange('huawei')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all border-2 ${
              selectedBrand === 'huawei'
                ? 'bg-solar-blue text-white border-solar-blue shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            Huawei
          </button>
        </div>
      </div>

      {/* Battery Option (only for Huawei) */}
      {selectedBrand === 'huawei' && (
        <div className="mb-3">
          <button
            onClick={() => onBatteryChange(!hasBattery)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
              hasBattery
                ? 'bg-green-50 border-green-400 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                hasBattery ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.5a1 1 0 00-.5.13V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v.13A1 1 0 009.5 4H4zm8 6a1 1 0 01-1 1H6a1 1 0 110-2h5a1 1 0 011 1z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">
                  {hasBattery ? 'Com bateria incluída' : 'Sem bateria'}
                </div>
                <div className="text-xs opacity-75">
                  {hasBattery ? 'Huawei Luna 7 kWh' : 'Clique para adicionar'}
                </div>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${
              hasBattery ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                hasBattery ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </button>
        </div>
      )}

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
            {currentPackage.panelCount} Painéis
          </h3>
          <p className="text-sm text-gray-500">
            {panelInfo.brand} {panelInfo.wattage}W + {inverterInfo.brand}
          </p>
          {currentIndex === recommendedIndex && (
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
        {availablePackages.map((_, index) => (
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
                Autoconsumo
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
          <div className="text-lg font-bold text-solar-blue">{powerKwp.toFixed(1)} kWp</div>
          <div className="text-[10px] text-gray-500">Potência instalada</div>
        </div>

        {/* Battery */}
        <div className={`rounded-lg p-2.5 text-center hover:shadow-md transition-shadow cursor-default group ${
          batteryCapacity
            ? 'bg-gradient-to-br from-green-50 to-green-100'
            : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}>
          <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
            batteryCapacity ? 'bg-green-600' : 'bg-gray-400'
          }`}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.5a1 1 0 00-.5.13V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v.13A1 1 0 009.5 4H4zm8 6a1 1 0 01-1 1H6a1 1 0 110-2h5a1 1 0 011 1z" />
            </svg>
          </div>
          <div className={`text-lg font-bold ${batteryCapacity ? 'text-green-600' : 'text-gray-400'}`}>
            {batteryCapacity || 'Sem bateria'}
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
          // Consumption varies seasonally (higher in winter for heating, lower in summer)
          const consumptionFactors = [1.20, 1.15, 1.00, 0.85, 0.72, 0.65, 0.60, 0.65, 0.75, 0.88, 1.05, 1.25]

          // Get monthly production based on panel count (real Portugal data)
          const productions = getMonthlyProductionArray(currentPackage.panelCount)

          // Estimate monthly consumption from bill (€0.24/kWh average)
          const avgMonthlyConsumption = Math.round(electricityBill / 0.24)
          const consumptions = consumptionFactors.map(f => Math.round(avgMonthlyConsumption * f))

          const maxValue = Math.max(...productions, ...consumptions) * 1.15
          const chartHeight = 120

          const points = consumptions.map((c, i) => {
            const x = (i / (consumptions.length - 1)) * 100
            const y = chartHeight - (c / maxValue) * chartHeight
            return { x, y, value: c }
          })

          let pathD = `M 0 ${chartHeight} L 0 ${points[0].y}`
          for (let i = 0; i < points.length - 1; i++) {
            const cp1x = points[i].x + (points[i + 1].x - points[i].x) / 3
            const cp2x = points[i].x + 2 * (points[i + 1].x - points[i].x) / 3
            pathD += ` C ${cp1x} ${points[i].y}, ${cp2x} ${points[i + 1].y}, ${points[i + 1].x} ${points[i + 1].y}`
          }
          pathD += ` L 100 ${chartHeight} Z`

          return (
            <div className="relative" style={{ height: '160px' }}>
              {/* Consumption area */}
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

              {/* Production bars */}
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
                      {isHovered && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-solar-blue text-white text-[9px] px-2 py-1 rounded shadow-lg z-30 whitespace-nowrap">
                          <div>Geração: {production} kWh</div>
                          <div>Consumo: {consumption} kWh</div>
                        </div>
                      )}
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

      {/* Price and CTA */}
      <div className="mt-auto pt-3 sticky bottom-0 bg-white pb-2">
        <div className="text-center mb-2">
          <div className="text-xs text-gray-500 mb-0.5">Sistema «chave na mão»</div>
          <span className="text-4xl font-bold text-solar-orange">
            €{price.toLocaleString()}
          </span>
          <span className="text-sm text-gray-400 ml-2">(IVA incluído)</span>
        </div>
        <button
          onClick={handleSelect}
          className="w-full bg-solar-orange hover:bg-solar-orange-hover text-white font-bold py-3.5 px-6 rounded-full transition-all hover:scale-[1.02] hover:shadow-lg text-lg"
        >
          Receber uma proposta
        </button>
        <p className="text-center text-[11px] text-gray-400 mt-2">
          Sem compromisso. Contacto em 24h.
        </p>
      </div>
    </div>
  )
}
