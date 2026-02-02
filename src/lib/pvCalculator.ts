/**
 * PV Calculator - Formula-based model for solar system calculations
 * Based on professional simulator regression coefficients
 */

// ============ CONSTANTS ============

/** Electricity tariffs (Portugal) */
export const TARIFF = {
  P_BUY: 0.24,   // €/kWh - purchase price
  P_SELL: 0.06, // €/kWh - feed-in tariff
} as const

/** Generation calibration (Portugal, 600W panels) */
export const GENERATION = {
  DAILY_10_PANELS: 26.1,  // kWh/day average for 10 panels
  YEAR_PER_PANEL: 952.65, // kWh/year per panel = (26.1/10) * 365
} as const

/** Autonomy regression coefficients */
export const AUTONOMY_COEFFS = {
  a0: 0.33757282, // base autonomy at r=0
  b0: 0.04968257, // autonomy increase per unit r
  d: 1.03,        // battery impact coefficient
  t: 0.57,        // charge threshold
  s: 0.34,        // charge scale
} as const

/** Battery parameters */
export const BATTERY = {
  USABLE_RATIO: 0.81, // effective capacity (accounts for DoD and degradation)
  ETA_RT: 0.80,       // round-trip efficiency
} as const

// ============ TYPES ============

/** Calculator result interface */
export interface PVCalculatorResult {
  /** Annual generation (kWh) */
  G_year_kWh: number
  /** Annual consumption (kWh) */
  L_year_kWh: number
  /** Generation to consumption ratio */
  r: number
  /** Autonomy percentage (0-100) */
  autonomy_pct: number
  /** Annual savings (€) */
  savings_eur_year: number
  /** Savings as percentage of original bill */
  savings_pct: number
  /** Annual self-consumption (kWh) */
  E_self_year_kWh: number
  /** Annual export to grid (kWh) */
  E_export_year_kWh: number
  /** Annual import from grid (kWh) */
  E_import_year_kWh: number
  /** Annual battery losses (kWh) */
  Loss_year_kWh: number
}

// ============ HELPER FUNCTIONS ============

/**
 * Clamp value between lo and hi
 */
export function clamp(lo: number, hi: number, x: number): number {
  return Math.min(Math.max(x, lo), hi)
}

/**
 * Validate inputs and throw if invalid
 */
function validateInputs(N: number, L_or_Bill: number, B_kWh: number): void {
  if (N <= 0) {
    throw new Error('Panel count (N) must be greater than 0')
  }
  if (L_or_Bill <= 0) {
    throw new Error('Consumption or bill must be greater than 0')
  }
  if (B_kWh < 0) {
    throw new Error('Battery capacity (B_kWh) cannot be negative')
  }
}

// ============ CORE CALCULATION ============

/**
 * Core calculation from consumption in kWh
 * @param N - Number of panels
 * @param L_year_kWh - Annual consumption in kWh
 * @param B_kWh - Battery capacity in kWh (0 = no battery)
 */
export function calcFromKwh(
  N: number,
  L_year_kWh: number,
  B_kWh: number
): PVCalculatorResult {
  validateInputs(N, L_year_kWh, B_kWh)

  const { a0, b0, d, t, s } = AUTONOMY_COEFFS
  const { USABLE_RATIO, ETA_RT } = BATTERY
  const { P_BUY, P_SELL } = TARIFF

  // Generation
  const G = N * GENERATION.YEAR_PER_PANEL
  const L = L_year_kWh

  // Key ratio
  const r = G / L

  // Base autonomy (without battery)
  const A0 = clamp(0, 1, a0 + b0 * r)

  // Autonomy with battery
  let A = A0
  if (B_kWh > 0) {
    const Ld = L / 365 // daily consumption
    const Buse = USABLE_RATIO * B_kWh // effective battery capacity
    const beta = Buse / Ld
    const charge = clamp(0, 1, (r - t) / s)
    A = clamp(0, 1, A0 + d * Math.min(1, beta) * charge)
  }

  // Energy flows
  const E_self = A * L
  const E_import = L - E_self

  // Battery losses and export
  const E_shift = Math.max(0, (A - A0) * L) // energy shifted by battery
  const Loss = E_shift * (1 / ETA_RT - 1)
  const E_export = Math.max(0, G - E_self - Loss)

  // Economics
  const Savings_eur = E_self * P_BUY + E_export * P_SELL
  const Bill_base = L * P_BUY
  const Savings_pct = (Savings_eur / Bill_base) * 100

  return {
    G_year_kWh: Math.round(G * 10) / 10,
    L_year_kWh: Math.round(L * 10) / 10,
    r: Math.round(r * 1000) / 1000,
    autonomy_pct: Math.round(A * 1000) / 10, // to 1 decimal
    savings_eur_year: Math.round(Savings_eur),
    savings_pct: Math.round(Savings_pct * 10) / 10,
    E_self_year_kWh: Math.round(E_self),
    E_export_year_kWh: Math.round(E_export),
    E_import_year_kWh: Math.round(E_import),
    Loss_year_kWh: Math.round(Loss),
  }
}

/**
 * Calculate from annual electricity bill
 * @param N - Number of panels
 * @param Bill_year_eur - Annual electricity bill in €
 * @param B_kWh - Battery capacity in kWh (0 = no battery)
 */
export function calcFromBill(
  N: number,
  Bill_year_eur: number,
  B_kWh: number
): PVCalculatorResult {
  validateInputs(N, Bill_year_eur, B_kWh)
  const L_year_kWh = Bill_year_eur / TARIFF.P_BUY
  return calcFromKwh(N, L_year_kWh, B_kWh)
}

/**
 * Calculate from monthly electricity bill (convenience function)
 * @param N - Number of panels
 * @param Bill_month_eur - Monthly electricity bill in €
 * @param B_kWh - Battery capacity in kWh (0 = no battery)
 */
export function calcFromMonthlyBill(
  N: number,
  Bill_month_eur: number,
  B_kWh: number
): PVCalculatorResult {
  return calcFromBill(N, Bill_month_eur * 12, B_kWh)
}

// ============ UTILITY FUNCTIONS ============

/**
 * Calculate payback period in years
 * @param systemPrice - Total system price in €
 * @param result - PV calculator result
 */
export function calculatePayback(
  systemPrice: number,
  result: PVCalculatorResult
): number {
  if (result.savings_eur_year <= 0) return 99
  return Math.round((systemPrice / result.savings_eur_year) * 10) / 10
}

/**
 * Get monthly values from annual result
 */
export function getMonthlyValues(result: PVCalculatorResult) {
  return {
    savings_eur_month: Math.round(result.savings_eur_year / 12),
    E_self_month_kWh: Math.round(result.E_self_year_kWh / 12),
    E_export_month_kWh: Math.round(result.E_export_year_kWh / 12),
    E_import_month_kWh: Math.round(result.E_import_year_kWh / 12),
  }
}
