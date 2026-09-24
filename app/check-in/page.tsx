'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CarFront,
  Gauge,
  Fuel,
  AlertCircle,
  ClipboardCheck,
  UserCheck,
  Wrench,
  CheckCircle2,
  Calendar,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Customer, Vehicle, Booking } from '@/types';

import { Suspense } from 'react';

function CheckInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingIdParam = searchParams.get('bookingId');
  const vehicleIdParam = searchParams.get('vehicleId');
  const customerIdParam = searchParams.get('customerId');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerIdParam || '');
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicleIdParam || '');
  const [selectedBookingId, setSelectedBookingId] = useState(bookingIdParam || '');
  const [odometer, setOdometer] = useState<number>(35000);
  const [fuelLevel, setFuelLevel] = useState<number>(60);
  const [complaint, setComplaint] = useState('');
  const [damageNotes, setDamageNotes] = useState('Minor scuffs on rear bumper RHS; no structural dent.');
  const [damageAreas, setDamageAreas] = useState<string[]>(['Rear Bumper']);
  const [assignedAdvisor, setAssignedAdvisor] = useState('user-advisor');
  const [assignedTechnician, setAssignedTechnician] = useState('user-technician');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [cRes, vRes, bRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/vehicles'),
          fetch('/api/bookings'),
        ]);
        const [cData, vData, bData] = await Promise.all([cRes.json(), vRes.json(), bRes.json()]);

        if (cData.success) setCustomers(cData.data);
        if (vData.success) setVehicles(vData.data);
        if (bData.success) setBookings(bData.data);

        // Auto-fill from booking parameter
        if (bookingIdParam && bData.success) {
          const match = bData.data.find((b: Booking) => b.id === bookingIdParam);
          if (match) {
            setSelectedCustomerId(match.customerId);
            setSelectedVehicleId(match.vehicleId);
            setComplaint(match.complaintDescription);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingIdParam]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const customerVehicles = vehicles.filter((v) => v.customerId === selectedCustomerId);

  useEffect(() => {
    if (selectedVehicle) {
      setOdometer(selectedVehicle.currentOdometer);
    }
  }, [selectedVehicle]);

  const toggleDamageArea = (area: string) => {
    setDamageAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedCustomerId || !selectedVehicleId) {
      setErrorMsg('Please select a customer and vehicle');
      return;
    }

    if (selectedVehicle && odometer < selectedVehicle.currentOdometer) {
      setErrorMsg(
        `Entry odometer (${odometer} km) cannot be less than the vehicle's last recorded odometer (${selectedVehicle.currentOdometer} km)`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBookingId || undefined,
          customerId: selectedCustomerId,
          vehicleId: selectedVehicleId,
          currentOdometer: Number(odometer),
          fuelLevelPercent: Number(fuelLevel),
          complaint: complaint || 'Scheduled maintenance service',
          assignedAdvisorId: assignedAdvisor,
          assignedTechnicianId: assignedTechnician,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setErrorMsg(json.error || 'Check-in failed');
        return;
      }

      // Redirect directly to the newly created Job Card!
      router.push(`/jobs/${json.data.id}`);
    } catch {
      setErrorMsg('Network error occurred during check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 p-6 rounded-2xl text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white">
              Step 4 • Service Intake
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">Vehicle Check-In Desk</h1>
          <p className="text-xs text-blue-100 mt-1">
            Capture physical arrival parameters, verify customer concerns, and initialize workshop Job Card.
          </p>
        </div>
        <div className="hidden sm:flex p-3 rounded-2xl bg-white/10 backdrop-blur">
          <CarFront className="h-10 w-10 text-blue-200" />
        </div>
      </div>

      <form onSubmit={handleCheckInSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1: Customer & Vehicle */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-600" />
            <span>1. Customer & Vehicle Identification</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.phone} ({c.city || 'Pune'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vehicle <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                disabled={!selectedCustomerId}
                required
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium"
              >
                <option value="">
                  {selectedCustomerId ? 'Select vehicle' : 'Select customer first'}
                </option>
                {customerVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} — {v.make} {v.model} ({v.fuelType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedVehicle && (
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-blue-500 block text-[10px] uppercase font-bold">Registration</span>
                <span className="font-extrabold">{selectedVehicle.registrationNumber}</span>
              </div>
              <div>
                <span className="text-blue-500 block text-[10px] uppercase font-bold">Chassis / VIN</span>
                <span className="font-mono">{selectedVehicle.vin}</span>
              </div>
              <div>
                <span className="text-blue-500 block text-[10px] uppercase font-bold">Fuel & Variant</span>
                <span>{selectedVehicle.fuelType} • {selectedVehicle.variant}</span>
              </div>
              <div>
                <span className="text-blue-500 block text-[10px] uppercase font-bold">Last Odometer</span>
                <span>{selectedVehicle.currentOdometer.toLocaleString('en-IN')} km</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Physical Readings */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-blue-600" />
            <span>2. Entry Odometer & Fuel Level</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Odometer Reading (km) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={odometer}
                  onChange={(e) => setOdometer(Number(e.target.value))}
                  required
                  min={selectedVehicle ? selectedVehicle.currentOdometer : 0}
                  className="w-full text-sm font-mono font-bold p-2.5 pl-9 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Must be equal or higher than last visit.</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Fuel Gauge Level (%)
                </label>
                <span className="text-xs font-extrabold text-blue-600 font-mono">{fuelLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={fuelLevel}
                onChange={(e) => setFuelLevel(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Reserve (0%)</span>
                <span>Half (50%)</span>
                <span>Full Tank (100%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Visible Damages & Notes */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>3. Exterior Condition & Customer Complaint</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Observed Scratches / Existing Body Imperfections
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                'Front Bumper',
                'Rear Bumper',
                'Bonnet',
                'Left Fender',
                'Right Fender',
                'Driver Door',
                'Passenger Door',
                'Windshield Glass',
                'Alloy Wheels',
              ].map((area) => {
                const isSelected = damageAreas.includes(area);
                return (
                  <button
                    type="button"
                    key={area}
                    onClick={() => toggleDamageArea(area)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? '⚠️ ' : ''}
                    {area}
                  </button>
                );
              })}
            </div>
            <textarea
              value={damageNotes}
              onChange={(e) => setDamageNotes(e.target.value)}
              rows={2}
              placeholder="Detailed visible exterior scratch / damage notes..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Customer Primary Complaint & Requested Jobs <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              required
              rows={3}
              placeholder="e.g. Periodic maintenance, brake squealing sound, AC odor during startup..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Section 4: Workshop Staff Assignment */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-blue-600" />
            <span>4. Staff Assignment</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Service Advisor
              </label>
              <select
                value={assignedAdvisor}
                onChange={(e) => setAssignedAdvisor(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none font-medium"
              >
                <option value="user-advisor">Sameer Joshi (Senior Service Advisor)</option>
                <option value="user-manager">Arvind Swamy (Service Manager)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lead Diagnostic Technician
              </label>
              <select
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none font-medium"
              >
                <option value="user-technician">Deepak Shinde (Master Auto Technician)</option>
                <option value="user-admin">Rahul Khurana (Workshop Lead)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Submit */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500">
            Submitting will mark the booking CHECKED_IN and generate a new Job Card in INSPECTION state.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition"
          >
            <span>{isSubmitting ? 'Checking In...' : 'Generate Job Card & Proceed to Inspection'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Check-In Desk...</div>}>
      <CheckInContent />
    </Suspense>
  );
}
