'use client'

import { useState, useEffect } from 'react'
import { CalculationInputs, formatCurrency, formatPercentage } from '@/lib/calculations'

interface Scenario {
  id: string
  created_at: string
  scenario_name: string
  monthly_invoice_volume: number
  num_ap_staff: number
  avg_hours_per_invoice: number
  hourly_wage: number
  error_rate_manual: number
  error_cost: number
  time_horizon_months: number
  one_time_implementation_cost: number
  monthly_savings: number
  cumulative_savings: number
  net_savings: number
  payback_months: number
  roi_percentage: number
}

interface ScenarioManagerProps {
  onLoadScenario: (scenario: Partial<CalculationInputs>) => void
}

export default function ScenarioManager({ onLoadScenario }: ScenarioManagerProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchScenarios()
  }, [])

  const fetchScenarios = async () => {
    try {
      const response = await fetch('/api/scenarios')
      const data = await response.json()
      
      if (data.success) {
        setScenarios(data.data)
      }
    } catch (error) {
      console.error('Error fetching scenarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/scenarios/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setScenarios(prev => prev.filter(s => s.id !== id))
      }
    } catch (error) {
      console.error('Error deleting scenario:', error)
    } finally {
      setDeleting(null)
    }
  }

  const handleLoad = (scenario: Scenario) => {
    onLoadScenario({
      scenario_name: scenario.scenario_name,
      monthly_invoice_volume: scenario.monthly_invoice_volume,
      num_ap_staff: scenario.num_ap_staff,
      avg_hours_per_invoice: scenario.avg_hours_per_invoice,
      hourly_wage: scenario.hourly_wage,
      error_rate_manual: scenario.error_rate_manual,
      error_cost: scenario.error_cost,
      time_horizon_months: scenario.time_horizon_months,
      one_time_implementation_cost: scenario.one_time_implementation_cost
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading scenarios...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Saved Scenarios</h2>
        <button
          onClick={fetchScenarios}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Refresh
        </button>
      </div>

      {scenarios.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No saved scenarios yet.</p>
          <p className="text-sm">Save your first calculation to see it here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {scenario.scenario_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(scenario.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLoad(scenario)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDelete(scenario.id)}
                    disabled={deleting === scenario.id}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {deleting === scenario.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Monthly Invoices:</span>
                  <p className="font-semibold">{scenario.monthly_invoice_volume.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Monthly Savings:</span>
                  <p className="font-semibold text-green-600">{formatCurrency(scenario.monthly_savings)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Payback:</span>
                  <p className="font-semibold text-blue-600">{scenario.payback_months} months</p>
                </div>
                <div>
                  <span className="text-gray-600">ROI:</span>
                  <p className="font-semibold text-purple-600">{formatPercentage(scenario.roi_percentage)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}