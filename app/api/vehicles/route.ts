import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const vehicles = customerId ? db.getVehiclesByCustomerId(customerId) : db.getVehicles();
    return NextResponse.json({ success: true, data: vehicles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerId,
      registrationNumber,
      vin,
      make,
      model,
      variant,
      manufacturingYear,
      fuelType,
      currentOdometer,
      color,
      actor,
    } = body;

    if (!customerId || !registrationNumber || !vin || !make || !model) {
      return NextResponse.json(
        { success: false, error: 'Customer, registration number, VIN, make, and model are required' },
        { status: 400 }
      );
    }

    if (currentOdometer < 0) {
      return NextResponse.json(
        { success: false, error: 'Odometer cannot be negative' },
        { status: 400 }
      );
    }

    const vehicle = db.createVehicle(
      {
        customerId,
        registrationNumber,
        vin,
        make,
        model,
        variant: variant || 'Standard',
        manufacturingYear: Number(manufacturingYear) || new Date().getFullYear(),
        fuelType: fuelType || 'PETROL',
        currentOdometer: Number(currentOdometer) || 0,
        color: color || 'Silver',
      },
      actor || { id: 'admin', name: 'Service Advisor', role: 'SERVICE_ADVISOR' }
    );

    return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
