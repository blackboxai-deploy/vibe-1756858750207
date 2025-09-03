import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Teams endpoint available'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Team created successfully',
      data: { id: `team-${Date.now()}`, ...body, createdAt: new Date() }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}