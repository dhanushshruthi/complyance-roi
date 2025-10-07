'use client'

import { useState } from 'react'
import CalculatorForm from '@/components/CalculatorForm'
import ScenarioManager from '@/components/ScenarioManager'
import ReportGenerator from '@/components/ReportGenerator'
import { CalculationInputs, CalculationResults } from '@/lib/calculations'

export default function Home() {
  const [currentScenario, setCurrentScenario] = useState<{
    inputs: CalculationInputs
    results: CalculationResults
    id?: string
  } | null>(null)
  
  const [showReportModal, setShowReportModal] = useState(false)
  const [formData, setFormData] = useState<Partial<CalculationInputs>>({})

  const handleCalculate = (results: CalculationResults, inputs: CalculationInputs) => {
    setCurrentScenario({ inputs, results })
  }

  const handleSave = async (inputs: CalculationInputs, results: CalculationResults) => {
    try {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      })

      const data = await response.json()
      if (data.success) {
        setCurrentScenario({ inputs, results, id: data.data.id })
        alert('Scenario saved successfully!')
      } else {
        alert('Failed to save scenario: ' + data.error)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save scenario')
    }
  }

  const handleLoadScenario = (scenarioData: Partial<CalculationInputs>) => {
    setFormData(scenarioData)
  }

  const handleGenerateReport = () => {
    if (currentScenario?.id) {
      setShowReportModal(true)
    } else {
      alert('Please save the scenario first to generate a report')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Invoicing ROI Simulator
              </h1>
              <p className="mt-2 text-gray-600">
                Calculate your savings and return on investment for automated invoicing
              </p>
            </div>
            {currentScenario && (
              <button
                onClick={handleGenerateReport}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                📄 Generate Report
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Calculator */}
          <CalculatorForm
            onCalculate={handleCalculate}
            onSave={handleSave}
            initialData={formData}
          />

          {/* Scenario Manager */}
          <ScenarioManager onLoadScenario={handleLoadScenario} />
        </div>
      </main>

      {/* Report Modal */}
      <ReportGenerator
        scenarioId={currentScenario?.id || null}
        scenarioName={currentScenario?.inputs.scenario_name || ''}
        isVisible={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Invoicing ROI Simulator. Built with Next.js and Supabase.</p>
            <p className="text-sm mt-2">
              This tool demonstrates the financial benefits of automated invoicing solutions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
