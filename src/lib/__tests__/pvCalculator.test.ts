import {
  clamp,
  calcFromBill,
  calcFromKwh,
  calcFromMonthlyBill,
  TARIFF,
  GENERATION,
  AUTONOMY_COEFFS,
  BATTERY,
} from '../pvCalculator'

// Test tolerances
// Note: Formula is a regression approximation, slight deviations expected
const AUTONOMY_TOLERANCE = 3 // ±3 percentage points
const SAVINGS_TOLERANCE = 50 // ±50€

describe('clamp', () => {
  it('should return value within bounds', () => {
    expect(clamp(0, 1, 0.5)).toBe(0.5)
  })

  it('should clamp to lower bound', () => {
    expect(clamp(0, 1, -0.5)).toBe(0)
  })

  it('should clamp to upper bound', () => {
    expect(clamp(0, 1, 1.5)).toBe(1)
  })

  it('should handle edge cases', () => {
    expect(clamp(0, 1, 0)).toBe(0)
    expect(clamp(0, 1, 1)).toBe(1)
  })
})

describe('constants', () => {
  it('should have correct tariff values', () => {
    expect(TARIFF.P_BUY).toBe(0.24)
    expect(TARIFF.P_SELL).toBe(0.06)
  })

  it('should have correct generation calibration', () => {
    expect(GENERATION.YEAR_PER_PANEL).toBeCloseTo(952.65, 2)
  })

  it('should have correct autonomy coefficients', () => {
    expect(AUTONOMY_COEFFS.a0).toBeCloseTo(0.33757282, 6)
    expect(AUTONOMY_COEFFS.b0).toBeCloseTo(0.04968257, 6)
  })

  it('should have correct battery parameters', () => {
    expect(BATTERY.USABLE_RATIO).toBe(0.81)
    expect(BATTERY.ETA_RT).toBe(0.80)
  })
})

describe('input validation', () => {
  it('should throw for N <= 0', () => {
    expect(() => calcFromBill(0, 1800, 0)).toThrow()
    expect(() => calcFromBill(-1, 1800, 0)).toThrow()
  })

  it('should throw for Bill <= 0', () => {
    expect(() => calcFromBill(10, 0, 0)).toThrow()
    expect(() => calcFromBill(10, -100, 0)).toThrow()
  })

  it('should throw for B_kWh < 0', () => {
    expect(() => calcFromBill(10, 1800, -1)).toThrow()
  })

  it('should accept B_kWh = 0', () => {
    expect(() => calcFromBill(10, 1800, 0)).not.toThrow()
  })
})

describe('calcFromBill - without battery (B=0)', () => {
  // Test cases from simulator calibration
  const testCases = [
    { N: 10, bill: 1800, expectedAutonomy: 40, expectedSavings: 1116 },
    { N: 10, bill: 2250, expectedAutonomy: 39, expectedSavings: 1228 },
    { N: 10, bill: 2600, expectedAutonomy: 38, expectedSavings: 1309 },
  ]

  testCases.forEach(({ N, bill, expectedAutonomy, expectedSavings }) => {
    it(`N=${N}, Bill=${bill}€/year, B=0 -> autonomy≈${expectedAutonomy}%, savings≈${expectedSavings}€`, () => {
      const result = calcFromBill(N, bill, 0)

      expect(result.autonomy_pct).toBeGreaterThanOrEqual(expectedAutonomy - AUTONOMY_TOLERANCE)
      expect(result.autonomy_pct).toBeLessThanOrEqual(expectedAutonomy + AUTONOMY_TOLERANCE)

      expect(result.savings_eur_year).toBeGreaterThanOrEqual(expectedSavings - SAVINGS_TOLERANCE)
      expect(result.savings_eur_year).toBeLessThanOrEqual(expectedSavings + SAVINGS_TOLERANCE)
    })
  })
})

