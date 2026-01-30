// Types
export type GridType = 'monofasica' | 'trifasica'
export type RoofType = 'inclinada' | 'plana'
export type BrandType = 'huawei' | 'deye'

// Huawei package config (with and without battery)
export interface HuaweiPackageConfig {
  id: string
  panelCount: number
  inverterKw: number
  prices: {
    mono_inclinada: number | null
    mono_plana: number | null
    tri_inclinada: number | null
    tri_plana: number | null
    mono_inclinada_battery: number | null
    mono_plana_battery: number | null
    tri_inclinada_battery: number | null
    tri_plana_battery: number | null
  }
  minBill: number
  maxBill?: number
}

// Deye package config (ONLY with battery)
export interface DeyePackageConfig {
  id: string
  panelCount: number
  inverterKw: number
  batteryKwh: number // 5, 10, or 16 kWh
  prices: {
    mono_inclinada: number | null
    mono_plana: number | null
    tri_inclinada: number | null
    tri_plana: number | null
  }
  minBill: number
  maxBill?: number
}

// ===== HUAWEI PACKAGES =====
// Bill ranges: €100-120→6, €120-180→8, €180-250→10, €250-320→12, €320-400→16, €400+→20
export const huaweiPackages: HuaweiPackageConfig[] = [
  {
    id: 'huawei-6',
    panelCount: 6,
    inverterKw: 3,
    prices: {
      mono_inclinada: 3610,
      mono_plana: 3830,
      tri_inclinada: 3980,
      tri_plana: 4190,
      mono_inclinada_battery: 9280,
      mono_plana_battery: 9510,
      tri_inclinada_battery: 9640,
      tri_plana_battery: 9860,
    },
    minBill: 0,
    maxBill: 120,
  },
  {
    id: 'huawei-8',
    panelCount: 8,
    inverterKw: 4,
    prices: {
      mono_inclinada: 4100,
      mono_plana: 4380,
      tri_inclinada: 4460,
      tri_plana: 4750,
      mono_inclinada_battery: 9760,
      mono_plana_battery: 10050,
      tri_inclinada_battery: 10120,
      tri_plana_battery: 10420,
    },
    minBill: 120,
    maxBill: 180,
  },
  {
    id: 'huawei-10',
    panelCount: 10,
    inverterKw: 5,
    prices: {
      mono_inclinada: 5860,
      mono_plana: 6190,
      tri_inclinada: 6110,
      tri_plana: 6470,
      mono_inclinada_battery: 11510,
      mono_plana_battery: 11870,
      tri_inclinada_battery: 11770,
      tri_plana_battery: 12130,
    },
    minBill: 180,
    maxBill: 250,
  },
  {
    id: 'huawei-12',
    panelCount: 12,
    inverterKw: 6,
    prices: {
      mono_inclinada: 6620,
      mono_plana: 7050,
      tri_inclinada: 6690,
      tri_plana: 7120,
      mono_inclinada_battery: 12290,
      mono_plana_battery: 12730,
      tri_inclinada_battery: 12550,
      tri_plana_battery: 12780,
    },
    minBill: 250,
    maxBill: 320,
  },
  {
    id: 'huawei-16',
    panelCount: 16,
    inverterKw: 8,
    prices: {
      mono_inclinada: null,
      mono_plana: null,
      tri_inclinada: 7960,
      tri_plana: 8530,
      mono_inclinada_battery: null,
      mono_plana_battery: null,
      tri_inclinada_battery: 13620,
      tri_plana_battery: 14200,
    },
    minBill: 320,
    maxBill: 400,
  },
  {
    id: 'huawei-20',
    panelCount: 20,
    inverterKw: 10,
    prices: {
      mono_inclinada: null,
      mono_plana: null,
      tri_inclinada: 9520,
      tri_plana: 10250,
      mono_inclinada_battery: null,
      mono_plana_battery: null,
      tri_inclinada_battery: 15190,
      tri_plana_battery: 15900,
    },
    minBill: 400,
    maxBill: undefined,
  },
]

