'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  User,
  Gauge,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { JobCard, Invoice } from '@/types';

export default function DeliveryPage() {
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Delivery Modal
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobCard | null>(null);
  const [finalOdo, setFinalOdo] = useState<number>(0);
  const [deliveryNotes, setDeliveryNotes] = useState('Vehicle delivered to customer in spotless condition with all issues resolved.');
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliveryError, setDeliveryError] = useState('');

  const fetchDeliveryData = async () => {
    try {
      setLoading(true);
      const [jRes, iRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/invoices'),
      ]);
      const [jData, iData] = await Promise.all([jRes.json(), iRes.json()]);

      if (jData.success) {
        setJobs(jData.data);
      }
      if (iData.success) {
        setInvoices(iData.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const handleOpenDelivery = (job: JobCard) => {
    setSelectedJob(job);
    setFinalOdo(job.currentOdometer + 8);
    setDeliveryError('');
    setDeliveryModalOpen(true);
  };

  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setDeliveryError('');

    try {
      setIsDelivering(true);
      const res = await fetch('/api/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobCardId: selectedJob.id,
          finalOdometer: Number(finalOdo),
          customerConfirmation: true,
          deliveryNotes,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setDeliveryError(data.error || 'Delivery failed');
        return;
      }

      setDeliveryModalOpen(false);
      alert('Vehicle marked DELIVERED and service history archived successfully!');
      fetchDeliveryData();
    } catch {
      setDeliveryError('Network error');
    } finally {
      setIsDelivering(false);
    }
  };

  // Filter jobs for delivery screen
  const readyJobs = jobs.filter((j) => j.status === 'READY_FOR_DELIVERY');
  const deliveredJobs = jobs.filter((j) => j.status === 'DELIVERED');

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-6 rounded-2xl text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white">
              Step 14 • Final Handover
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">Vehicle Delivery Clearance</h1>
          <p className="text-xs text-emerald-100 mt-1">
            Enforce mandatory delivery rules: Quality Check Passed, Invoice Generated, and Full Payment Settlement.
          </p>
        </div>
        <div className="hidden sm:flex p-3 rounded-2xl bg-white/10 backdrop-blur">
          <Truck className="h-10 w-10 text-emerald-200" />
        </div>
      </div>

      {/* Ready for Delivery Queue */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Ready for Delivery Clearance Queue ({readyJobs.length})
        </h2>

        {readyJobs.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            No vehicles currently waiting for delivery clearance.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {readyJobs.map((job) => {
              const inv = invoices.find((i) => i.jobCardId === job.id);
              const isQcPassed = job.qualityCheck?.status === 'PASSED' || job.status === 'READY_FOR_DELIVERY';
              const isInvoiceGenerated = Boolean(inv);
              const isPaymentCleared = inv ? inv.paymentStatus === 'PAID' : false;
              const canDeliver = isQcPassed && isInvoiceGenerated && isPaymentCleared;

              return (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-600">{job.jobId}</span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {job.vehicleRegistration}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {job.vehicleMake} {job.vehicleModel} • {job.customerName}
                      </p>
                    </div>
                    <StatusBadge status={job.status} size="sm" />
                  </div>

                  {/* 3 Mandatory Gates */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Delivery Clearance Gates:
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">1. Quality Inspection Check</span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> PASSED
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">2. Tax Invoice Generated</span>
                      {isInvoiceGenerated ? (
                        <span className="flex items-center gap-1 font-semibold text-emerald-600 font-mono">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {inv?.invoiceNumber}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-semibold text-rose-600">
                          <XCircle className="h-3.5 w-3.5" /> Pending
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">3. Payment Cleared</span>
                      {isPaymentCleared ? (
                        <span className="flex items-center gap-1 font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" /> PAID (Balance: ₹0)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-semibold text-rose-600">
                          <XCircle className="h-3.5 w-3.5" /> Balance ₹{inv?.balanceAmount.toLocaleString('en-IN') || 0}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    {!isPaymentCleared && inv && (
                      <Link
                        href={`/billing`}
                        className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                      >
                        Collect Balance (₹{inv.balanceAmount.toLocaleString('en-IN')})
                      </Link>
                    )}

                    <button
                      onClick={() => handleOpenDelivery(job)}
                      disabled={!canDeliver}
                      className="ml-auto flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-40 transition"
                    >
                      <Truck className="h-4 w-4" />
                      <span>Release & Deliver Vehicle</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recently Delivered Vehicles */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Recently Delivered Vehicles ({deliveredJobs.length})
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Job #</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Delivered At</th>
                  <th className="py-3 px-4">Final Odo</th>
                  <th className="py-3 px-4">Staff</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {deliveredJobs.map((dj) => (
                  <tr key={dj.id}>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{dj.jobId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {dj.vehicleRegistration} ({dj.vehicleMake} {dj.vehicleModel})
                    </td>
                    <td className="py-3 px-4">{dj.customerName}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {dj.delivery ? new Date(dj.delivery.deliveryDate).toLocaleDateString() : 'Delivered'}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {dj.delivery?.finalOdometer.toLocaleString('en-IN') || dj.currentOdometer} km
                    </td>
                    <td className="py-3 px-4">{dj.delivery?.staffMemberName || dj.assignedAdvisorName}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status="DELIVERED" size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delivery Confirmation Modal */}
      {deliveryModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Confirm Vehicle Handover</h3>
            <p className="text-xs text-slate-500">
              Complete vehicle delivery for <strong className="text-slate-800">{selectedJob.vehicleRegistration}</strong> ({selectedJob.customerName}).
            </p>

            {deliveryError && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {deliveryError}
              </div>
            )}

            <form onSubmit={handleDeliverySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Final Exit Odometer (km) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={selectedJob.currentOdometer}
                  value={finalOdo}
                  onChange={(e) => setFinalOdo(Number(e.target.value))}
                  required
                  className="w-full text-xs font-mono font-bold p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Handover Notes & Observations
                </label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Customer inspected vehicle and acknowledged repair satisfaction.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeliveryModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDelivering}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  {isDelivering ? 'Delivering...' : 'Confirm Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
