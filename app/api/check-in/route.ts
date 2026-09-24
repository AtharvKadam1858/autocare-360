import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      customerId,
      vehicleId,
      currentOdometer,
      fuelLevelPercent,
      complaint,
      assignedAdvisorId,
      assignedTechnicianId,
      actor,
    } = body;

    if (!customerId || !vehicleId || currentOdometer === undefined || fuelLevelPercent === undefined) {
      return NextResponse.json(
        { success: false, error: 'Customer, vehicle, odometer, and fuel level are required' },
        { status: 400 }
      );
    }

    if (currentOdometer < 0) {
      return NextResponse.json(
        { success: false, error: 'Odometer cannot be negative' },
        { status: 400 }
      );
    }

    if (fuelLevelPercent < 0 || fuelLevelPercent > 100) {
      return NextResponse.json(
        { success: false, error: 'Fuel level must be between 0 and 100%' },
        { status: 400 }
      );
    }

    const job = db.checkInVehicle(
      {
        bookingId,
        customerId,
        vehicleId,
        currentOdometer: Number(currentOdometer),
        fuelLevelPercent: Number(fuelLevelPercent),
        complaint: complaint || 'Scheduled maintenance and check-up',
        assignedAdvisorId: assignedAdvisorId || 'user-advisor',
        assignedTechnicianId: assignedTechnicianId || 'user-technician',
      },
      actor || { id: 'user-advisor', name: 'Sameer Joshi', role: 'SERVICE_ADVISOR' }
    );

    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
