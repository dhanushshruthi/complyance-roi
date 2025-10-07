import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Retrieve specific scenario
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching scenario:', error)
      return NextResponse.json(
        { success: false, error: 'Scenario not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Scenario fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scenario' },
      { status: 500 }
    )
  }
}

// DELETE - Delete specific scenario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabase
      .from('scenarios')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting scenario:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete scenario' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Scenario deleted successfully'
    })

  } catch (error) {
    console.error('Scenario delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete scenario' },
      { status: 500 }
    )
  }
}