import type { RoofType, GridType } from './packages'

// Panel specifications - AIKO-A-MAH72Mw 600W
export const PANEL_SPECS = {
  brand: 'Aiko',
  model: 'AIKO-A-MAH72Mw',
  wattage: 600,
  dimensions: '2278 × 1134 × 35 mm',
  weight: 28.2, // kg
  efficiency: 23.2, // %
  warrantyProduct: 15, // anos
  warrantyPerformance: 30, // anos
  // Panel area calculation
  widthM: 2.278,
  heightM: 1.134,
} as const

// Calculate panel area
export function getPanelArea(panelCount: number) {
  const panelAreaM2 = PANEL_SPECS.widthM * PANEL_SPECS.heightM // ~2.58 m²
  const totalModuleAreaM2 = panelAreaM2 * panelCount
  const roofAreaM2 = totalModuleAreaM2 * 1.10 // 10% margin for spacing
  return {
    panelAreaM2: Math.round(panelAreaM2 * 100) / 100,
    totalModuleAreaM2: Math.round(totalModuleAreaM2 * 10) / 10,
    roofAreaM2: Math.round(roofAreaM2 * 10) / 10,
  }
}

// Panel specifications with structure type
export const panels = {
  inclinada: {
    ...PANEL_SPECS,
    image: '/equipment/solar-panel.png',
    structure: 'Estrutura para telhado inclinado',
    structureShort: 'Telhado inclinado',
  },
  plana: {
    ...PANEL_SPECS,
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
  type: 'hybrid' | 'offgrid'
  typeLabel: string
  efficiency: number // %
  backupText: string
}

// Huawei backup text (requires SmartGuard/Backup Box)
const HUAWEI_BACKUP_TEXT = 'Backup (opcional): requer SmartGuard/Backup Box. Alimenta cargas críticas.'

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
    type: 'hybrid',
    typeLabel: 'Inversor Híbrido',
    efficiency: 98.4,
    backupText: HUAWEI_BACKUP_TEXT,
  },
  4: {
    brand: 'Huawei',
    model: 'SUN2000-4KTL-L1',
    power: '4 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'mono',
    phaseLabel: 'Monofásico',
    type: 'hybrid',
    typeLabel: 'Inversor Híbrido',
    efficiency: 98.4,
    backupText: HUAWEI_BACKUP_TEXT,
  },
  5: {
    brand: 'Huawei',
    model: 'SUN2000-5KTL-L1',
    power: '5 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'mono',
    phaseLabel: 'Monofásico',
    type: 'hybrid',
    typeLabel: 'Inversor Híbrido',
    efficiency: 98.4,
    backupText: HUAWEI_BACKUP_TEXT,
  },
  6: {
    brand: 'Huawei',
    model: 'SUN2000-6KTL-L1',
    power: '6 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'mono',
    phaseLabel: 'Monofásico',
    type: 'hybrid',
    typeLabel: 'Inversor Híbrido',
    efficiency: 98.4,
    backupText: HUAWEI_BACKUP_TEXT,
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
    type: 'hybrid',
    typeLabel: 'Inversor Híbrido',
    efficiency: 98.6,
    backupText: HUAWEI_BACKUP_TEXT,
  },
  4: {
    brand: 'Huawei',
    model: 'SUN2000-4KTL-M1',
    power: '4 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
    type: 'hybrid',
    typeLabel: 'Inversor Híbrido',
    efficiency: 98.6,
    backupText: HUAWEI_BACKUP_TEXT,
  },
  5: {
    brand: 'Huawei',
    model: 'SUN2000-5KTL-M1',
    power: '5 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
    type: 'hybrid',
    typeLabel: 'Inversor Híbrido',
    efficiency: 98.6,
    backupText: HUAWEI_BACKUP_TEXT,
  },
  6: {
    brand: 'Huawei',
    model: 'SUN2000-6KTL-M1',
    power: '6 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
    type: 'hybrid',
    typeLabel: 'Inversor Híbrido',
    efficiency: 98.6,
    backupText: HUAWEI_BACKUP_TEXT,
  },
  8: {
    brand: 'Huawei',
    model: 'SUN2000-8KTL-M1',
    power: '8 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
    type: 'hybrid',
    typeLabel: 'Inversor Híbrido',
    efficiency: 98.6,
    backupText: HUAWEI_BACKUP_TEXT,
  },
  10: {
    brand: 'Huawei',
    model: 'SUN2000-10KTL-M1',
    power: '10 kW',
    warranty: 10,
    image: '/equipment/Huawei.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
    type: 'hybrid',
    typeLabel: 'Inversor Híbrido',
    efficiency: 98.6,
    backupText: HUAWEI_BACKUP_TEXT,
  },
}

