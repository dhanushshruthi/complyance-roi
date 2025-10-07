import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('Creating database tables...')

    // Create scenarios table
    const scenariosSQL = `
      CREATE TABLE IF NOT EXISTS scenarios (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        scenario_name VARCHAR(255) NOT NULL,
        monthly_invoice_volume INTEGER NOT NULL,
        num_ap_staff INTEGER NOT NULL,
        avg_hours_per_invoice DECIMAL(5,3) NOT NULL,
        hourly_wage DECIMAL(8,2) NOT NULL,
        error_rate_manual DECIMAL(5,2) NOT NULL,
        error_cost DECIMAL(10,2) NOT NULL,
        time_horizon_months INTEGER NOT NULL,
        one_time_implementation_cost DECIMAL(12,2) DEFAULT 0,
        monthly_savings DECIMAL(12,2),
        cumulative_savings DECIMAL(12,2),
        net_savings DECIMAL(12,2),
        payback_months DECIMAL(6,2),
        roi_percentage DECIMAL(8,2)
      );
    `

    const reportsSQL = `
      CREATE TABLE IF NOT EXISTS reports (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        scenario_id UUID REFERENCES scenarios(id),
        email VARCHAR(255) NOT NULL,
        downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Execute the SQL directly using Supabase's SQL execution
    const { error: scenariosError } = await supabaseAdmin.rpc('exec', {
      sql: scenariosSQL
    })

    const { error: reportsError } = await supabaseAdmin.rpc('exec', {
      sql: reportsSQL
    })

    if (scenariosError || reportsError) {
      console.error('SQL execution errors:', { scenariosError, reportsError })
      return NextResponse.json({
        success: false,
        error: 'Failed to create tables',
        details: { scenariosError, reportsError }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully'
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to setup database',
      details: error
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to create database tables',
    instructions: [
      '1. Send POST request to this endpoint',
      '2. Or create tables manually in Supabase dashboard',
      '3. Check README.md for SQL scripts'
    ]
  })
}