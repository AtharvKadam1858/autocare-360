'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Users,
  Car,
  Calendar,
  ClipboardCheck,
  Search,
  Wrench,
  Boxes,
  Calculator,
  UserCheck,
  PlayCircle,
  ShieldCheck,
  Receipt,
  CreditCard,
  Truck,
  History,
} from 'lucide-react';

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoWalkthroughModal: React.FC<DemoWalkthroughModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Customer Registration',
      role: 'SERVICE_ADVISOR / ADMIN',
      icon: Users,
      description: 'Record customer details (Rahul Patil, Priya Sharma, etc.) with phone, email, and address. Validates unique contact information.',
      route: '/customers',
      buttonText: 'View Customers & Fleet',
      dbAction: 'Creates Customer entity, stores in relational customer table with audit trail.',
    },
    {
      step: 2,
      title: 'Vehicle Registration',
      role: 'SERVICE_ADVISOR',
      icon: Car,
      description: 'Register vehicle under customer: Registration number (e.g. MH 12 AB 4587), VIN/chassis, make, model, variant, year, fuel type, and current odometer.',
      route: '/customers',
      buttonText: 'Manage Vehicles',
      dbAction: 'Enforces vehicle-to-customer foreign key and unique registration number.',
    },
    {
      step: 3,
      title: 'Service Booking',
      role: 'CUSTOMER / SERVICE_ADVISOR',
      icon: Calendar,
      description: 'Customer or advisor schedules service booking with date, time, complaint description, and pickup/drop choice. System guards against scheduling clashes.',
      route: '/bookings',
      buttonText: 'Open Service Bookings',
      dbAction: 'Creates Booking with status REQUESTED / CONFIRMED and sends in-app alert.',
    },
    {
      step: 4,
      title: 'Vehicle Check-In',
      role: 'SERVICE_ADVISOR',
      icon: ClipboardCheck,
      description: 'Vehicle arrives at center. Advisor records entry odometer (e.g. 34,500 km), fuel level (65%), damage inspection notes, and creates the digital Job Card.',
      route: '/check-in',
      buttonText: 'Go to Check-In Desk',
      dbAction: 'Transitions booking to CHECKED_IN and generates Job Card (e.g. JOB-1001) in INSPECTION state.',
    },
    {
      step: 5,
      title: 'Digital Vehicle Inspection',
      role: 'TECHNICIAN / ADVISOR',
      icon: Search,
      description: 'Technician conducts 20-point digital checklist across Exterior, Interior, Engine, and Safety with GOOD, ATTENTION, or CRITICAL condition flags.',
      route: '/jobs/job-1',
      buttonText: 'Inspect Job #JOB-1001',
      dbAction: 'Saves Inspection entity and advances job status to ESTIMATE_CREATED.',
    },
    {
      step: 6,
      title: 'Service Tasks Definition',
      role: 'SERVICE_MANAGER / TECHNICIAN',
      icon: Wrench,
      description: 'Define execution tasks (Engine oil flush, Brake pads replacement, Wheel alignment) with estimated labour hours and assigned technician.',
      route: '/jobs/job-1',
      buttonText: 'View Service Tasks',
      dbAction: 'Creates ServiceTask records linked to Job Card. Tracks real-time completion %.',
    },
    {
      step: 7,
      title: 'Parts Allocation & Inventory Deduction',
      role: 'TECHNICIAN / STORE_MANAGER',
      icon: Boxes,
      description: 'Allocate OEM parts (Castrol 5W-30, Brembo Ceramic Brake Pads, Filters). System automatically deducts inventory and triggers low-stock warnings.',
      route: '/inventory',
      buttonText: 'Inspect Parts Inventory',
      dbAction: 'Deducts stockQuantity, validates non-negative stock, updates part status (LOW_STOCK / OUT_OF_STOCK).',
    },
    {
      step: 8,
      title: 'Labour & Rate Calculation',
      role: 'SERVICE_ADVISOR',
      icon: Calculator,
      description: 'Add standard labour line items with standard hours and hourly rates (e.g. Brake pad fitting 1.2 hrs @ ₹800/hr = ₹960).',
      route: '/jobs/job-1',
      buttonText: 'Review Labour Items',
      dbAction: 'Calculates labour totals with applicable GST (18%).',
    },
    {
      step: 9,
      title: 'Service Estimate Generation',
      role: 'SERVICE_ADVISOR',
      icon: Receipt,
      description: 'System computes Subtotal (Parts + Labour) + Taxes - Discounts = Grand Total (e.g. ₹10,077.20) and marks status WAITING_FOR_APPROVAL.',
      route: '/jobs/job-1',
      buttonText: 'View Estimate #EST-1001',
      dbAction: 'Saves Estimate entity with items and notifies customer.',
    },
    {
      step: 10,
      title: 'Customer Estimate Approval / Rejection',
      role: 'CUSTOMER (Customer Portal)',
      icon: UserCheck,
      description: 'CRITICAL STEP: Customer reviews estimate via Customer Portal. Can click "Approve" (advances job to APPROVED) or "Reject" (records reason).',
      route: '/customer-portal',
      buttonText: 'Open Customer Portal',
      dbAction: 'State machine updates DB to APPROVED or REJECTED. Unlocks task execution only when approved.',
    },
    {
      step: 11,
      title: 'Service Execution & Progress',
      role: 'TECHNICIAN',
      icon: PlayCircle,
      description: 'Technician executes tasks, moving statuses from PENDING -> IN_PROGRESS -> COMPLETED. Progress bar automatically calculates completion %.',
      route: '/jobs/job-2',
      buttonText: 'View In-Progress Job #JOB-1002',
      dbAction: 'When 100% completed, automatically transitions Job Card to QUALITY_CHECK.',
    },
    {
      step: 12,
      title: 'Manager Quality Check',
      role: 'SERVICE_MANAGER',
      icon: ShieldCheck,
      description: 'Manager reviews 6-point checklist (Service completed, Parts installed, Cleaned, Warning lights clear, Road test, Complaint resolved).',
      route: '/jobs/job-3',
      buttonText: 'Review QC for Job #JOB-1003',
      dbAction: 'If PASSED: transitions to READY_FOR_DELIVERY & auto-generates Invoice. If FAILED: sends back to technician.',
    },
    {
      step: 13,
      title: 'Invoicing & Multi-Method Payment',
      role: 'BILLING_STAFF',
      icon: CreditCard,
      description: 'Generate tax invoice and record payments via UPI, Card, Cash, or Bank Transfer. Real-time balance deduction until UNPAID -> PAID.',
      route: '/billing',
      buttonText: 'Manage Invoices & Payments',
      dbAction: 'Validates payment does not exceed balance. Unlocks vehicle delivery clearance when balance is ₹0.',
    },
    {
      step: 14,
      title: 'Delivery Handover & Service History',
      role: 'SERVICE_ADVISOR / BILLING',
      icon: Truck,
      description: 'Verify payment clearance, record final exit odometer and customer confirmation, then deliver vehicle. Archives to permanent Service History.',
      route: '/delivery',
      buttonText: 'Perform Vehicle Delivery',
      dbAction: 'Transitions job to DELIVERED and writes complete historical entry into ServiceHistory table.',
    },
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">AUTOCARE 360 Guided Walkthrough</h2>
              <p className="text-xs text-blue-100">
                14-Step Connected Automobile Service Pipeline (Live Data Persistence)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between overflow-x-auto">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Step {current.step} of {steps.length}
          </span>
          <div className="flex items-center gap-1">
            {steps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStep(idx)}
                className={`w-6 h-6 rounded-full text-[10px] font-bold transition flex items-center justify-center ${
                  idx === currentStep
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                    : idx < currentStep
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
                title={`Step ${s.step}: ${s.title}`}
              >
                {idx < currentStep ? '✓' : s.step}
              </button>
            ))}
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
              <StepIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Role: {current.role}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{current.title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{current.description}</p>
            </div>
          </div>

          {/* Database / Business Logic Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Database & System Execution</span>
            </div>
            <p className="text-xs text-slate-600 font-mono bg-white p-3 rounded-lg border border-slate-200 leading-normal">
              {current.dbAction}
            </p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
          >
            <ChevronLeft className="h-4 w-4" /> Previous Step
          </button>

          <Link
            href={current.route}
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <span>{current.buttonText}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>

          <button
            onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
            disabled={currentStep === steps.length - 1}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
          >
            Next Step <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
