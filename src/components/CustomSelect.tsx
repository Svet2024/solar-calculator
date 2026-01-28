'use client'

import { useState, useRef, useEffect } from 'react'

interface Option {
  value: string
  label: string
  icon?: string
}

interface CustomSelectProps {
  label: string
  options: Option[]
  value: string
  onChange: (value: string) => void
}

export default function CustomSelect({ label, options, value, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(o => o.value === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="mb-5" ref={ref}>
      <label className="block text-sm font-semibold text-solar-blue mb-2">
        {label}
      </label>
      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-solar-gray rounded-lg px-4 py-3 text-left text-solar-blue flex items-center justify-between hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-solar-orange"
        >
          <span className="flex items-center gap-2">
            {selectedOption?.icon && <span className="text-lg">{selectedOption.icon}</span>}
            {selectedOption?.label}
          </span>
          <svg
            className={`w-4 h-4 text-solar-blue transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left flex items-center gap-2 transition-colors
                  ${option.value === value
                    ? 'bg-solar-orange text-white'
                    : 'text-solar-blue hover:bg-solar-gray'
                  }`}
              >
                {option.icon && <span className="text-lg">{option.icon}</span>}
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
