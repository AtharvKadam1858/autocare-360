'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ClipboardList,
  Search,
  Filter,
  ArrowRight,
  CarFront,
  User,
  Wrench,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { JobCard } from '@/types';

import { Suspense } from 'react';

function JobsContent() {
  const searchParams = useSearchParams();
  const queryStatus = searchParams.get('status');
  const querySearch = searchParams.get('q');

  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(querySearch || '');
  const [activeTab, setActiveTab] = useState(queryStatus || 'ALL');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (queryStatus) setActiveTab(queryStatus);
    if (querySearch) setSearch(querySearch);
  }, [queryStatus, querySearch]);

  const tabs = [
    { id: 'ALL', label: 'All Jobs' },
    { id: 'INSPECTION', label: 'Inspection' },
    { id: 'WAITING_FOR_APPROVAL', label: 'Waiting Approval' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'QUALITY_CHECK', label: 'Quality Check' },
    { id: 'READY_FOR_DELIVERY', label: 'Ready for Delivery' },
    { id: 'DELIVERED', label: 'Delivered' },
  ];

  const filteredJobs = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchesSearch =
      j.jobId.toLowerCase().includes(q) ||
      j.vehicleRegistration.toLowerCase().includes(q) ||
      j.customerName.toLowerCase().includes(q) ||
      j.assignedTechnicianName.toLowerCase().includes(q) ||
      j.customerComplaint.toLowerCase().includes(q);

    const matchesTab = activeTab === 'ALL' || j.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Workshop Job Cards</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track vehicle status across all repair, inspection, parts allocation, and quality milestones.
          </p>
        </div>
        <Link
          href="/check-in"
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
        >
          <CarFront className="h-4 w-4" />
          <span>Check-In Vehicle</span>
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const count =
            tab.id === 'ALL'
              ? jobs.length
              : jobs.filter((j) => j.status === tab.id).length;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Job ID, registration, customer, complaint..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading Job Cards...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Job Cards found in this view</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing your filters or search terms.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-card flex flex-col justify-between space-y-4 hover:border-blue-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-extrabold text-blue-600 tracking-wider">
                    {job.jobId}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {job.vehicleRegistration}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {job.vehicleMake} {job.vehicleModel} ({job.vehicleFuel})
                  </p>
                </div>
                <StatusBadge status={job.status} size="sm" />
              </div>

              {/* Complaint summary */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                <span className="font-bold text-slate-700 block text-[11px] mb-0.5">Customer Issue:</span>
                <p className="line-clamp-2 leading-relaxed">{job.customerComplaint}</p>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                  <span>Overall Progress</span>
                  <span className="font-bold text-slate-800">{job.overallProgressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      job.overallProgressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${job.overallProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Key Meta Details */}
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <div>
                  <span className="block text-slate-400 text-[10px]">Customer</span>
                  <span className="font-semibold text-slate-700">{job.customerName}</span>
                </div>
                <div className="text-right">
                  <span className="block text-slate-400 text-[10px]">Lead Tech</span>
                  <span className="font-semibold text-slate-700">{job.assignedTechnicianName}</span>
                </div>
              </div>

              {/* Estimate Pill if present */}
              {job.estimate && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px]">
                  <span className="text-blue-700 font-medium">Estimate #{job.estimate.estimateNumber}:</span>
                  <span className="font-extrabold text-blue-900">
                    ₹{job.estimate.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Job Cards...</div>}>
      <JobsContent />
    </Suspense>
  );
}
