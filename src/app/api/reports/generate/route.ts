import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatPercentage } from '@/lib/calculations'
import jsPDF from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const { scenario_id, email } = await request.json()

    if (!scenario_id || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing scenario_id or email' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Fetch scenario data
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenario_id)
      .single()

    if (scenarioError || !scenario) {
      return NextResponse.json(
        { success: false, error: 'Scenario not found' },
        { status: 404 }
      )
    }

    // Record email capture
    const { error: reportError } = await supabase
      .from('reports')
      .insert([{
        scenario_id,
        email,
        downloaded_at: new Date().toISOString()
      }])

    if (reportError) {
      console.error('Error recording report download:', reportError)
    }

    // Generate PDF
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.width
    const margin = 20

    // Title
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('ROI Analysis Report', pageWidth / 2, 30, { align: 'center' })

    // Scenario name
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Scenario: ${scenario.scenario_name}`, margin, 50)

    // Date
    pdf.setFontSize(12)
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 65)

    // Input Parameters Section
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Input Parameters', margin, 85)

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    let yPos = 100

    const inputs = [
      ['Monthly Invoice Volume:', scenario.monthly_invoice_volume.toLocaleString()],
      ['AP Staff Count:', scenario.num_ap_staff],
      ['Hours per Invoice:', `${scenario.avg_hours_per_invoice} hours`],
      ['Hourly Wage:', formatCurrency(scenario.hourly_wage)],
      ['Manual Error Rate:', `${scenario.error_rate_manual}%`],
      ['Cost per Error:', formatCurrency(scenario.error_cost)],
      ['Time Horizon:', `${scenario.time_horizon_months} months`],
      ['Implementation Cost:', formatCurrency(scenario.one_time_implementation_cost)]
    ]

    inputs.forEach(([label, value]) => {
      pdf.text(label, margin, yPos)
      pdf.text(String(value), margin + 80, yPos)
      yPos += 15
    })

    // Results Section
    yPos += 10
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('ROI Analysis Results', margin, yPos)

    yPos += 20
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')

    const results = [
      ['Monthly Savings:', formatCurrency(scenario.monthly_savings)],
      ['Cumulative Savings:', formatCurrency(scenario.cumulative_savings)],
      ['Net Savings:', formatCurrency(scenario.net_savings)],
      ['Payback Period:', `${scenario.payback_months} months`],
      ['ROI Percentage:', formatPercentage(scenario.roi_percentage)]
    ]

    results.forEach(([label, value]) => {
      pdf.text(label, margin, yPos)
      pdf.text(String(value), margin + 80, yPos)
      yPos += 15
    })

    // Summary Section
    yPos += 20
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Executive Summary', margin, yPos)

    yPos += 20
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    
    const summaryText = `This analysis shows that automating your invoicing process will generate monthly savings of ${formatCurrency(scenario.monthly_savings)}, with a payback period of ${scenario.payback_months} months and an ROI of ${formatPercentage(scenario.roi_percentage)} over ${scenario.time_horizon_months} months.`
    
    const lines = pdf.splitTextToSize(summaryText, pageWidth - 2 * margin)
    pdf.text(lines, margin, yPos)

    // Generate PDF buffer
    const pdfBuffer = pdf.output('arraybuffer')

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="roi-report-${scenario.scenario_name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`
      }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}