import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, userId } = body;
    
    if (!messageId || !userId) {
      return NextResponse.json(
        { error: 'Message ID and User ID are required' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Message marked as read',
      data: { messageId, userId, readAt: new Date() }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    );
  }
}