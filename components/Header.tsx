'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  UserCheck,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { Notification, UserRole } from '@/types';

interface HeaderProps {
  onOpenDemoModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDemoModal }) => {
  const router = useRouter();
  const { currentUser, switchRole, allDemoUsers } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    fetchNotifications();
  };

  const handleResetData = async () => {
    if (!confirm('Reset all AUTOCARE 360 data back to the clean demonstration seed?')) return;
    setIsResetting(true);
    try {
      await fetch('/api/reset-demo', { method: 'POST' });
      window.location.reload();
    } catch {
      setIsResetting(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const getRoleLabel = (role: UserRole) => {
    return role.replace(/_/g, ' ');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur transition-all">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search registration, customer, job, invoice..."
          className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Guided Demo Button */}
        <button
          onClick={onOpenDemoModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition"
          title="Launch Guided 14-Step Workflow Walkthrough"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Demo Tour</span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={handleResetData}
          disabled={isResetting}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          title="Reset back to initial seed data"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* Quick Role Switcher */}
        <div className="relative flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <UserCheck className="h-3.5 w-3.5 text-slate-500 ml-2" />
          <select
            value={currentUser.role}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="bg-transparent text-xs font-semibold text-slate-700 py-1 pl-1.5 pr-6 rounded focus:outline-none cursor-pointer"
          >
            {allDemoUsers.map((u) => (
              <option key={u.id} value={u.role}>
                {getRoleLabel(u.role)} ({u.name.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">No notifications yet.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 transition hover:bg-slate-50 ${!n.isRead ? 'bg-blue-50/40' : ''}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'urgent' ? (
                          <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                        ) : n.type === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        ) : n.type === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {n.link && (
                              <Link
                                href={n.link}
                                onClick={() => setShowNotifications(false)}
                                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                              >
                                View <ExternalLink className="h-2.5 w-2.5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100">
            {currentUser.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name}</p>
            <p className="text-[10px] font-medium text-slate-500">{getRoleLabel(currentUser.role)}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
