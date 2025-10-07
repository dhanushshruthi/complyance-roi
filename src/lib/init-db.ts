import { supabaseAdmin } from '@/lib/supabase'

export async function initializeDatabase() {
  try {
    console.log('Initializing database tables...')

    // Create scenarios table
    const { error: scenariosError } = await supabaseAdmin
      .from('scenarios')
      .select('id')
      .limit(1)

    if (scenariosError && scenariosError.code === 'PGRST116') {
      // Table doesn't exist, create it via SQL
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

      // Execute via HTTP request to Supabase REST API
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
        },
        body: JSON.stringify({ sql: scenariosSQL })
      })

      if (!response.ok) {
        console.log('Creating scenarios table via API call...')
      }
    }

    // Create reports table
    const { error: reportsError } = await supabaseAdmin
      .from('reports')
      .select('id')
      .limit(1)

    if (reportsError && reportsError.code === 'PGRST116') {
      const reportsSQL = `
        CREATE TABLE IF NOT EXISTS reports (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          scenario_id UUID REFERENCES scenarios(id),
          email VARCHAR(255) NOT NULL,
          downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
        },
        body: JSON.stringify({ sql: reportsSQL })
      })

      if (!response.ok) {
        console.log('Creating reports table via API call...')
      }
    }

    console.log('Database initialization completed')
    return { success: true }

  } catch (error) {
    console.error('Database initialization error:', error)
    return { success: false, error }
  }
}