// Legacy export for compatibility
export const huaweiInverters = huaweiInvertersTri

// Battery specification interface
interface BatterySpec {
  brand: string
  model: string
  capacity: string
  warranty: number
  warrantyText: string
  cycles: number | null // null = don't show
  dod: number // Depth of Discharge %
  backupText: string
  image: string
}

// Huawei batteries (Luna 2000 modules - stackable)
// 15 anos garantia (Europa, garantia avançada), 100% DoD
export const huaweiBatteries: Record<number, BatterySpec> = {
  7: {
    brand: 'Huawei',
    model: 'Luna 2000',
    capacity: '7 kWh',
    warranty: 15,
    warrantyText: '15 anos (Europa, garantia avançada)',
    cycles: null, // Don't show cycles for Huawei
    dod: 100,
    backupText: 'Sim, com SmartGuard/Backup Box.',
    image: '/equipment/Huawei.jpg',
  },
  14: {
    brand: 'Huawei',
    model: 'Luna 2000 x2',
    capacity: '14 kWh',
    warranty: 15,
    warrantyText: '15 anos (Europa, garantia avançada)',
    cycles: null,
    dod: 100,
    backupText: 'Sim, com SmartGuard/Backup Box.',
    image: '/equipment/Huawei.jpg',
  },
  21: {
    brand: 'Huawei',
    model: 'Luna 2000 x3',
    capacity: '21 kWh',
    warranty: 15,
    warrantyText: '15 anos (Europa, garantia avançada)',
    cycles: null,
    dod: 100,
    backupText: 'Sim, com SmartGuard/Backup Box.',
    image: '/equipment/Huawei.jpg',
  },
}

// Legacy export for compatibility
export const huaweiBattery = huaweiBatteries[7]

// Deye backup text (Off-Grid capability)
const DEYE_BACKUP_TEXT = 'Pode alimentar cargas durante falhas de rede (com bateria e configuração adequada).'

// Deye monophase inverters (LP1 = single phase) - Off-Grid
export const deyeInvertersMono: Record<number, InverterSpec> = {
  5: {
    brand: 'Deye',
    model: 'SUN-5K-SG04LP1-EU',
    power: '5 kW',
    warranty: 5,
    image: '/equipment/Deye.jpg',
    phase: 'mono',
    phaseLabel: 'Monofásico',
    type: 'offgrid',
    typeLabel: 'Inversor Off-Grid',
    efficiency: 97.6,
    backupText: DEYE_BACKUP_TEXT,
  },
  6: {
    brand: 'Deye',
    model: 'SUN-6K-SG04LP1-EU',
    power: '6 kW',
    warranty: 5,
    image: '/equipment/Deye.jpg',
    phase: 'mono',
    phaseLabel: 'Monofásico',
    type: 'offgrid',
    typeLabel: 'Inversor Off-Grid',
    efficiency: 97.6,
    backupText: DEYE_BACKUP_TEXT,
  },
}

// Deye three-phase inverters (LP3 = three phase) - Off-Grid
export const deyeInvertersTri: Record<number, InverterSpec> = {
  5: {
    brand: 'Deye',
    model: 'SUN-5K-SG04LP3-EU',
    power: '5 kW',
    warranty: 5,
    image: '/equipment/Deye.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
    type: 'offgrid',
    typeLabel: 'Inversor Off-Grid',
    efficiency: 97.6,
    backupText: DEYE_BACKUP_TEXT,
  },
  6: {
    brand: 'Deye',
    model: 'SUN-6K-SG04LP3-EU',
    power: '6 kW',
    warranty: 5,
    image: '/equipment/Deye.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
    type: 'offgrid',
    typeLabel: 'Inversor Off-Grid',
    efficiency: 97.6,
    backupText: DEYE_BACKUP_TEXT,
  },
  8: {
    brand: 'Deye',
    model: 'SUN-8K-SG04LP3-EU',
    power: '8 kW',
    warranty: 5,
    image: '/equipment/Deye.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
    type: 'offgrid',
    typeLabel: 'Inversor Off-Grid',
    efficiency: 97.6,
    backupText: DEYE_BACKUP_TEXT,
  },
  10: {
    brand: 'Deye',
    model: 'SUN-10K-SG04LP3-EU',
    power: '10 kW',
    warranty: 5,
    image: '/equipment/Deye.jpg',
    phase: 'tri',
    phaseLabel: 'Trifásico',
    type: 'offgrid',
    typeLabel: 'Inversor Off-Grid',
    efficiency: 97.6,
    backupText: DEYE_BACKUP_TEXT,
  },
}

