'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Wrench,
  Clock,
  CheckCircle2,
  Truck,
  IndianRupee,
  AlertTriangle,
  Boxes,
  ArrowRight,
  TrendingUp,
  CarFront,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { StatusBadge } from '@/components/StatusBadge';
import { JobCard, Booking, Part, AuditLog } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  'WAITING FOR APPROVAL': '#f59e0b',
  'IN PROGRESS': '#3b82f6',
  'QUALITY CHECK': '#8b5cf6',
  'READY FOR DELIVERY': '#10b981',
  'DELIVERED': '#059669',
  'INSPECTION': '#0ea5e9',
  'ESTIMATE CREATED': '#6366f1',
};

export default function DashboardPage() {
  const [data, setData] = useState<{
    metrics: any;
    charts: any;
    recentBookings: Booking[];
    recentJobCards: JobCard[];
    pendingApprovals: JobCard[];
    lowStockParts: Part[];
    recentAudits: AuditLog[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200 rounded-xl"></div>
          <div className="h-72 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const { metrics, charts, recentBookings, recentJobCards, pendingApprovals, lowStockParts } = data;

  const statCards = [
    {
      title: "Today's Bookings",
      value: metrics.todayBookingsCount,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      href: '/bookings',
    },
    {
      title: 'Vehicles in Service',
      value: metrics.vehiclesInServiceCount,
      icon: CarFront,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      href: '/jobs',
    },
    {
      title: 'Waiting Approval',
      value: metrics.waitingForApprovalCount,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      href: '/jobs?status=WAITING_FOR_APPROVAL',
      urgent: metrics.waitingForApprovalCount > 0,
    },
    {
      title: 'Jobs in Progress',
      value: metrics.inProgressCount,
      icon: Wrench,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      border: 'border-sky-100',
      href: '/jobs?status=IN_PROGRESS',
    },
    {
      title: 'Ready for Delivery',
      value: metrics.readyForDeliveryCount,
      icon: Truck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      href: '/delivery',
    },
    {
      title: 'Total Revenue',
      value: `₹${metrics.totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      href: '/billing',
    },
    {
      title: 'Pending Payments',
      value: `₹${metrics.pendingPaymentsAmount.toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      href: '/billing?status=UNPAID',
    },
    {
      title: 'Low Stock Parts',
      value: metrics.lowStockPartsCount,
      icon: Boxes,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      href: '/inventory',
      urgent: metrics.lowStockPartsCount > 0,
    },
  ];

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/30 text-blue-200 border border-blue-400/30">
              Operations Control Center
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1.5">
            AUTOCARE 360 Service Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time pipeline monitoring, customer estimate approvals, technician workloads, and billing clearance.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/check-in"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-sm transition"
          >
            <CarFront className="h-4 w-4 text-blue-600" />
            <span>Check-In Vehicle</span>
          </Link>
          <Link
            href="/bookings"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition"
          >
            <Calendar className="h-4 w-4" />
            <span>New Booking</span>
          </Link>
        </div>
      </div>

      {/* Pending Approvals Alert Bar (if any) */}
      {pendingApprovals.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                {pendingApprovals.length} Service Estimate(s) Awaiting Customer Approval
              </p>
              <p className="text-xs text-amber-700">
                Latest: #{pendingApprovals[0].jobId} for {pendingApprovals[0].customerName} (
                {pendingApprovals[0].vehicleRegistration}) — ₹
                {pendingApprovals[0].estimate?.grandTotal.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <Link
            href={`/jobs/${pendingApprovals[0].id}`}
            className="flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-black bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition"
          >
            <span>Review Estimate</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`p-4 rounded-xl bg-white border ${card.border} shadow-sm transition-card flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{card.title}</span>
                <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900">{card.value}</span>
                {card.urgent && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    Action
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Revenue Trend (FY 2026)</h3>
              <p className="text-xs text-slate-500">Service billing & customer collections in ₹</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +14.2% MoM
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Jobs by Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Service Jobs by Status</h3>
              <p className="text-xs text-slate-500">Real-time workshop stage distribution</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total: {metrics.vehiclesInServiceCount + metrics.totalDeliveredCount} Jobs
            </span>
          </div>
          <div className="h-64 w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.jobsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {charts.jobsByStatus.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || '#3b82f6'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Job Cards & Workshop Floor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Workshop Job Cards</h2>
            <p className="text-xs text-slate-500">Current vehicles progressing through the service pipeline</p>
          </div>
          <Link
            href="/jobs"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View all jobs ({metrics.vehiclesInServiceCount}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentJobCards.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm transition-card flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">
                    {job.jobId}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    {job.vehicleRegistration}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {job.vehicleMake} {job.vehicleModel}
                  </p>
                </div>
                <StatusBadge status={job.status} size="sm" />
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700">Complaint: </span>
                <span className="line-clamp-1">{job.customerComplaint}</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1">
                  <span>Service Progress</span>
                  <span className="font-bold text-slate-800">{job.overallProgressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${job.overallProgressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Customer: {job.customerName.split(' ')[0]}</span>
                <span>Tech: {job.assignedTechnicianName.split(' ')[0]}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Recent Bookings & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Upcoming Bookings</h3>
            <Link href="/bookings" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentBookings.map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{b.vehicleRegistration}</span>
                    <span className="text-[11px] text-slate-500">({b.vehicleModel})</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{b.customerName} • {b.serviceType.replace(/_/g, ' ')}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={b.status} size="sm" />
                  <p className="text-[10px] text-slate-400 mt-1">{b.preferredDate} at {b.preferredTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Inventory Alerts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Inventory Stock Alerts</h3>
              {lowStockParts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {lowStockParts.length} Need Reorder
                </span>
              )}
            </div>
            <Link href="/inventory" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              Inventory
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStockParts.slice(0, 4).map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{p.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({p.partNumber})</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Supplier: {p.supplier} • ₹{p.unitPrice}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                    {p.stockQuantity} in stock (Reorder: {p.reorderLevel})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
