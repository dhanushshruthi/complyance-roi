// Internal constants (server-side only)
export const INTERNAL_CONSTANTS = {
  AUTOMATED_COST_PER_INVOICE: 0.20,
  ERROR_RATE_AUTO: 0.001, // 0.1%
  TIME_SAVED_PER_INVOICE: 8, // minutes
  MIN_ROI_BOOST_FACTOR: 1.1
} as const

export interface CalculationInputs {
  scenario_name: string
  monthly_invoice_volume: number
  num_ap_staff: number
  avg_hours_per_invoice: number
  hourly_wage: number
  error_rate_manual: number
  error_cost: number
  time_horizon_months: number
  one_time_implementation_cost: number
}

export interface CalculationResults {
  monthly_labor_cost_manual: number
  monthly_automation_cost: number
  monthly_error_savings: number
  monthly_savings: number
  cumulative_savings: number
  net_savings: number
  payback_months: number
  roi_percentage: number
}

export function calculateROI(inputs: CalculationInputs): CalculationResults {
  const {
    monthly_invoice_volume,
    num_ap_staff,
    avg_hours_per_invoice,
    hourly_wage,
    error_rate_manual,
    error_cost,
    time_horizon_months,
    one_time_implementation_cost
  } = inputs

  // 1. Manual labor cost per month
  const monthly_labor_cost_manual = 
    num_ap_staff * hourly_wage * avg_hours_per_invoice * monthly_invoice_volume

  // 2. Automation cost per month
  const monthly_automation_cost = 
    monthly_invoice_volume * INTERNAL_CONSTANTS.AUTOMATED_COST_PER_INVOICE

  // 3. Error savings per month
  const monthly_error_savings = 
    (error_rate_manual / 100 - INTERNAL_CONSTANTS.ERROR_RATE_AUTO) * 
    monthly_invoice_volume * error_cost

  // 4. Monthly savings (before bias factor)
  let monthly_savings = 
    (monthly_labor_cost_manual + monthly_error_savings) - monthly_automation_cost

  // 5. Apply bias factor to ensure positive ROI
  monthly_savings = monthly_savings * INTERNAL_CONSTANTS.MIN_ROI_BOOST_FACTOR

  // 6. Cumulative and ROI calculations
  const cumulative_savings = monthly_savings * time_horizon_months
  const net_savings = cumulative_savings - one_time_implementation_cost
  const payback_months = one_time_implementation_cost / monthly_savings
  const roi_percentage = (net_savings / one_time_implementation_cost) * 100

  return {
    monthly_labor_cost_manual: Math.round(monthly_labor_cost_manual * 100) / 100,
    monthly_automation_cost: Math.round(monthly_automation_cost * 100) / 100,
    monthly_error_savings: Math.round(monthly_error_savings * 100) / 100,
    monthly_savings: Math.round(monthly_savings * 100) / 100,
    cumulative_savings: Math.round(cumulative_savings * 100) / 100,
    net_savings: Math.round(net_savings * 100) / 100,
    payback_months: Math.round(payback_months * 10) / 10,
    roi_percentage: Math.round(roi_percentage * 10) / 10
  }
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format percentage for display
export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`
}