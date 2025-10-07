'use client'

import { useState, useEffect } from 'react'
import { CalculationInputs, CalculationResults, formatCurrency, formatPercentage } from '@/lib/calculations'

interface CalculatorFormProps {
  onCalculate: (results: CalculationResults, inputs: CalculationInputs) => void
  onSave: (inputs: CalculationInputs, results: CalculationResults) => void
  initialData?: Partial<CalculationInputs>
}

export default function CalculatorForm({ onCalculate, onSave, initialData }: CalculatorFormProps) {
  const [formData, setFormData] = useState<CalculationInputs>({
    scenario_name: initialData?.scenario_name || '',
    monthly_invoice_volume: initialData?.monthly_invoice_volume || 2000,
    num_ap_staff: initialData?.num_ap_staff || 3,
    avg_hours_per_invoice: initialData?.avg_hours_per_invoice || 0.17,
    hourly_wage: initialData?.hourly_wage || 30,
    error_rate_manual: initialData?.error_rate_manual || 0.5,
    error_cost: initialData?.error_cost || 100,
    time_horizon_months: initialData?.time_horizon_months || 36,
    one_time_implementation_cost: initialData?.one_time_implementation_cost || 50000
  })

  const [results, setResults] = useState<CalculationResults | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calculate ROI function
  const calculateROI = async () => {
    if (!validateForm()) return

    setIsCalculating(true)
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        setResults(data.data.results)
        onCalculate(data.data.results, formData)
      } else {
        alert('Calculation failed: ' + data.error)
      }
    } catch (error) {
      console.error('Calculation error:', error)
      alert('Failed to calculate ROI. Please try again.')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleInputChange = (field: keyof CalculationInputs, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.scenario_name.trim()) {
      newErrors.scenario_name = 'Scenario name is required'
    }

    if (formData.monthly_invoice_volume <= 0) {
      newErrors.monthly_invoice_volume = 'Must be greater than 0'
    }

    if (formData.num_ap_staff <= 0) {
      newErrors.num_ap_staff = 'Must be greater than 0'
    }

    if (formData.avg_hours_per_invoice <= 0) {
      newErrors.avg_hours_per_invoice = 'Must be greater than 0'
    }

    if (formData.hourly_wage <= 0) {
      newErrors.hourly_wage = 'Must be greater than 0'
    }

    if (formData.error_rate_manual < 0 || formData.error_rate_manual > 100) {
      newErrors.error_rate_manual = 'Must be between 0 and 100'
    }

    if (formData.error_cost < 0) {
      newErrors.error_cost = 'Must be 0 or greater'
    }

    if (formData.time_horizon_months <= 0) {
      newErrors.time_horizon_months = 'Must be greater than 0'
    }

    if (formData.one_time_implementation_cost < 0) {
      newErrors.one_time_implementation_cost = 'Must be 0 or greater'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm() || !results) return

    setIsSaving(true)
    try {
      onSave(formData, results)
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Inputs */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">ROI Calculator</h2>
          
          {/* Scenario Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scenario Name
            </label>
            <input
              type="text"
              value={formData.scenario_name}
              onChange={(e) => handleInputChange('scenario_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.scenario_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Q4_Pilot"
            />
            {errors.scenario_name && (
              <p className="text-red-500 text-sm mt-1">{errors.scenario_name}</p>
            )}
          </div>

          {/* Monthly Invoice Volume */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Invoice Volume
            </label>
            <input
              type="number"
              value={formData.monthly_invoice_volume}
              onChange={(e) => handleInputChange('monthly_invoice_volume', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.monthly_invoice_volume ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="2000"
            />
            {errors.monthly_invoice_volume && (
              <p className="text-red-500 text-sm mt-1">{errors.monthly_invoice_volume}</p>
            )}
          </div>

          {/* Number of AP Staff */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AP Staff Count
            </label>
            <input
              type="number"
              value={formData.num_ap_staff}
              onChange={(e) => handleInputChange('num_ap_staff', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.num_ap_staff ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="3"
            />
            {errors.num_ap_staff && (
              <p className="text-red-500 text-sm mt-1">{errors.num_ap_staff}</p>
            )}
          </div>

          {/* Average Hours per Invoice */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hours per Invoice
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.avg_hours_per_invoice}
              onChange={(e) => handleInputChange('avg_hours_per_invoice', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.avg_hours_per_invoice ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.17"
            />
            {errors.avg_hours_per_invoice && (
              <p className="text-red-500 text-sm mt-1">{errors.avg_hours_per_invoice}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Decimal hours (e.g., 0.17 = 10 minutes)</p>
          </div>

          {/* Hourly Wage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Wage ($)
            </label>
            <input
              type="number"
              value={formData.hourly_wage}
              onChange={(e) => handleInputChange('hourly_wage', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.hourly_wage ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="30"
            />
            {errors.hourly_wage && (
              <p className="text-red-500 text-sm mt-1">{errors.hourly_wage}</p>
            )}
          </div>

          {/* Manual Error Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manual Error Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.error_rate_manual}
              onChange={(e) => handleInputChange('error_rate_manual', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.error_rate_manual ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.5"
            />
            {errors.error_rate_manual && (
              <p className="text-red-500 text-sm mt-1">{errors.error_rate_manual}</p>
            )}
          </div>

          {/* Error Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost per Error ($)
            </label>
            <input
              type="number"
              value={formData.error_cost}
              onChange={(e) => handleInputChange('error_cost', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.error_cost ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="100"
            />
            {errors.error_cost && (
              <p className="text-red-500 text-sm mt-1">{errors.error_cost}</p>
            )}
          </div>

          {/* Time Horizon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Horizon (months)
            </label>
            <input
              type="number"
              value={formData.time_horizon_months}
              onChange={(e) => handleInputChange('time_horizon_months', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.time_horizon_months ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="36"
            />
            {errors.time_horizon_months && (
              <p className="text-red-500 text-sm mt-1">{errors.time_horizon_months}</p>
            )}
          </div>

          {/* Implementation Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Implementation Cost ($)
            </label>
            <input
              type="number"
              value={formData.one_time_implementation_cost}
              onChange={(e) => handleInputChange('one_time_implementation_cost', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.one_time_implementation_cost ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="50000"
            />
            {errors.one_time_implementation_cost && (
              <p className="text-red-500 text-sm mt-1">{errors.one_time_implementation_cost}</p>
            )}
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Results</h2>
          
          {isCalculating ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Calculating...</span>
            </div>
          ) : results ? (
            <div className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800">Monthly Savings</h3>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(results.monthly_savings)}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800">Payback Period</h3>
                  <p className="text-2xl font-bold text-blue-600">{results.payback_months} months</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-800">ROI</h3>
                  <p className="text-2xl font-bold text-purple-600">{formatPercentage(results.roi_percentage)}</p>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Detailed Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cumulative Savings:</span>
                    <span className="font-semibold">{formatCurrency(results.cumulative_savings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Savings:</span>
                    <span className="font-semibold">{formatCurrency(results.net_savings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Error Savings:</span>
                    <span className="font-semibold">{formatCurrency(results.monthly_error_savings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Labor Cost (Manual):</span>
                    <span className="font-semibold">{formatCurrency(results.monthly_labor_cost_manual)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Automation Cost:</span>
                    <span className="font-semibold">{formatCurrency(results.monthly_automation_cost)}</span>
                  </div>
                </div>
              </div>

              {/* Calculate and Save Buttons */}
              <div className="space-y-3">
                <button
                  onClick={calculateROI}
                  disabled={isCalculating}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  {isCalculating ? 'Calculating...' : '🧮 Calculate ROI'}
                </button>
                
                {results && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save Scenario'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">Ready to Calculate ROI</p>
              <p className="text-sm">Fill in your scenario details and click "Calculate ROI" to see results</p>
              <button
                onClick={calculateROI}
                disabled={isCalculating || !formData.scenario_name.trim()}
                className="mt-4 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-2 px-6 rounded-md transition-colors"
              >
                {isCalculating ? 'Calculating...' : '🧮 Calculate ROI'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}