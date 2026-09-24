import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const customers = db.getCustomers();
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, address, city, notes, actor } = body;

    if (!name || !phone || !email || !address) {
      return NextResponse.json(
        { success: false, error: 'Name, phone, email, and address are required' },
        { status: 400 }
      );
    }

    // Phone validation
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Email validation
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const customer = db.createCustomer(
      { name, phone, email, address, city, notes },
      actor || { id: 'admin', name: 'Service Advisor', role: 'SERVICE_ADVISOR' }
    );

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
