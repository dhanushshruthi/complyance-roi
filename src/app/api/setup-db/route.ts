import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Create scenarios table
    const { error: scenariosError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'scenarios')
      .single()

    if (scenariosError || !scenariosError) {
      // Table doesn't exist, create it
      const scenariosQuery = `
        CREATE TABLE IF NOT EXISTS scenarios (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          scenario_name VARCHAR(255) NOT NULL,
          monthly_invoice_volume INTEGER NOT NULL,
          num_ap_staff INTEGER NOT NULL,
          avg_hours_per_invoice DECIMAL(4,2) NOT NULL,
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

      const { error: createScenariosError } = await supabaseAdmin.rpc('exec_sql', {
        sql: scenariosQuery
      })

      if (createScenariosError) {
        console.error('Error creating scenarios table:', createScenariosError)
      }
    }

    // Create reports table
    const reportsQuery = `
      CREATE TABLE IF NOT EXISTS reports (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        scenario_id UUID REFERENCES scenarios(id),
        email VARCHAR(255) NOT NULL,
        downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: createReportsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: reportsQuery
    })

    if (createReportsError) {
      console.error('Error creating reports table:', createReportsError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database tables created successfully' 
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to setup database tables' 
    }, { status: 500 })
  }
}