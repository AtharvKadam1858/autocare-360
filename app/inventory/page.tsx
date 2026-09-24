'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  Plus,
  RefreshCw,
  Package,
  IndianRupee,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { Part } from '@/types';

export default function InventoryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Restock modal
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [qtyToAdd, setQtyToAdd] = useState(10);
  const [isRestocking, setIsRestocking] = useState(false);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.success) {
        setParts(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart || qtyToAdd <= 0) return;

    try {
      setIsRestocking(true);
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partId: selectedPart.id, quantityToAdd: Number(qtyToAdd) }),
      });
      const data = await res.json();
      if (data.success) {
        setRestockModalOpen(false);
        fetchParts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRestocking(false);
    }
  };

  const categories = Array.from(new Set(parts.map((p) => p.category)));

  const filteredParts = parts.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.partNumber.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.supplier.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const lowStockCount = parts.filter((p) => p.status === 'LOW_STOCK' || p.status === 'OUT_OF_STOCK').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            OEM Parts & Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock tracking, automatic reservation upon job allocation, and reorder alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>{lowStockCount} Parts Need Reorder</span>
            </span>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search part name, number, brand, supplier..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Part #</th>
                <th className="py-3 px-4">Item Name & Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Stock Qty</th>
                <th className="py-3 px-4">Reorder Min</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading inventory catalogue...
                  </td>
                </tr>
              ) : filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No parts found matching filters.
                  </td>
                </tr>
              ) : (
                filteredParts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {p.partNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-400">{p.brand} OEM</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.category}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      ₹{p.unitPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-extrabold text-sm font-mono ${
                          p.stockQuantity <= p.reorderLevel ? 'text-rose-600' : 'text-slate-900'
                        }`}
                      >
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{p.reorderLevel}</td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">{p.supplier}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedPart(p);
                          setQtyToAdd(10);
                          setRestockModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModalOpen && selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Restock Inventory</h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">{selectedPart.name}</p>
              <p className="text-slate-500 font-mono">Part Number: {selectedPart.partNumber}</p>
              <p className="text-slate-500">Current Stock: <strong className="text-slate-800">{selectedPart.stockQuantity} units</strong></p>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity to Add <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={qtyToAdd}
                  onChange={(e) => setQtyToAdd(Number(e.target.value))}
                  required
                  className="w-full text-sm font-mono font-bold p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRestockModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRestocking}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  {isRestocking ? 'Restocking...' : 'Confirm Stock Addition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
