import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { discountAmount, additionalCharges, actor } = body;

    const job = db.generateOrUpdateEstimate(
      params.id,
      discountAmount !== undefined ? Number(discountAmount) : 0,
      additionalCharges !== undefined ? Number(additionalCharges) : 0,
      actor
    );

    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { decision, rejectionReason, actor } = body;

    if (!decision || (decision !== 'APPROVE' && decision !== 'REJECT')) {
      return NextResponse.json(
        { success: false, error: 'Valid decision ("APPROVE" or "REJECT") is required' },
        { status: 400 }
      );
    }

    if (decision === 'REJECT' && !rejectionReason) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required when rejecting an estimate' },
        { status: 400 }
      );
    }

    const job = db.handleCustomerApproval(params.id, decision, rejectionReason, actor);
    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
