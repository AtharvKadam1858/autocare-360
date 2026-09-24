'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Car,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  CarFront,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Customer, Vehicle, FuelType } from '@/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  // New Customer Form
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custCity, setCustCity] = useState('Pune');
  const [custError, setCustError] = useState('');

  // New Vehicle Form
  const [vehCustomerId, setVehCustomerId] = useState('');
  const [vehReg, setVehReg] = useState('');
  const [vehVin, setVehVin] = useState('');
  const [vehMake, setVehMake] = useState('Tata');
  const [vehModel, setVehModel] = useState('Harrier');
  const [vehVariant, setVehVariant] = useState('XZ+');
  const [vehYear, setVehYear] = useState(2023);
  const [vehFuel, setVehFuel] = useState<FuelType>('DIESEL');
  const [vehOdo, setVehOdo] = useState(15000);
  const [vehColor, setVehColor] = useState('Daytona Grey');
  const [vehError, setVehError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, vRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/vehicles'),
      ]);
      const [cData, vData] = await Promise.all([cRes.json(), vRes.json()]);

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

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustError('');
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: custName,
          phone: custPhone,
          email: custEmail,
          address: custAddress,
          city: custCity,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setCustError(data.error || 'Failed to create customer');
        return;
      }
      setCustomerModalOpen(false);
      setCustName('');
      setCustPhone('');
      setCustEmail('');
      setCustAddress('');
      fetchData();
    } catch {
      setCustError('Network error');
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setVehError('');
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: vehCustomerId,
          registrationNumber: vehReg,
          vin: vehVin,
          make: vehMake,
          model: vehModel,
          variant: vehVariant,
          manufacturingYear: Number(vehYear),
          fuelType: vehFuel,
          currentOdometer: Number(vehOdo),
          color: vehColor,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setVehError(data.error || 'Failed to register vehicle');
        return;
      }
      setVehicleModalOpen(false);
      setVehReg('');
      setVehVin('');
      fetchData();
    } catch {
      setVehError('Network error');
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    const custVehicles = vehicles.filter((v) => v.customerId === c.id);
    const hasMatchingVehicle = custVehicles.some((v) =>
      v.registrationNumber.toLowerCase().includes(q)
    );

    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      hasMatchingVehicle
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Customers & Fleet Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain customer relationship profiles and associated vehicle fleet technical specifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCustomerModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
          >
            <Plus className="h-4 w-4" /> Add Customer
          </button>
          <button
            onClick={() => setVehicleModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition"
          >
            <CarFront className="h-4 w-4 text-blue-600" /> Register Vehicle
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer name, phone, registration number..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading customer profiles...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            No customers found matching search.
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const custVehicles = vehicles.filter((v) => v.customerId === cust.id);
            return (
              <div
                key={cust.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-blue-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {cust.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{cust.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400" /> {cust.address}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    {custVehicles.length} {custVehicles.length === 1 ? 'Vehicle' : 'Vehicles'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-blue-500" />
                    <span className="font-semibold text-slate-800">{cust.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="truncate">{cust.email}</span>
                  </div>
                </div>

                {/* Linked Vehicles */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Fleet Vehicles:
                  </p>
                  <div className="space-y-1.5">
                    {custVehicles.map((v) => (
                      <div
                        key={v.id}
                        className="p-2.5 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-blue-600 mr-2">
                            {v.registrationNumber}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {v.make} {v.model} ({v.variant})
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {v.currentOdometer.toLocaleString('en-IN')} km
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Customer Modal */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Customer</h3>
            {custError && <div className="p-2 text-xs text-rose-700 bg-rose-50 rounded">{custError}</div>}
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+91 98200 11111"
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="ramesh@example.in"
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  placeholder="Street / Apartment, City"
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Vehicle Modal */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Register New Vehicle</h3>
            {vehError && <div className="p-2 text-xs text-rose-700 bg-rose-50 rounded">{vehError}</div>}
            <form onSubmit={handleCreateVehicle} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Owner / Customer</label>
                <select
                  value={vehCustomerId}
                  onChange={(e) => setVehCustomerId(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                >
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Registration #</label>
                  <input
                    type="text"
                    value={vehReg}
                    onChange={(e) => setVehReg(e.target.value.toUpperCase())}
                    placeholder="MH 12 AB 1234"
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">VIN / Chassis</label>
                  <input
                    type="text"
                    value={vehVin}
                    onChange={(e) => setVehVin(e.target.value.toUpperCase())}
                    placeholder="MAT623490N1K99999"
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono uppercase"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Make</label>
                  <input
                    type="text"
                    value={vehMake}
                    onChange={(e) => setVehMake(e.target.value)}
                    placeholder="Tata, Mahindra, etc."
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Model & Variant</label>
                  <input
                    type="text"
                    value={vehModel}
                    onChange={(e) => setVehModel(e.target.value)}
                    placeholder="Nexon XZ+"
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fuel</label>
                  <select
                    value={vehFuel}
                    onChange={(e) => setVehFuel(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  >
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={vehYear}
                    onChange={(e) => setVehYear(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Odometer</label>
                  <input
                    type="number"
                    value={vehOdo}
                    onChange={(e) => setVehOdo(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVehicleModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
