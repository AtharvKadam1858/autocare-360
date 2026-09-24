import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const metrics = db.getDashboardMetrics();
    const charts = db.getDashboardChartsData();
    const recentBookings = db.getBookings().slice(0, 5);
    const recentJobCards = db.getJobCards().slice(0, 6);
    const pendingApprovals = db.getJobCards().filter((j) => j.status === 'WAITING_FOR_APPROVAL');
    const lowStockParts = db.getParts().filter((p) => p.status === 'LOW_STOCK' || p.status === 'OUT_OF_STOCK');
    const recentAudits = db.getAuditLogs().slice(0, 8);

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        charts,
        recentBookings,
        recentJobCards,
        pendingApprovals,
        lowStockParts,
        recentAudits,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
