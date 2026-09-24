import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { partId, quantity, actor } = body;

    if (!partId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid part and positive quantity are required' },
        { status: 400 }
      );
    }

    const job = db.addPartToJob(params.id, partId, Number(quantity), actor);
    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
