import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobCardId, finalOdometer, customerConfirmation, deliveryNotes, actor } = body;

    if (!jobCardId || finalOdometer === undefined) {
      return NextResponse.json(
        { success: false, error: 'Job Card ID and final odometer are required' },
        { status: 400 }
      );
    }

    const job = db.deliverVehicle(
      jobCardId,
      {
        finalOdometer: Number(finalOdometer),
        customerConfirmation: customerConfirmation ?? true,
        deliveryNotes: deliveryNotes || 'Vehicle delivered in clean condition to customer.',
      },
      actor || { id: 'user-advisor', name: 'Sameer Joshi', role: 'SERVICE_ADVISOR' }
    );

    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
