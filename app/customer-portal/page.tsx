'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  Calendar,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  History,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Download,
  User,
  Sparkles,
  Phone,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { JobCard, Vehicle, Invoice, ServiceHistoryItem } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CustomerPortalPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeJobs, setActiveJobs] = useState<JobCard[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [historyItems, setHistoryItems] = useState<ServiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeJobForAction, setActiveJobForAction] = useState<JobCard | null>(null);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [vRes, jRes, iRes, hRes] = await Promise.all([
        fetch('/api/vehicles?customerId=cust-1'),
        fetch('/api/jobs?customerId=cust-1'),
        fetch('/api/invoices?customerId=cust-1'),
        fetch('/api/history'),
      ]);
      const [vData, jData, iData, hData] = await Promise.all([
        vRes.json(),
        jRes.json(),
        iRes.json(),
        hRes.json(),
      ]);

      if (vData.success) setVehicles(vData.data);
      if (jData.success) setActiveJobs(jData.data);
      if (iData.success) setInvoices(iData.data);
      if (hData.success) {
        setHistoryItems(hData.data.filter((h: any) => h.vehicleId === 'veh-1'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleApproval = async (jobId: string, decision: 'APPROVE' | 'REJECT') => {
    if (decision === 'REJECT' && !rejectionReason) {
      alert('Please enter a feedback or revision reason.');
      return;
    }

    try {
      const res = await fetch(`/api/jobs/${jobId}/estimate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          rejectionReason: decision === 'REJECT' ? rejectionReason : undefined,
          actor: { id: 'user-customer', name: 'Rahul Patil', role: 'CUSTOMER' },
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error);
        return;
      }
      alert(`Thank you! Your estimate has been ${decision === 'APPROVE' ? 'APPROVED' : 'REJECTED'}. The service advisor has been notified.`);
      setRejectionModalOpen(false);
      fetchCustomerData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadPDF = (inv: Invoice) => {
    const doc = new jsPDF();
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('AUTOCARE 360', 14, 20);
    doc.setFontSize(10);
    doc.text('Customer Invoice Copy', 14, 28);
    doc.text(inv.invoiceNumber, 160, 22);

    doc.setTextColor(51, 65, 85);
    doc.text(`Customer: ${inv.customerName}`, 14, 46);
    doc.text(`Vehicle: ${inv.vehicleRegistration} (${inv.vehicleModel})`, 14, 52);
    doc.text(`Date: ${new Date(inv.invoiceDate).toLocaleDateString()}`, 14, 58);

    autoTable(doc, {
      startY: 66,
      head: [['Description', 'Amount']],
      body: [
        ['Parts Subtotal', `Rs. ${inv.partsSubtotal.toLocaleString('en-IN')}`],
        ['Labour Subtotal', `Rs. ${inv.labourSubtotal.toLocaleString('en-IN')}`],
        ['GST Taxes (18%)', `Rs. ${inv.taxAmount.toLocaleString('en-IN')}`],
        ['Discounts', `-Rs. ${inv.discountAmount.toLocaleString('en-IN')}`],
        ['Total Payable', `Rs. ${inv.grandTotal.toLocaleString('en-IN')}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`${inv.invoiceNumber}.pdf`);
  };

  const activeJob = activeJobs[0];

  return (
    <div className="max-w-5xl mx-auto space-y-7">
      {/* Customer Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-7 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-200 border border-blue-400/30">
              Customer Portal
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1.5">Welcome, Rahul Patil</h1>
          <p className="text-xs text-slate-300 mt-1">
            Track your vehicle's live service progress, review technician estimates, approve jobs, and download tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur p-3 rounded-2xl border border-white/10">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow">
            RP
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white">Rahul Patil</p>
            <p className="text-[11px] text-blue-200">+91 98201 12345</p>
          </div>
        </div>
      </div>

      {/* LIVE CURRENT SERVICE TRACKER */}
      {activeJob ? (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {activeJob.jobId}
                </span>
                <span className="text-xs text-slate-400">Live Service Tracker</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {activeJob.vehicleRegistration} — {activeJob.vehicleMake} {activeJob.vehicleModel}
              </h2>
            </div>
            <StatusBadge status={activeJob.status} size="lg" />
          </div>

          {/* Progress Bar & Stage Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Workshop Execution Progress</span>
              <span className="font-extrabold text-blue-600 text-sm">{activeJob.overallProgressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${activeJob.overallProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Service Advisor & Technician Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Service Advisor</p>
                <p className="text-xs font-bold text-slate-900">{activeJob.assignedAdvisorName}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3 text-slate-400" /> +91 98200 00002
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Technician</p>
                <p className="text-xs font-bold text-slate-900">{activeJob.assignedTechnicianName}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Master Technician Certified</p>
              </div>
            </div>
          </div>

          {/* ESTIMATE APPROVAL GATEWAY (CRITICAL FEATURE!) */}
          {activeJob.estimate && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white border-2 border-blue-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <h3 className="text-base font-extrabold text-slate-900">
                      Service Estimate #{activeJob.estimate.estimateNumber}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Review parts, labour, and taxes recommended by your service advisor.
                  </p>
                </div>
                <StatusBadge status={activeJob.estimate.status} size="md" />
              </div>

              {/* Itemized Estimate Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Item / Service</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {activeJob.parts.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 px-3 font-medium text-slate-900">{p.name} (x{p.quantity})</td>
                        <td className="py-2 px-3 text-slate-400">OEM Part</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold">₹{p.total.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    {activeJob.labour.map((l) => (
                      <tr key={l.id}>
                        <td className="py-2 px-3 font-medium text-slate-900">{l.description}</td>
                        <td className="py-2 px-3 text-slate-400">Labour ({l.hours} hrs)</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold">₹{l.total.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Parts + Labour Subtotal</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ₹{(activeJob.estimate.partsSubtotal + activeJob.estimate.labourSubtotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Statutory GST Taxes (18%)</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ₹{activeJob.estimate.taxAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {activeJob.estimate.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount</span>
                      <span className="font-mono font-semibold">
                        -₹{activeJob.estimate.discountAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 text-base font-extrabold text-slate-900 border-t border-slate-200">
                    <span>Total Estimated Amount</span>
                    <span className="text-xl text-blue-600 font-black">
                      ₹{activeJob.estimate.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              {activeJob.estimate.status === 'PENDING_APPROVAL' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white border border-amber-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Your approval is required so the workshop team can proceed with repairs.</span>
                  </div>
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setActiveJobForAction(activeJob);
                        setRejectionModalOpen(true);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition"
                    >
                      Request Revisions
                    </button>
                    <button
                      onClick={() => handleApproval(activeJob.id, 'APPROVE')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>Approve Estimate</span>
                    </button>
                  </div>
                </div>
              )}

              {activeJob.estimate.status === 'APPROVED' && (
                <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>You approved this estimate on {new Date(activeJob.estimate.approvedByCustomerAt || '').toLocaleString()}. Service execution is active!</span>
                </div>
              )}
            </div>
          )}

          {/* Tasks Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Workshop Service Checklist</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeJob.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div className="pr-2">
                    <p className="font-semibold text-slate-900">{task.description}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Assigned to: {task.assignedTechnicianName}</p>
                  </div>
                  <StatusBadge status={task.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center text-slate-400">
          No vehicles currently undergoing active service.
        </div>
      )}

      {/* MY VEHICLES */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">My Registered Vehicles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <div key={v.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-sm font-extrabold text-blue-600">{v.registrationNumber}</span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">{v.make} {v.model}</h4>
                  <p className="text-xs text-slate-500">{v.variant} • {v.fuelType} • {v.manufacturingYear}</p>
                </div>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Car className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>Odometer: <strong className="text-slate-800">{v.currentOdometer.toLocaleString('en-IN')} km</strong></span>
                <span>Color: <strong className="text-slate-800">{v.color}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REJECTION MODAL */}
      {rejectionModalOpen && activeJobForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Estimate Revision Feedback</h3>
            <p className="text-xs text-slate-500">
              Please share your preferred changes so your service advisor can adjust the estimate.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="e.g. Please check if front brake pads can be serviced without immediate replacement..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproval(activeJobForAction.id, 'REJECT')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Send Revision Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
