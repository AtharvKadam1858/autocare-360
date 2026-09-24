import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceId, amount, paymentMethod, referenceNumber, notes, actor } = body;

    if (!invoiceId || !amount || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID, amount, and payment method are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Payment amount must be greater than zero' },
        { status: 400 }
      );
    }

    const updatedInvoice = db.recordPayment(
      invoiceId,
      Number(amount),
      paymentMethod,
      referenceNumber || `REF-${Date.now().toString().slice(-6)}`,
      notes,
      actor || { id: 'user-billing', name: 'Neha Kulkarni', role: 'BILLING_STAFF' }
    );

    return NextResponse.json({ success: true, data: updatedInvoice });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
