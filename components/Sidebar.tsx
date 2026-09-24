'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  Wrench,
  Boxes,
  Receipt,
  Truck,
  History,
  Users,
  BarChart3,
  ShieldAlert,
  CarFront,
  ShieldCheck,
  UserSquare2,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const isCustomer = currentUser.role === 'CUSTOMER';

  const navItems = [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Dashboard', href: '/', icon: LayoutDashboard },
        { label: 'Customer Portal', href: '/customer-portal', icon: UserSquare2, highlight: true },
      ],
    },
    {
      group: 'SERVICE WORKFLOW',
      items: [
        { label: 'Bookings', href: '/bookings', icon: CalendarCheck },
        { label: 'Vehicle Check-In', href: '/check-in', icon: CarFront },
        { label: 'Service Job Cards', href: '/jobs', icon: ClipboardList },
        { label: 'Inventory & Parts', href: '/inventory', icon: Boxes },
        { label: 'Billing & Invoices', href: '/billing', icon: Receipt },
        { label: 'Vehicle Delivery', href: '/delivery', icon: Truck },
      ],
    },
    {
      group: 'RECORDS & INTELLIGENCE',
      items: [
        { label: 'Service History', href: '/history', icon: History },
        { label: 'Customers & Fleet', href: '/customers', icon: Users },
        { label: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
        { label: 'Audit Trail', href: '/audit', icon: ShieldAlert },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-slate-900">AUTOCARE</span>
            <span className="font-extrabold text-base text-blue-600">360</span>
          </div>
          <p className="text-[10px] font-medium text-slate-500 tracking-wider uppercase">
            Service Management
          </p>
        </div>
      </div>

      {/* Role Alert Pill */}
      <div className="mx-4 mt-3 p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Active Role</p>
            <p className="text-xs font-semibold text-slate-800">{currentUser.role.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : item.highlight
                        ? 'text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/70'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {item.highlight && !isActive && (
                      <span className="ml-auto text-[9px] uppercase font-bold bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded">
                        Portal
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium">System Status</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live v1.0
          </span>
        </div>
        <p className="text-[10px] text-slate-400">Database connected & persistent</p>
      </div>
    </aside>
  );
};
