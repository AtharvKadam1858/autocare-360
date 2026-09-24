import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const {
      inspectorId,
      inspectorName,
      odometer,
      fuelLevelPercent,
      visibleDamageNotes,
      exteriorItems,
      interiorItems,
      engineItems,
      safetyItems,
      overallRemarks,
      actor,
    } = body;

    const job = db.saveInspection(
      params.id,
      {
        inspectorId: inspectorId || 'user-technician',
        inspectorName: inspectorName || 'Deepak Shinde',
        odometer: Number(odometer) || 0,
        fuelLevelPercent: Number(fuelLevelPercent) || 50,
        visibleDamageNotes: visibleDamageNotes || 'None',
        exteriorItems: exteriorItems || [],
        interiorItems: interiorItems || [],
        engineItems: engineItems || [],
        safetyItems: safetyItems || [],
        overallRemarks: overallRemarks || 'Vehicle inspection completed.',
      },
      actor || { id: 'user-technician', name: 'Deepak Shinde', role: 'TECHNICIAN' }
    );

    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