// Legacy export for compatibility
export const deyeInverters = deyeInvertersTri

// Deye batteries (different sizes)
// 10 anos garantia, ≥6000 ciclos
export const deyeBatteries: Record<number, BatterySpec> = {
  5: {
    brand: 'Deye',
    model: 'SE-G5.1',
    capacity: '5 kWh',
    warranty: 10,
    warrantyText: '10 anos',
    cycles: 6000, // ≥6000 cycles
    dod: 90,
    backupText: 'Sim, quando usado com inversor Off-Grid.',
    image: '/equipment/Deye.jpg',
  },
  10: {
    brand: 'Deye',
    model: 'SE-G5.1 x2',
    capacity: '10 kWh',
    warranty: 10,
    warrantyText: '10 anos',
    cycles: 6000,
    dod: 90,
    backupText: 'Sim, quando usado com inversor Off-Grid.',
    image: '/equipment/Deye.jpg',
  },
  16: {
    brand: 'Deye',
    model: 'SE-G5.1 x3',
    capacity: '16 kWh',
    warranty: 10,
    warrantyText: '10 anos',
    cycles: 6000,
    dod: 90,
    backupText: 'Sim, quando usado com inversor Off-Grid.',
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

// Get Huawei battery by kWh
export function getHuaweiBattery(kwh: number) {
  return huaweiBatteries[kwh] || huaweiBatteries[7]
}

// Battery pricing
export const BATTERY_UPGRADE_PRICE = {
  deye: 1600,           // +€1,600 per 5 kWh module (upgrade)
  deyeDowngrade: 1920,  // -€1,920 per 5 kWh module (downgrade)
  huawei: 4000,         // €4,000 per 7 kWh module
}

// Calculate battery upgrade/downgrade cost
// Returns positive for upgrades, negative for downgrades
export function getBatteryUpgradeCost(
  brand: 'deye' | 'huawei',
  baseKwh: number,
  selectedKwh: number
): number {
  if (selectedKwh === baseKwh) return 0

  if (brand === 'deye') {
    const moduleDiff = (selectedKwh - baseKwh) / 5
    if (moduleDiff > 0) {
      // Upgrade: +€1,600 per additional 5 kWh
      return moduleDiff * BATTERY_UPGRADE_PRICE.deye
    } else {
      // Downgrade: -€1,920 per removed 5 kWh module
      return moduleDiff * BATTERY_UPGRADE_PRICE.deyeDowngrade
    }
  } else {
    // Huawei: €4,000 per 7 kWh module
    // 0 kWh = no battery = -€4,000 from base (which includes 7 kWh)
    // 7 kWh = base = €0
    // 14 kWh = +€4,000
    const moduleDiff = (selectedKwh - baseKwh) / 7
    return moduleDiff * BATTERY_UPGRADE_PRICE.huawei
  }
}

// Installation warranty
export const INSTALLATION_WARRANTY = {
  years: 5,
  text: '5 anos de garantia de instalação',
} as const

// Calculate battery autonomy based on load (kW)
// Returns hours of autonomy for different load scenarios
export function getBatteryAutonomy(
  capacityKwh: number,
  dod: number // Depth of Discharge %
): { load05kw: number; load1kw: number; load2kw: number } {
  const usableKwh = capacityKwh * (dod / 100)
  return {
    load05kw: Math.round(usableKwh / 0.5 * 10) / 10, // hours at 0.5 kW
    load1kw: Math.round(usableKwh / 1.0 * 10) / 10,  // hours at 1.0 kW
    load2kw: Math.round(usableKwh / 2.0 * 10) / 10,  // hours at 2.0 kW
  }
}

// Format battery autonomy text for UI
export function formatBatteryAutonomy(capacityKwh: number, dod: number): string[] {
  const autonomy = getBatteryAutonomy(capacityKwh, dod)
  return [
    `~${autonomy.load05kw}h a 0.5 kW`,
    `~${autonomy.load1kw}h a 1.0 kW`,
  ]
}
