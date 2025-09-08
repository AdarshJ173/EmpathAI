import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'NLP endpoint is disabled in this build.' },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'NLP endpoint is disabled in this build.' },
    { status: 410 }
  );
}
