'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Car,
  Calendar,
  Wrench,
  Receipt,
  User,
  Gauge,
  CheckCircle2,
} from 'lucide-react';
import { ServiceHistoryItem, Vehicle } from '@/types';

export default function HistoryPage() {
  const [history, setHistory] = useState<ServiceHistoryItem[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hRes, vRes] = await Promise.all([
        fetch('/api/history'),
        fetch('/api/vehicles'),
      ]);
      const [hData, vData] = await Promise.all([hRes.json(), vRes.json()]);

      if (hData.success) setHistory(hData.data);
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

  const filteredHistory = history.filter((item) => {
    const v = vehicles.find((veh) => veh.id === item.vehicleId);
    const reg = v?.registrationNumber || '';
    const q = search.toLowerCase();

    const matchesSearch =
      reg.toLowerCase().includes(q) ||
      item.complaints.toLowerCase().includes(q) ||
      item.technicianName.toLowerCase().includes(q) ||
      item.invoiceNumber.toLowerCase().includes(q);

    const matchesVehicle = selectedVehicleId === 'ALL' || item.vehicleId === selectedVehicleId;
    return matchesSearch && matchesVehicle;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Vehicle Service History
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical maintenance audit records, past parts replacement, and technician diagnostic notes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search registration, complaint, invoice #..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="text-xs border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Vehicles ({history.length} records)</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registrationNumber} — {v.make} {v.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Service History Timeline Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading service history timeline...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            No service history records found.
          </div>
        ) : (
          filteredHistory.map((item) => {
            const v = vehicles.find((veh) => veh.id === item.vehicleId);
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-blue-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {v ? `${v.registrationNumber} — ${v.make} ${v.model}` : 'Vehicle Record'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Visit Date: {new Date(item.date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })} • Odometer: <strong className="font-mono text-slate-800">{item.odometer.toLocaleString('en-IN')} km</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {item.invoiceNumber}
                    </span>
                    <p className="text-sm font-black text-slate-900 mt-1">
                      ₹{item.totalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Complaint */}
                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong className="text-slate-800">Customer Complaint: </strong>
                  {item.complaints}
                </div>

                {/* Services & Parts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5 text-blue-600" />
                      Services Executed
                    </h4>
                    <ul className="space-y-1 text-slate-600">
                      {item.servicesPerformed.map((s, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-indigo-600" />
                      Parts Replaced
                    </h4>
                    <ul className="space-y-1 text-slate-600">
                      {item.partsUsed.map((p, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Lead Technician: {item.technicianName}</span>
                  <span>Service Advisor: {item.serviceAdvisorName}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