// ===== DEYE PACKAGES (ONLY WITH BATTERY) =====
// Bill ranges: €100-120→6, €120-180→8, €180-250→10, €250-320→12, €320-400→14/16, €400+→16
export const deyePackages: DeyePackageConfig[] = [
  {
    id: 'deye-6',
    panelCount: 6,
    inverterKw: 5,
    batteryKwh: 5,
    prices: {
      mono_inclinada: 6300,
      mono_plana: 6510,
      tri_inclinada: 7400,
      tri_plana: 7610,
    },
    minBill: 0,
    maxBill: 120,
  },
  {
    id: 'deye-8',
    panelCount: 8,
    inverterKw: 5,
    batteryKwh: 5,
    prices: {
      mono_inclinada: 6700,
      mono_plana: 6980,
      tri_inclinada: 7850,
      tri_plana: 8130,
    },
    minBill: 120,
    maxBill: 180,
  },
  {
    id: 'deye-10',
    panelCount: 10,
    inverterKw: 5,
    batteryKwh: 10,
    prices: {
      mono_inclinada: 10020,
      mono_plana: 10370,
      tri_inclinada: 11200,
      tri_plana: 10550,
    },
    minBill: 180,
    maxBill: 250,
  },
  {
    id: 'deye-12',
    panelCount: 12,
    inverterKw: 6,
    batteryKwh: 10,
    prices: {
      mono_inclinada: 10520,
      mono_plana: 10940,
      tri_inclinada: 11700,
      tri_plana: 12120,
    },
    minBill: 250,
    maxBill: 320,
  },
  {
    id: 'deye-14',
    panelCount: 14,
    inverterKw: 8,
    batteryKwh: 10,
    prices: {
      mono_inclinada: null,
      mono_plana: null,
      tri_inclinada: 12200,
      tri_plana: 12620,
    },
    minBill: 320,
    maxBill: 400,
  },
  {
    id: 'deye-16',
    panelCount: 16,
    inverterKw: 10,
    batteryKwh: 16,
    prices: {
      mono_inclinada: null,
      mono_plana: null,
      tri_inclinada: 14000,
      tri_plana: 14220,
    },
    minBill: 400,
    maxBill: undefined,
  },
]

// ===== HELPER FUNCTIONS =====

// Get Huawei price
export function getHuaweiPrice(
  pkg: HuaweiPackageConfig,
  gridType: GridType,
  roofType: RoofType,
  hasBattery: boolean
): number | null {
  const gridKey = gridType === 'monofasica' ? 'mono' : 'tri'
  const key = `${gridKey}_${roofType}${hasBattery ? '_battery' : ''}` as keyof HuaweiPackageConfig['prices']
  return pkg.prices[key]
}

// Get Deye price (always with battery)
export function getDeyePrice(
  pkg: DeyePackageConfig,
  gridType: GridType,
  roofType: RoofType
): number | null {
  const gridKey = gridType === 'monofasica' ? 'mono' : 'tri'
  const key = `${gridKey}_${roofType}` as keyof DeyePackageConfig['prices']
  return pkg.prices[key]
}

// Filter available Huawei packages
export function getAvailableHuaweiPackages(
  gridType: GridType,
  roofType: RoofType,
  hasBattery: boolean
): HuaweiPackageConfig[] {
  return huaweiPackages.filter(
    (pkg) => getHuaweiPrice(pkg, gridType, roofType, hasBattery) !== null
  )
}

// Filter available Deye packages
export function getAvailableDeyePackages(
  gridType: GridType,
  roofType: RoofType
): DeyePackageConfig[] {
  return deyePackages.filter(
    (pkg) => getDeyePrice(pkg, gridType, roofType) !== null
  )
}

// Find recommended package index by bill amount
export function findRecommendedIndex(
  packages: (HuaweiPackageConfig | DeyePackageConfig)[],
  electricityBill: number
): number {
  const index = packages.findIndex(
    (pkg) =>
      electricityBill >= pkg.minBill &&
      (pkg.maxBill === undefined || electricityBill < pkg.maxBill)
  )
  return index >= 0 ? index : Math.floor(packages.length / 2)
}

// Calculate power in kWp (600W panels)
export function calculatePower(panelCount: number): number {
  return (panelCount * 600) / 1000 // kWp
}

