import { NextResponse } from 'next/server';

// Handler for GET requests
export async function GET(request) {
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';
  return NextResponse.json({ ip: ipAddress });
}
