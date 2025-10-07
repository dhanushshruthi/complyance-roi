import { supabaseAdmin } from './supabase'

export async function createTables() {
  try {
    // Create scenarios table
    const { error: scenariosError } = await supabaseAdmin.rpc('create_scenarios_table', {
      sql: `
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
    })

    // Create reports table
    const { error: reportsError } = await supabaseAdmin.rpc('create_reports_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS reports (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          scenario_id UUID REFERENCES scenarios(id),
          email VARCHAR(255) NOT NULL,
          downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (scenariosError) {
      console.error('Error creating scenarios table:', scenariosError)
    }
    
    if (reportsError) {
      console.error('Error creating reports table:', reportsError)
    }

    return { success: !scenariosError && !reportsError }
  } catch (error) {
    console.error('Database setup error:', error)
    return { success: false, error }
  }
}

// Alternative method using direct SQL execution
export async function setupDatabase() {
  try {
    // Create scenarios table
    const scenariosTable = `
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

    const reportsTable = `
      CREATE TABLE IF NOT EXISTS reports (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        scenario_id UUID REFERENCES scenarios(id),
        email VARCHAR(255) NOT NULL,
        downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Execute table creation via API route
    const response = await fetch('/api/setup-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        tables: [scenariosTable, reportsTable] 
      })
    })

    return await response.json()
  } catch (error) {
    console.error('Database setup error:', error)
    return { success: false, error }
  }
}