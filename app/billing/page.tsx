'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  Filter,
  CreditCard,
  Download,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { Invoice, PaymentMethod } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Payment modal state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payError, setPayError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPayAmount(inv.balanceAmount);
    setPayRef(`UPI/${Date.now().toString().slice(-8)}`);
    setPayError('');
    setPayModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setPayError('');

    if (payAmount <= 0) {
      setPayError('Payment amount must be greater than zero');
      return;
    }
    if (payAmount > selectedInvoice.balanceAmount + 0.01) {
      setPayError(`Payment cannot exceed outstanding balance of ₹${selectedInvoice.balanceAmount}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: Number(payAmount),
          paymentMethod: payMethod,
          referenceNumber: payRef,
          notes: payNotes,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setPayError(data.error || 'Payment failed');
        return;
      }
      setPayModalOpen(false);
      fetchInvoices();
    } catch {
      setPayError('Network error');
    } finally {
      setIsSubmitting(false);
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
    doc.text('Complete Vehicle Service Management System', 14, 28);
    doc.text('TAX INVOICE', 160, 22);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.text(`Invoice No: ${inv.invoiceNumber}`, 14, 46);
    doc.text(`Date: ${new Date(inv.invoiceDate).toLocaleDateString()}`, 14, 52);
    doc.text(`Customer: ${inv.customerName}`, 120, 46);
    doc.text(`Phone: ${inv.customerPhone}`, 120, 52);
    doc.text(`Vehicle: ${inv.vehicleRegistration} (${inv.vehicleModel})`, 120, 58);

    autoTable(doc, {
      startY: 66,
      head: [['Line Item Description', 'Amount (INR)']],
      body: [
        ['Parts Subtotal', `Rs. ${inv.partsSubtotal.toLocaleString('en-IN')}`],
        ['Labour Subtotal', `Rs. ${inv.labourSubtotal.toLocaleString('en-IN')}`],
        ['Workshop Consumables & Sanitization', `Rs. ${inv.additionalCharges.toLocaleString('en-IN')}`],
        ['Statutory GST Taxes (18%)', `Rs. ${inv.taxAmount.toLocaleString('en-IN')}`],
        ['Discount Applied', `-Rs. ${inv.discountAmount.toLocaleString('en-IN')}`],
        ['Grand Total', `Rs. ${inv.grandTotal.toLocaleString('en-IN')}`],
        ['Amount Paid', `Rs. ${inv.paidAmount.toLocaleString('en-IN')}`],
        ['Outstanding Balance', `Rs. ${inv.balanceAmount.toLocaleString('en-IN')}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`${inv.invoiceNumber}_${inv.vehicleRegistration}.pdf`);
  };

  const filteredInvoices = invoices.filter((i) => {
    const q = search.toLowerCase();
    const matchesSearch =
      i.invoiceNumber.toLowerCase().includes(q) ||
      i.customerName.toLowerCase().includes(q) ||
      i.vehicleRegistration.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || i.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Tax Invoices & Billing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generated GST invoices, multi-method payment settlements, and delivery clearance locks.
          </p>
        </div>
        <Link
          href="/delivery"
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition"
        >
          <Truck className="h-4 w-4 text-blue-600" />
          <span>Vehicle Delivery Clearance</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice #, customer, registration..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer & Vehicle</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No invoices matching filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{inv.customerName}</p>
                      <p className="text-[11px] text-slate-400">{inv.vehicleRegistration} ({inv.vehicleModel})</p>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 font-mono text-sm">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600 font-mono">
                      ₹{inv.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono">
                      <span className={inv.balanceAmount > 0 ? 'text-rose-600' : 'text-slate-400'}>
                        ₹{inv.balanceAmount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inv.paymentStatus} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.balanceAmount > 0 && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                          >
                            Pay
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadPDF(inv)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                          title="Download PDF Invoice"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {payModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Record Payment</h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">{selectedInvoice.customerName} — {selectedInvoice.vehicleRegistration}</p>
              <p className="text-slate-500">Invoice: <strong className="font-mono text-slate-800">{selectedInvoice.invoiceNumber}</strong></p>
              <p className="text-slate-500">Outstanding Balance: <strong className="font-mono text-rose-600 text-sm">₹{selectedInvoice.balanceAmount.toLocaleString('en-IN')}</strong></p>
            </div>

            {payError && (
              <div className="p-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded">
                {payError}
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedInvoice.balanceAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  required
                  className="w-full text-sm font-mono font-bold p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-medium"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">NEFT / Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reference Number</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="UPI Ref / Card Auth Code"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
