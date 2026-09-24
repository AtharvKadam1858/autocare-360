import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { description, estimatedLabourHours, assignedTechnicianId, actor } = body;

    if (!description || !estimatedLabourHours) {
      return NextResponse.json(
        { success: false, error: 'Description and estimated labour hours are required' },
        { status: 400 }
      );
    }

    const job = db.addTaskToJob(
      params.id,
      {
        description,
        estimatedLabourHours: Number(estimatedLabourHours),
        assignedTechnicianId: assignedTechnicianId || 'user-technician',
      },
      actor
    );

    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { taskId, status, actualHours, actor } = body;

    if (!taskId || !status) {
      return NextResponse.json(
        { success: false, error: 'Task ID and status are required' },
        { status: 400 }
      );
    }

    const job = db.updateTaskStatus(
      params.id,
      taskId,
      status,
      actualHours !== undefined ? Number(actualHours) : undefined,
      actor
    );

    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