describe('calcFromBill - with 7kWh battery (B=7)', () => {
  const testCases = [
    { N: 10, bill: 1800, expectedAutonomy: 70, expectedSavings: 1481 },
    { N: 10, bill: 2250, expectedAutonomy: 62, expectedSavings: 1582 },
    { N: 10, bill: 2600, expectedAutonomy: 57, expectedSavings: 1656 },
  ]

  testCases.forEach(({ N, bill, expectedAutonomy, expectedSavings }) => {
    it(`N=${N}, Bill=${bill}€/year, B=7kWh -> autonomy≈${expectedAutonomy}%, savings≈${expectedSavings}€`, () => {
      const result = calcFromBill(N, bill, 7)

      expect(result.autonomy_pct).toBeGreaterThanOrEqual(expectedAutonomy - AUTONOMY_TOLERANCE)
      expect(result.autonomy_pct).toBeLessThanOrEqual(expectedAutonomy + AUTONOMY_TOLERANCE)

      expect(result.savings_eur_year).toBeGreaterThanOrEqual(expectedSavings - SAVINGS_TOLERANCE)
      expect(result.savings_eur_year).toBeLessThanOrEqual(expectedSavings + SAVINGS_TOLERANCE)
    })
  })
})

describe('calcFromBill - with 10kWh battery (B=10)', () => {
  const testCases = [
    { N: 10, bill: 1800, expectedAutonomy: 79, expectedSavings: 1599 },
    { N: 10, bill: 2250, expectedAutonomy: 69, expectedSavings: 1696 },
    { N: 10, bill: 2600, expectedAutonomy: 63, expectedSavings: 1764 },
  ]

  testCases.forEach(({ N, bill, expectedAutonomy, expectedSavings }) => {
    it(`N=${N}, Bill=${bill}€/year, B=10kWh -> autonomy≈${expectedAutonomy}%, savings≈${expectedSavings}€`, () => {
      const result = calcFromBill(N, bill, 10)

      expect(result.autonomy_pct).toBeGreaterThanOrEqual(expectedAutonomy - AUTONOMY_TOLERANCE)
      expect(result.autonomy_pct).toBeLessThanOrEqual(expectedAutonomy + AUTONOMY_TOLERANCE)

      expect(result.savings_eur_year).toBeGreaterThanOrEqual(expectedSavings - SAVINGS_TOLERANCE)
      expect(result.savings_eur_year).toBeLessThanOrEqual(expectedSavings + SAVINGS_TOLERANCE)
    })
  })
})

describe('calcFromBill - 14 panels with 10kWh battery', () => {
  const testCases = [
    { N: 14, bill: 1800, expectedAutonomy: 84, expectedSavings: 1885 },
    { N: 14, bill: 2250, expectedAutonomy: 74, expectedSavings: 2004 },
    { N: 14, bill: 2600, expectedAutonomy: 68, expectedSavings: 2089 },
  ]

  testCases.forEach(({ N, bill, expectedAutonomy, expectedSavings }) => {
    it(`N=${N}, Bill=${bill}€/year, B=10kWh -> autonomy≈${expectedAutonomy}%, savings≈${expectedSavings}€`, () => {
      const result = calcFromBill(N, bill, 10)

      expect(result.autonomy_pct).toBeGreaterThanOrEqual(expectedAutonomy - AUTONOMY_TOLERANCE)
      expect(result.autonomy_pct).toBeLessThanOrEqual(expectedAutonomy + AUTONOMY_TOLERANCE)

      expect(result.savings_eur_year).toBeGreaterThanOrEqual(expectedSavings - SAVINGS_TOLERANCE)
      expect(result.savings_eur_year).toBeLessThanOrEqual(expectedSavings + SAVINGS_TOLERANCE)
    })
  })
})

