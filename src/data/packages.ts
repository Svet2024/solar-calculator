export interface Package {
  id: string
  name: string
  nameEn: string
  price: number
  power: number // kWp
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
