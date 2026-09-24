import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    let bookings = db.getBookings();
    if (customerId) {
      bookings = bookings.filter((b) => b.customerId === customerId);
    }
    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerId,
      vehicleId,
      serviceType,
      preferredDate,
      preferredTime,
      complaintDescription,
      pickupDropPreference,
      assignedAdvisorId,
      actor,
    } = body;

    if (!customerId || !vehicleId || !serviceType || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { success: false, error: 'Customer, vehicle, service type, preferred date and time are required' },
        { status: 400 }
      );
    }

    // Prevent scheduling conflict: same vehicle booked on the same date and time
    const existing = db.getBookings().find(
      (b) =>
        b.vehicleId === vehicleId &&
        b.preferredDate === preferredDate &&
        b.status !== 'CANCELLED' &&
        b.status !== 'COMPLETED'
    );
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `A booking (#${existing.bookingNumber}) already exists for this vehicle on ${preferredDate}.`,
        },
        { status: 400 }
      );
    }

    const booking = db.createBooking(
      {
        customerId,
        customerName: '',
        customerPhone: '',
        vehicleId,
        vehicleRegistration: '',
        vehicleModel: '',
        serviceType,
        preferredDate,
        preferredTime,
        complaintDescription: complaintDescription || 'General periodic service',
        pickupDropPreference: pickupDropPreference || 'SELF_DROP',
        assignedAdvisorId: assignedAdvisorId || 'user-advisor',
        assignedAdvisorName: 'Sameer Joshi',
        status: 'REQUESTED',
      },
      actor || { id: 'admin', name: 'Service Advisor', role: 'SERVICE_ADVISOR' }
    );

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, actor } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status are required' }, { status: 400 });
    }

    const booking = db.updateBookingStatus(id, status, actor);
    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