describe('calcFromKwh', () => {
  it('should accept direct kWh input', () => {
    // 1800€ / 0.24 = 7500 kWh
    const result = calcFromKwh(10, 7500, 0)
    expect(result.L_year_kWh).toBe(7500)
  })

  it('should match calcFromBill for equivalent inputs', () => {
    const bill = 1800
    const kWh = bill / TARIFF.P_BUY

    const resultBill = calcFromBill(10, bill, 7)
    const resultKwh = calcFromKwh(10, kWh, 7)

    expect(resultBill.autonomy_pct).toBe(resultKwh.autonomy_pct)
    expect(resultBill.savings_eur_year).toBe(resultKwh.savings_eur_year)
  })
})

describe('calcFromMonthlyBill', () => {
  it('should convert monthly to annual', () => {
    const monthlyBill = 150 // €/month
    const result = calcFromMonthlyBill(10, monthlyBill, 7)

    // Should be equivalent to annual bill of 1800€
    const annualResult = calcFromBill(10, 1800, 7)

    expect(result.autonomy_pct).toBe(annualResult.autonomy_pct)
    expect(result.savings_eur_year).toBe(annualResult.savings_eur_year)
  })
})

describe('energy balance', () => {
  it('should have consistent energy flows', () => {
    const result = calcFromBill(10, 1800, 7)

    // Self-consumption + import = total consumption
    expect(result.E_self_year_kWh + result.E_import_year_kWh).toBeCloseTo(result.L_year_kWh, 0)

    // Generation = self-consumption + export + losses
    const generationUsed = result.E_self_year_kWh + result.E_export_year_kWh + result.Loss_year_kWh
    expect(generationUsed).toBeLessThanOrEqual(result.G_year_kWh + 1) // +1 for rounding
  })

  it('should have zero losses without battery', () => {
    const result = calcFromBill(10, 1800, 0)
    expect(result.Loss_year_kWh).toBe(0)
  })

  it('should have losses with battery', () => {
    const result = calcFromBill(10, 1800, 10)
    expect(result.Loss_year_kWh).toBeGreaterThan(0)
  })
})

describe('autonomy behavior', () => {
  it('should increase with more panels', () => {
    const result6 = calcFromBill(6, 1800, 0)
    const result10 = calcFromBill(10, 1800, 0)
    const result14 = calcFromBill(14, 1800, 0)

    expect(result10.autonomy_pct).toBeGreaterThan(result6.autonomy_pct)
    expect(result14.autonomy_pct).toBeGreaterThan(result10.autonomy_pct)
  })

  it('should increase with battery', () => {
    const resultNoBattery = calcFromBill(10, 1800, 0)
    const resultSmallBattery = calcFromBill(10, 1800, 5)
    const resultLargeBattery = calcFromBill(10, 1800, 10)

    expect(resultSmallBattery.autonomy_pct).toBeGreaterThan(resultNoBattery.autonomy_pct)
    expect(resultLargeBattery.autonomy_pct).toBeGreaterThan(resultSmallBattery.autonomy_pct)
  })

  it('should decrease with higher consumption', () => {
    const resultLow = calcFromBill(10, 1200, 0)
    const resultMid = calcFromBill(10, 1800, 0)
    const resultHigh = calcFromBill(10, 2400, 0)

    expect(resultLow.autonomy_pct).toBeGreaterThan(resultMid.autonomy_pct)
    expect(resultMid.autonomy_pct).toBeGreaterThan(resultHigh.autonomy_pct)
  })
})

describe('savings behavior', () => {
  it('should increase with more panels', () => {
    const result6 = calcFromBill(6, 1800, 0)
    const result10 = calcFromBill(10, 1800, 0)
    const result14 = calcFromBill(14, 1800, 0)

    expect(result10.savings_eur_year).toBeGreaterThan(result6.savings_eur_year)
    expect(result14.savings_eur_year).toBeGreaterThan(result10.savings_eur_year)
  })

  it('should increase with battery', () => {
    const resultNoBattery = calcFromBill(10, 1800, 0)
    const resultWithBattery = calcFromBill(10, 1800, 7)

    expect(resultWithBattery.savings_eur_year).toBeGreaterThan(resultNoBattery.savings_eur_year)
  })
})
