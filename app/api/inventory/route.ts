import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const parts = db.getParts();
    return NextResponse.json({ success: true, data: parts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { partId, quantityToAdd, actor } = body;

    if (!partId || !quantityToAdd || quantityToAdd <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid part and positive quantity to add are required' },
        { status: 400 }
      );
    }

    const updated = db.updatePartStock(partId, Number(quantityToAdd), actor);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
