import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const paymentStatus = searchParams.get('paymentStatus');

    let invoices = db.getInvoices();

    if (customerId) {
      invoices = invoices.filter((i) => i.customerId === customerId);
    }
    if (paymentStatus) {
      invoices = invoices.filter((i) => i.paymentStatus === paymentStatus);
    }

    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobCardId, actor } = body;

    if (!jobCardId) {
      return NextResponse.json({ success: false, error: 'Job Card ID is required' }, { status: 400 });
    }

    const invoice = db.generateInvoiceForJob(
      jobCardId,
      actor || { id: 'user-billing', name: 'Neha Kulkarni', role: 'BILLING_STAFF' }
    );

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