// Monthly production per panel (kWh) based on real Portugal data
// Data source: Average daily production for 10 panels, divided by 10, multiplied by days in month
export const monthlyProductionPerPanel = [
  47, // Jan: 1.56 kWh/day × 30
  56, // Feb: 1.99 kWh/day × 28
  73, // Mar: 2.34 kWh/day × 31
  88, // Apr: 2.92 kWh/day × 30
  102, // May: 3.29 kWh/day × 31
  103, // Jun: 3.44 kWh/day × 30
  114, // Jul: 3.69 kWh/day × 31
  111, // Aug: 3.58 kWh/day × 31
  86, // Sep: 2.87 kWh/day × 30
  70, // Oct: 2.27 kWh/day × 31
  54, // Nov: 1.79 kWh/day × 30
  48, // Dec: 1.54 kWh/day × 31
]

// Calculate average monthly production based on panel count
export function calculateMonthlyProduction(panelCount: number): number {
  const totalYearly = monthlyProductionPerPanel.reduce((sum, m) => sum + m, 0)
  return Math.round((totalYearly / 12) * panelCount)
}

// Get monthly production array for chart (per panel count)
export function getMonthlyProductionArray(panelCount: number): number[] {
  return monthlyProductionPerPanel.map(m => Math.round(m * panelCount))
}

// Electricity price in Portugal (€/kWh)
export const ELECTRICITY_PRICE = 0.24

// Estimate monthly savings
export function calculateMonthlySavings(
  monthlyProduction: number,
  electricityPrice: number = ELECTRICITY_PRICE
): number {
  return Math.round(monthlyProduction * electricityPrice)
}

// Estimate payback years
export function calculatePaybackYears(
  price: number,
  monthlySavings: number
): number {
  if (monthlySavings <= 0) return 99
  return Math.round(price / (monthlySavings * 12))
}

// Legacy export for backward compatibility (will remove after migration)
export interface Package {
  id: string
  name: string
  nameEn: string
  price: number
  power: number
  monthlySavings: number
  paybackYears: number
  warranty: number
  recommended: boolean
  equipment: {
    panels: {
      brand: string
      model: string
      wattage: number
      quantity: number
      image: string
    }
    inverter: {
      brand: string
      model: string
      power: string
      image: string
    }
    battery?: {
      brand: string
      model: string
      capacity: string
      image: string
    }
  }
}

// Legacy packages array (for components that haven't been migrated yet)
export const packages: Package[] = [
  {
    id: 'basic',
    name: 'Básico',
    nameEn: 'Basic',
    price: 4500,
    power: 3.6,
    monthlySavings: 65,
    paybackYears: 7,
    warranty: 25,
    recommended: false,
    equipment: {
      panels: {
        brand: 'JA Solar',
        model: 'JAM54S30',
        wattage: 450,
        quantity: 8,
        image: '/equipment/solar-panel.png',
      },
      inverter: {
        brand: 'Deye',
        model: 'SUN-3K-SG04LP1',
        power: '3 kW',
        image: '/equipment/deye-inverter.webp',
      },
    },
  },
  {
    id: 'standard',
    name: 'Standard',
    nameEn: 'Standard',
    price: 6800,
    power: 5.4,
    monthlySavings: 95,
    paybackYears: 6,
    warranty: 25,
    recommended: true,
    equipment: {
      panels: {
        brand: 'JA Solar',
        model: 'JAM54S30',
        wattage: 450,
        quantity: 12,
        image: '/equipment/solar-panel.png',
      },
      inverter: {
        brand: 'Deye',
        model: 'SUN-5K-SG04LP1',
        power: '5 kW',
        image: '/equipment/deye-inverter.webp',
      },
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    nameEn: 'Premium',
    price: 9200,
    power: 8.1,
    monthlySavings: 140,
    paybackYears: 5,
    warranty: 30,
    recommended: false,
    equipment: {
      panels: {
        brand: 'JA Solar',
        model: 'JAM54S31',
        wattage: 450,
        quantity: 18,
        image: '/equipment/solar-panel.png',
      },
      inverter: {
        brand: 'Deye',
        model: 'SUN-8K-SG04LP1',
        power: '8 kW',
        image: '/equipment/deye-inverter.webp',
      },
      battery: {
        brand: 'Fox ESS',
        model: 'ECS2900',
        capacity: '5.8 kWh',
        image: '/equipment/fox-battery.jpg',
      },
    },
  },
]
