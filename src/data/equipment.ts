import type { RoofType, GridType } from './packages'

// Panel specifications with structure type
export const panels = {
  inclinada: {
    brand: 'Aiko',
    model: 'N-Type',
    wattage: 600,
    warrantyProduct: 12,
    warrantyPerformance: 25,
    image: '/equipment/solar-panel.png',
    structure: 'Estrutura para telhado inclinado',
    structureShort: 'Telhado inclinado',
  },
  plana: {
    brand: 'Jinko',
    model: '600W Bifacial Double N-Type',
    wattage: 600,
    warrantyProduct: 12,
    warrantyPerformance: 25,
    image: '/equipment/solar-panel.png',
    structure: 'Estrutura para telhado plano (coplanar)',
    structureShort: 'Telhado plano',
  },
} as const

// Get panel by roof type
export function getPanel(roofType: RoofType) {
  return panels[roofType]
}

// Inverter type
interface InverterSpec {
  brand: string
  model: string
  power: string
  warranty: number
  image: string
  phase: 'mono' | 'tri'
  phaseLabel: string
}

// Huawei monophase inverters (L1)
export const huaweiInvertersMono: Record<number, InverterSpec> = {
  3: {
    brand: 'Huawei',
    model: 'SUN2000-3KTL-L1',
    power: '3 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'mono',
    phaseLabel: 'Monofásico',
  },
  4: {
    brand: 'Huawei',
    model: 'SUN2000-4KTL-L1',
    power: '4 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'mono',
    phaseLabel: 'Monofásico',
  },
  5: {
    brand: 'Huawei',
    model: 'SUN2000-5KTL-L1',
    power: '5 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'mono',
    phaseLabel: 'Monofásico',
  },
  6: {
    brand: 'Huawei',
    model: 'SUN2000-6KTL-L1',
    power: '6 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'mono',
    phaseLabel: 'Monofásico',
  },
}

// Huawei three-phase inverters (M1)
export const huaweiInvertersTri: Record<number, InverterSpec> = {
  3: {
    brand: 'Huawei',
    model: 'SUN2000-3KTL-M1',
    power: '3 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
  },
  4: {
    brand: 'Huawei',
    model: 'SUN2000-4KTL-M1',
    power: '4 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
  },
  5: {
    brand: 'Huawei',
    model: 'SUN2000-5KTL-M1',
    power: '5 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
  },
  6: {
    brand: 'Huawei',
    model: 'SUN2000-6KTL-M1',
    power: '6 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
  },
  8: {
    brand: 'Huawei',
    model: 'SUN2000-8KTL-M1',
    power: '8 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
  },
  10: {
    brand: 'Huawei',
    model: 'SUN2000-10KTL-M1',
    power: '10 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
  },
}

// Legacy export for compatibility
export const huaweiInverters = huaweiInvertersTri

// Huawei battery (fixed 7 kWh)
export const huaweiBattery = {
  brand: 'Huawei',
  model: 'Luna 2000',
  capacity: '7 kWh',
  warranty: 10,
  cycles: 6000,
  image: '/equipment/Huawei.jpg',
}

// Deye monophase inverters (LP1 = single phase)
export const deyeInvertersMono: Record<number, InverterSpec> = {
  5: {
    brand: 'Deye',
    model: 'SUN-5K-SG04LP1-EU',
    power: '5 kW',
    warranty: 10,
    image: '/equipment/Deye.jpg',
    phase: 'mono',
    phaseLabel: 'Monofásico',
  },
  6: {
    brand: 'Deye',
    model: 'SUN-6K-SG04LP1-EU',
    power: '6 kW',
    warranty: 10,
    image: '/equipment/Deye.jpg',
    phase: 'mono',
    phaseLabel: 'Monofásico',
  },
}

// Deye three-phase inverters (LP3 = three phase)
export const deyeInvertersTri: Record<number, InverterSpec> = {
  5: {
    brand: 'Deye',
    model: 'SUN-5K-SG04LP3-EU',
    power: '5 kW',
    warranty: 10,
    image: '/equipment/Deye.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
  },
  6: {
    brand: 'Deye',
    model: 'SUN-6K-SG04LP3-EU',
    power: '6 kW',
    warranty: 10,
    image: '/equipment/Deye.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
  },
  8: {
    brand: 'Deye',
    model: 'SUN-8K-SG04LP3-EU',
    power: '8 kW',
    warranty: 10,
    image: '/equipment/Deye.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
  },
  10: {
    brand: 'Deye',
    model: 'SUN-10K-SG04LP3-EU',
    power: '10 kW',
    warranty: 10,
    image: '/equipment/Deye.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
  },
}

// Legacy export for compatibility
export const deyeInverters = deyeInvertersTri

// Deye batteries (different sizes)
export const deyeBatteries: Record<
  number,
  { brand: string; model: string; capacity: string; warranty: number; cycles: number; image: string }
> = {
  5: {
    brand: 'Deye',
    model: 'SE-G5.1',
    capacity: '5 kWh',
    warranty: 10,
    cycles: 6000,
    image: '/equipment/Deye.jpg',
  },
  10: {
    brand: 'Deye',
    model: 'SE-G5.1 x2',
    capacity: '10 kWh',
    warranty: 10,
    cycles: 6000,
    image: '/equipment/Deye.jpg',
  },
  16: {
    brand: 'Deye',
    model: 'SE-G5.1 x3',
    capacity: '16 kWh',
    warranty: 10,
    cycles: 6000,
    image: '/equipment/Deye.jpg',
  },
}

// Get Huawei inverter by kW and grid type
export function getHuaweiInverter(kw: number, gridType: GridType = 'trifasica') {
  const inverters = gridType === 'monofasica' ? huaweiInvertersMono : huaweiInvertersTri
  // For mono, max is 6kW, fallback to largest available
  if (gridType === 'monofasica' && kw > 6) {
    return inverters[6]
  }
  return inverters[kw] || inverters[5]
}

// Get Deye inverter by kW and grid type
export function getDeyeInverter(kw: number, gridType: GridType = 'trifasica') {
  const inverters = gridType === 'monofasica' ? deyeInvertersMono : deyeInvertersTri
  // For mono, max is 6kW, fallback to largest available
  if (gridType === 'monofasica' && kw > 6) {
    return inverters[6]
  }
  return inverters[kw] || inverters[5]
}

// Get Deye battery by kWh
export function getDeyeBattery(kwh: number) {
  return deyeBatteries[kwh] || deyeBatteries[5]
}
