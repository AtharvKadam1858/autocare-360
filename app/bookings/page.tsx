'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Car,
  User,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  CarFront,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { Booking, Customer, Vehicle, ServiceType } from '@/types';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('PERIODIC_MAINTENANCE');
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0]);
  const [preferredTime, setPreferredTime] = useState('10:00');
  const [complaint, setComplaint] = useState('');
  const [pickupDrop, setPickupDrop] = useState<'SELF_DROP' | 'PICKUP_REQUESTED' | 'DOORSTEP_DROP'>('SELF_DROP');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, cRes, vRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/customers'),
        fetch('/api/vehicles'),
      ]);
      const [bData, cData, vData] = await Promise.all([bRes.json(), cRes.json(), vRes.json()]);

      if (bData.success) setBookings(bData.data);
      if (cData.success) setCustomers(cData.data);
      if (vData.success) setVehicles(vData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const customerVehicles = vehicles.filter((v) => v.customerId === selectedCustomerId);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!selectedCustomerId || !selectedVehicleId || !serviceType || !preferredDate || !preferredTime) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          vehicleId: selectedVehicleId,
          serviceType,
          preferredDate,
          preferredTime,
          complaintDescription: complaint || 'Scheduled maintenance service',
          pickupDropPreference: pickupDrop,
          assignedAdvisorId: 'user-advisor',
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setFormError(data.error || 'Failed to create booking');
        return;
      }

      setIsModalOpen(false);
      // Reset form
      setSelectedCustomerId('');
      setSelectedVehicleId('');
      setComplaint('');
      fetchData();
    } catch {
      setFormError('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicleRegistration.toLowerCase().includes(search.toLowerCase()) ||
      b.complaintDescription.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Service Bookings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage customer appointments, service scheduling, and vehicle arrivals.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Service Booking</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking #, customer, reg..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses ({bookings.length})</option>
            <option value="REQUESTED">Requested</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Booking #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Service Type</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Pickup / Drop</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading service bookings...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No bookings found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {b.bookingNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{b.customerName}</p>
                      <p className="text-[11px] text-slate-400">{b.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{b.vehicleRegistration}</p>
                      <p className="text-[11px] text-slate-400">{b.vehicleModel}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700">
                        {b.serviceType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-medium text-slate-900">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{b.preferredDate}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{b.preferredTime}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {b.pickupDropPreference.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'REQUESTED' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'CONFIRMED')}
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                          >
                            Confirm
                          </button>
                        )}
                        {(b.status === 'CONFIRMED' || b.status === 'REQUESTED') && (
                          <Link
                            href={`/check-in?bookingId=${b.id}&vehicleId=${b.vehicleId}&customerId=${b.customerId}`}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition"
                          >
                            <CarFront className="h-3 w-3" /> Check-In
                          </Link>
                        )}
                        {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                            className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-rose-600 rounded transition"
                            title="Cancel booking"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Create Service Booking</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 text-xs rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  {formError}
                </div>
              )}

              {/* Customer Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    setSelectedVehicleId('');
                  }}
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vehicle <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  disabled={!selectedCustomerId}
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">
                    {selectedCustomerId ? 'Select customer vehicle' : 'Select customer first'}
                  </option>
                  {customerVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} - {v.make} {v.model} ({v.variant})
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as ServiceType)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PERIODIC_MAINTENANCE">Periodic Maintenance Service</option>
                  <option value="GENERAL_REPAIR">General Mechanical Repair</option>
                  <option value="BRAKE_SERVICE">Brake System Overhaul</option>
                  <option value="AC_SERVICE">AC & Climate Control Service</option>
                  <option value="WHEEL_TYRE_CARE">3D Alignment & Wheel Balancing</option>
                  <option value="ELECTRICAL_DIAGNOSIS">Electrical & OBD Diagnostics</option>
                  <option value="EXPRESS_SERVICE">Express 60-Minute Service</option>
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Pickup / Drop */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pickup & Drop Preference
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { val: 'SELF_DROP', label: 'Self Drive-In' },
                    { val: 'PICKUP_REQUESTED', label: 'Doorstep Pickup' },
                    { val: 'DOORSTEP_DROP', label: 'Delivery Only' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setPickupDrop(opt.val as any)}
                      className={`p-2 rounded-lg border text-center font-medium transition ${
                        pickupDrop === opt.val
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complaints / Issue */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Issues & Complaints
                </label>
                <textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  rows={2}
                  placeholder="e.g. Engine oil replacement due, front brake screeching, AC cooling low..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
