import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calculateROI, CalculationInputs } from '@/lib/calculations'

// GET - Retrieve all scenarios
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching scenarios:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch scenarios' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })

  } catch (error) {
    console.error('Scenarios fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scenarios' },
      { status: 500 }
    )
  }
}

// POST - Save a new scenario
export async function POST(request: NextRequest) {
  try {
    const body: CalculationInputs = await request.json()

    // Calculate results
    const results = calculateROI(body)

    // Prepare data for database
    const scenarioData = {
      scenario_name: body.scenario_name,
      monthly_invoice_volume: body.monthly_invoice_volume,
      num_ap_staff: body.num_ap_staff,
      avg_hours_per_invoice: body.avg_hours_per_invoice,
      hourly_wage: body.hourly_wage,
      error_rate_manual: body.error_rate_manual,
      error_cost: body.error_cost,
      time_horizon_months: body.time_horizon_months,
      one_time_implementation_cost: body.one_time_implementation_cost || 0,
      monthly_savings: results.monthly_savings,
      cumulative_savings: results.cumulative_savings,
      net_savings: results.net_savings,
      payback_months: results.payback_months,
      roi_percentage: results.roi_percentage
    }

    const { data, error } = await supabase
      .from('scenarios')
      .insert([scenarioData])
      .select()
      .single()

    if (error) {
      console.error('Error saving scenario:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save scenario' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        message: 'Scenario saved successfully'
      }
    })

  } catch (error) {
    console.error('Scenario save error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save scenario' },
      { status: 500 }
    )
  }
}