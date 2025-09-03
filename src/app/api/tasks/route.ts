import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Tasks endpoint available'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      data: { id: `task-${Date.now()}`, ...body }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      data: body
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}