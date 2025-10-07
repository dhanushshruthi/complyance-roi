import { NextRequest, NextResponse } from 'next/server'
import { calculateROI, CalculationInputs } from '@/lib/calculations'

export async function POST(request: NextRequest) {
  try {
    const body: CalculationInputs = await request.json()

    // Validate required fields
    const requiredFields = [
      'scenario_name',
      'monthly_invoice_volume',
      'num_ap_staff',
      'avg_hours_per_invoice',
      'hourly_wage',
      'error_rate_manual',
      'error_cost',
      'time_horizon_months'
    ]

    for (const field of requiredFields) {
      if (!(field in body) || body[field as keyof CalculationInputs] === undefined) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Set default for optional field
    if (!body.one_time_implementation_cost) {
      body.one_time_implementation_cost = 0
    }

    // Perform calculations
    const results = calculateROI(body)

    return NextResponse.json({
      success: true,
      data: {
        inputs: body,
        results
      }
    })

  } catch (error) {
    console.error('Simulation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate ROI' },
      { status: 500 }
    )
  }
}