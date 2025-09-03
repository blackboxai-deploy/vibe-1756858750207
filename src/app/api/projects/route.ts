import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Projects endpoint available'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      data: { id: `project-${Date.now()}`, ...body }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}