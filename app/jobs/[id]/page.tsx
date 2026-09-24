'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CarFront,
  User,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Boxes,
  Calculator,
  ShieldCheck,
  Receipt,
  CreditCard,
  Truck,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Download,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import {
  JobCard,
  InspectionCheckItem,
  InspectionItemCondition,
  Part,
  Labour,
  ServiceTask,
  UserRole,
} from '@/types';
import { useAuth } from '@/lib/authContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [job, setJob] = useState<JobCard | null>(null);
  const [partsCatalogue, setPartsCatalogue] = useState<Part[]>([]);
  const [labourCatalogue, setLabourCatalogue] = useState<Labour[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'inspection' | 'tasks' | 'parts' | 'estimate' | 'qc' | 'invoice' | 'delivery'>('overview');

  // Inspection Checklist State
  const [exteriorChecklist, setExteriorChecklist] = useState<InspectionCheckItem[]>([]);
  const [interiorChecklist, setInteriorChecklist] = useState<InspectionCheckItem[]>([]);
  const [engineChecklist, setEngineChecklist] = useState<InspectionCheckItem[]>([]);
  const [safetyChecklist, setSafetyChecklist] = useState<InspectionCheckItem[]>([]);
  const [inspectionRemarks, setInspectionRemarks] = useState('');

  // Task form state
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskHours, setNewTaskHours] = useState(1.0);

  // Parts form state
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [partError, setPartError] = useState('');

  // Labour form state
  const [selectedLabourId, setSelectedLabourId] = useState('');
  const [labourHours, setLabourHours] = useState(1.0);

  // Estimate discounts
  const [discountAmount, setDiscountAmount] = useState(0);

  // Rejection modal
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // QC Checklist state
  const [qcItems, setQcItems] = useState([
    { id: 'qc-1', title: 'Service execution verified', description: 'All assigned tasks completed satisfactorily', passed: true },
    { id: 'qc-2', title: 'OEM Parts torqued to specification', description: 'Nuts, bolts and fluids inspected', passed: true },
    { id: 'qc-3', title: 'Vehicle foam washed & vacuumed', description: 'Clean exterior and spotless interior', passed: true },
    { id: 'qc-4', title: 'Warning lights & ECU scanned', description: 'No DTCs remaining on instrument cluster', passed: true },
    { id: 'qc-5', title: 'Dynamic road test conducted', description: 'Acceleration, braking, and steering verified', passed: true },
    { id: 'qc-6', title: 'Customer complaint resolved', description: 'Root cause verified rectified', passed: true },
  ]);
  const [qcRemarks, setQcRemarks] = useState('All parameters verified within factory tolerances.');

  // Payment form state
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER'>('UPI');
  const [payRef, setPayRef] = useState('');

  // Delivery form state
  const [finalOdo, setFinalOdo] = useState<number>(0);
  const [deliveryNotes, setDeliveryNotes] = useState('Vehicle handed over in clean condition.');

  const fetchJob = async () => {
    try {
      setLoading(true);
      const [jRes, pRes, lRes] = await Promise.all([
        fetch(`/api/jobs/${params.id}`),
        fetch('/api/inventory'),
        fetch('/api/labour-rates'),
      ]);
      const [jData, pData, lData] = await Promise.all([jRes.json(), pRes.json(), lRes.json()]);

      if (jData.success) {
        const j = jData.data;
        setJob(j);
        setFinalOdo(j.currentOdometer + 5);

        // Populate inspection checklists
        if (j.inspection) {
          setExteriorChecklist(j.inspection.exteriorItems || []);
          setInteriorChecklist(j.inspection.interiorItems || []);
          setEngineChecklist(j.inspection.engineItems || []);
          setSafetyChecklist(j.inspection.safetyItems || []);
          setInspectionRemarks(j.inspection.overallRemarks || '');
        } else {
          // Initialize default checklist
          setExteriorChecklist([
            { id: 'ex-1', category: 'Exterior', item: 'Body Condition & Panels', condition: 'GOOD', notes: 'Checked' },
            { id: 'ex-2', category: 'Exterior', item: 'Windshield & Window Glass', condition: 'GOOD', notes: 'Clear' },
            { id: 'ex-3', category: 'Exterior', item: 'Headlights, Indicators & Tail Lamps', condition: 'GOOD', notes: 'Functional' },
            { id: 'ex-4', category: 'Exterior', item: 'Tyres & Tread Depth', condition: 'GOOD', notes: 'Adequate tread' },
            { id: 'ex-5', category: 'Exterior', item: 'Wipers & Washer Jets', condition: 'GOOD', notes: 'Inspected' },
          ]);
          setInteriorChecklist([
            { id: 'in-1', category: 'Interior', item: 'Cabin AC Cooling & Blower', condition: 'GOOD', notes: 'Working' },
            { id: 'in-2', category: 'Interior', item: 'Dashboard Warning Lights', condition: 'GOOD', notes: 'No DTC' },
            { id: 'in-3', category: 'Interior', item: 'Power Windows & Central Locks', condition: 'GOOD', notes: 'Normal' },
            { id: 'in-4', category: 'Interior', item: 'Seats & Seatbelt Retractors', condition: 'GOOD', notes: 'Locked' },
          ]);
          setEngineChecklist([
            { id: 'en-1', category: 'Engine', item: 'Engine Oil Level & Viscosity', condition: 'ATTENTION', notes: 'Due for change' },
            { id: 'en-2', category: 'Engine', item: 'Coolant Level & Reservoir', condition: 'GOOD', notes: 'Adequate' },
            { id: 'en-3', category: 'Engine', item: '12V Battery Voltage & Terminals', condition: 'GOOD', notes: '12.6V' },
            { id: 'en-4', category: 'Engine', item: 'Drive Belts & Pulleys', condition: 'GOOD', notes: 'Inspected' },
          ]);
          setSafetyChecklist([
            { id: 'sf-1', category: 'Safety', item: 'Front Brake Pads Condition', condition: 'ATTENTION', notes: 'Check thickness' },
            { id: 'sf-2', category: 'Safety', item: 'Rear Brake Shoe/Disc', condition: 'GOOD', notes: 'Satisfactory' },
            { id: 'sf-3', category: 'Safety', item: 'Suspension Struts & Bushings', condition: 'GOOD', notes: 'No leaks' },
          ]);
        }
      }
      if (pData.success) setPartsCatalogue(pData.data);
      if (lData.success) setLabourCatalogue(lData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [params.id]);

  if (loading || !job) {
    return <div className="p-8 text-center text-slate-400">Loading Job Card workspace...</div>;
  }

  // --- Actions ---

  // Save Inspection
  const handleSaveInspection = async () => {
    try {
      const res = await fetch(`/api/jobs/${job.id}/inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectorId: currentUser.id,
          inspectorName: currentUser.name,
          odometer: job.currentOdometer,
          fuelLevelPercent: job.fuelLevelPercent,
          exteriorItems: exteriorChecklist,
          interiorItems: interiorChecklist,
          engineItems: engineChecklist,
          safetyItems: safetyChecklist,
          overallRemarks: inspectionRemarks || 'Inspection completed.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setJob(data.data);
        alert('Inspection checklist saved successfully!');
        setActiveTab('tasks');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc) return;
    try {
      const res = await fetch(`/api/jobs/${job.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newTaskDesc,
          estimatedLabourHours: Number(newTaskHours),
          assignedTechnicianId: job.assignedTechnicianId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setJob(data.data);
        setNewTaskDesc('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update Task Status
  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch(`/api/jobs/${job.id}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to update task status');
        return;
      }
      setJob(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Add Part
  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartError('');
    if (!selectedPartId || partQty <= 0) return;

    try {
      const res = await fetch(`/api/jobs/${job.id}/parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partId: selectedPartId, quantity: Number(partQty) }),
      });
      const data = await res.json();
      if (!data.success) {
        setPartError(data.error || 'Could not allocate part');
        return;
      }
      setJob(data.data);
      setSelectedPartId('');
      setPartQty(1);
      // Refresh parts catalogue stock
      const pRes = await fetch('/api/inventory');
      const pData = await pRes.json();
      if (pData.success) setPartsCatalogue(pData.data);
    } catch {
      setPartError('Network error');
    }
  };

  // Add Labour
  const handleAddLabour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabourId) return;

    try {
      const res = await fetch(`/api/jobs/${job.id}/labour`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labourId: selectedLabourId,
          technicianId: job.assignedTechnicianId,
          hours: Number(labourHours),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setJob(data.data);
        setSelectedLabourId('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Generate / Recalculate Estimate
  const handleGenerateEstimate = async () => {
    try {
      const res = await fetch(`/api/jobs/${job.id}/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountAmount: Number(discountAmount), additionalCharges: 150 }),
      });
      const data = await res.json();
      if (data.success) {
        setJob(data.data);
        alert('Estimate generated and marked WAITING_FOR_APPROVAL!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Customer Approval / Rejection
  const handleCustomerApprovalDecision = async (decision: 'APPROVE' | 'REJECT') => {
    if (decision === 'REJECT' && !rejectionReason) {
      alert('Please enter a rejection reason.');
      return;
    }

    try {
      const res = await fetch(`/api/jobs/${job.id}/estimate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          rejectionReason: decision === 'REJECT' ? rejectionReason : undefined,
          actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role },
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error);
        return;
      }
      setJob(data.data);
      setRejectionModalOpen(false);
      alert(`Estimate ${decision === 'APPROVE' ? 'APPROVED' : 'REJECTED'} successfully! Database updated.`);
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Quality Check
  const handleSubmitQC = async (passed: boolean) => {
    try {
      const res = await fetch(`/api/jobs/${job.id}/quality-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passed,
          remarks: qcRemarks,
          items: qcItems,
          actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setJob(data.data);
        alert(passed ? 'Quality Check PASSED! Job marked READY_FOR_DELIVERY.' : 'QC Failed. Job sent back to technician.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job.invoiceId || payAmount <= 0) return;

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: job.invoiceId,
          amount: Number(payAmount),
          paymentMethod: payMethod,
          referenceNumber: payRef || `UPI-${Date.now().toString().slice(-6)}`,
          actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role },
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error);
        return;
      }
      alert('Payment recorded successfully!');
      fetchJob();
    } catch (e) {
      console.error(e);
    }
  };

  // Deliver Vehicle
  const handleDeliverVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobCardId: job.id,
          finalOdometer: Number(finalOdo),
          customerConfirmation: true,
          deliveryNotes,
          actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role },
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error);
        return;
      }
      setJob(data.data);
      alert('Vehicle successfully marked DELIVERED and archived into Service History!');
      router.push('/history');
    } catch (e) {
      console.error(e);
    }
  };

  // Download PDF Invoice
  const handleDownloadInvoicePDF = () => {
    if (!job) return;
    const doc = new jsPDF();

    // Brand Header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('AUTOCARE 360', 14, 20);
    doc.setFontSize(10);
    doc.text('Complete Vehicle Service Management System', 14, 28);
    doc.text('TAX INVOICE', 160, 22);

    // Invoice Meta
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.text(`Invoice No: ${job.invoiceNumber || 'INV-DRAFT'}`, 14, 46);
    doc.text(`Job Card: ${job.jobId}`, 14, 52);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 58);

    doc.text(`Customer: ${job.customerName}`, 120, 46);
    doc.text(`Phone: ${job.customerPhone}`, 120, 52);
    doc.text(`Vehicle: ${job.vehicleRegistration} (${job.vehicleMake} ${job.vehicleModel})`, 120, 58);

    // Items Table
    const tableData: any[] = [];
    job.parts.forEach((p) => {
      tableData.push([
        p.name,
        'Part',
        p.quantity,
        `Rs. ${p.unitPrice.toLocaleString('en-IN')}`,
        `Rs. ${p.total.toLocaleString('en-IN')}`,
      ]);
    });
    job.labour.forEach((l) => {
      tableData.push([
        l.description,
        'Labour',
        `${l.hours} hrs`,
        `Rs. ${l.ratePerHour}/hr`,
        `Rs. ${l.total.toLocaleString('en-IN')}`,
      ]);
    });

    autoTable(doc, {
      startY: 66,
      head: [['Description', 'Category', 'Qty / Hrs', 'Unit Rate', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const est = job.estimate;
    if (est) {
      doc.text(`Parts Subtotal: Rs. ${est.partsSubtotal.toLocaleString('en-IN')}`, 130, finalY);
      doc.text(`Labour Subtotal: Rs. ${est.labourSubtotal.toLocaleString('en-IN')}`, 130, finalY + 6);
      doc.text(`GST Taxes (18%): Rs. ${est.taxAmount.toLocaleString('en-IN')}`, 130, finalY + 12);
      if (est.discountAmount > 0) {
        doc.text(`Discount: -Rs. ${est.discountAmount.toLocaleString('en-IN')}`, 130, finalY + 18);
      }
      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.text(`Grand Total: Rs. ${est.grandTotal.toLocaleString('en-IN')}`, 130, finalY + 26);
    }

    doc.save(`${job.invoiceNumber || 'Invoice'}_${job.vehicleRegistration}.pdf`);
  };

  // Stepper milestones
  const stepsOrder = [
    { key: 'DRAFT', label: 'Intake' },
    { key: 'INSPECTION', label: 'Inspection' },
    { key: 'ESTIMATE_CREATED', label: 'Estimate' },
    { key: 'WAITING_FOR_APPROVAL', label: 'Approval' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'IN_PROGRESS', label: 'Service' },
    { key: 'QUALITY_CHECK', label: 'QC' },
    { key: 'READY_FOR_DELIVERY', label: 'Ready' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const currentStepIdx = stepsOrder.findIndex((s) => s.key === job.status);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Link & Quick Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/jobs"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Workshop Jobs
        </Link>
        <div className="flex items-center gap-2">
          <StatusBadge status={job.status} size="lg" />
        </div>
      </div>

      {/* Main Job Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                {job.jobId}
              </span>
              <span className="text-xs text-slate-400">Opened {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              {job.vehicleRegistration} — {job.vehicleMake} {job.vehicleModel}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <span className="font-bold text-slate-800">{job.customerName}</span> ({job.customerPhone}) • Advisor: <span className="font-medium text-slate-700">{job.assignedAdvisorName}</span> • Lead Tech: <span className="font-medium text-slate-700">{job.assignedTechnicianName}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Current Odometer</span>
              <span className="text-sm font-bold text-slate-900">{job.currentOdometer.toLocaleString('en-IN')} km</span>
            </div>
            <div className="pl-4 border-l border-slate-200">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Fuel Level</span>
              <span className="text-sm font-bold text-slate-900">{job.fuelLevelPercent}%</span>
            </div>
            <div className="pl-4 border-l border-slate-200">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Estimate Total</span>
              <span className="text-base font-extrabold text-blue-600">
                ₹{job.estimate?.grandTotal.toLocaleString('en-IN') || 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* 9-Stage Milestone Stepper */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {stepsOrder.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step.key} className="flex flex-col items-center min-w-[70px] text-center">
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-semibold mt-1.5 ${
                      isCurrent ? 'text-blue-700 font-extrabold' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Service Progress</span>
            <span className="font-bold text-slate-900">{job.overallProgressPercent}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-1">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${job.overallProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'inspection', label: `Inspection ${job.inspection ? '✓' : ''}` },
          { id: 'tasks', label: `Tasks (${job.tasks.length})` },
          { id: 'parts', label: `Parts & Labour (${job.parts.length + job.labour.length})` },
          { id: 'estimate', label: `Estimate & Approval ${job.estimate ? '✓' : ''}` },
          { id: 'qc', label: `Quality Check ${job.qualityCheck ? '✓' : ''}` },
          { id: 'invoice', label: `Billing & Invoice ${job.invoiceNumber ? '✓' : ''}` },
          { id: 'delivery', label: 'Delivery Clearance' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Customer Initial Concern</h3>
              <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed font-medium">
                "{job.customerComplaint}"
              </p>
            </div>

            {/* Quick Action Cards Based on State */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>Recommended Next Workflow Action</span>
              </div>

              {job.status === 'INSPECTION' && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600">
                    Vehicle is checked in. Technician must execute the 20-point digital checklist.
                  </p>
                  <button
                    onClick={() => setActiveTab('inspection')}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    Open Inspection Checklist
                  </button>
                </div>
              )}

              {job.status === 'ESTIMATE_CREATED' && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600">
                    Inspection done. Review parts and labour, then generate formal estimate for customer.
                  </p>
                  <button
                    onClick={() => setActiveTab('parts')}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    Allocate Parts & Generate Estimate
                  </button>
                </div>
              )}

              {job.status === 'WAITING_FOR_APPROVAL' && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-900">Customer Approval Required!</p>
                    <p className="text-xs text-amber-700">
                      Estimate #{job.estimate?.estimateNumber} is waiting. Customer can approve via Portal.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCustomerApprovalDecision('APPROVE')}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                    >
                      Approve as Customer
                    </button>
                    <button
                      onClick={() => setRejectionModalOpen(true)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {job.status === 'APPROVED' && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600">
                    Estimate approved! Technician Deepak Shinde can begin task execution.
                  </p>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    Start Service Tasks
                  </button>
                </div>
              )}

              {job.status === 'QUALITY_CHECK' && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600">
                    All tasks completed! Manager Arvind Swamy must conduct the 6-point Quality Inspection.
                  </p>
                  <button
                    onClick={() => setActiveTab('qc')}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm"
                  >
                    Conduct Quality Check
                  </button>
                </div>
              )}

              {job.status === 'READY_FOR_DELIVERY' && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600">
                    QC Passed. Collect payment and hand over the vehicle to the customer.
                  </p>
                  <button
                    onClick={() => setActiveTab('delivery')}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                  >
                    Clear for Delivery
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Vehicle Specification</h3>
              <div className="space-y-2 text-xs divide-y divide-slate-100 text-slate-600">
                <div className="pt-1 flex justify-between">
                  <span>Make & Model</span>
                  <span className="font-bold text-slate-900">{job.vehicleMake} {job.vehicleModel}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span>Manufacturing Year</span>
                  <span className="font-bold text-slate-900">{job.vehicleYear}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span>Fuel Powertrain</span>
                  <span className="font-bold text-slate-900">{job.vehicleFuel}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span>Service Tasks</span>
                  <span className="font-bold text-slate-900">{job.tasks.length} tasks registered</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span>Allocated Parts</span>
                  <span className="font-bold text-slate-900">{job.parts.length} line items</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. INSPECTION CHECKLIST TAB */}
      {activeTab === 'inspection' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">20-Point Digital Vehicle Inspection</h3>
              <p className="text-xs text-slate-500">
                Evaluate Exterior, Interior, Engine Bay, and Underbody Safety systems.
              </p>
            </div>
            <button
              onClick={handleSaveInspection}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
            >
              Save Inspection Findings
            </button>
          </div>

          {/* Checklist Sections */}
          <div className="space-y-6">
            {/* Exterior */}
            <div>
              <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider mb-2">
                1. Exterior Condition
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {exteriorChecklist.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-800">{item.item}</span>
                    <div className="flex items-center gap-2">
                      {(['GOOD', 'ATTENTION', 'CRITICAL'] as InspectionItemCondition[]).map((cond) => (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => {
                            const updated = [...exteriorChecklist];
                            updated[idx].condition = cond;
                            setExteriorChecklist(updated);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                            item.condition === cond
                              ? cond === 'GOOD'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : cond === 'ATTENTION'
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-rose-600 text-white border-rose-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {cond}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interior */}
            <div>
              <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider mb-2">
                2. Interior & Cabin Electrical
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {interiorChecklist.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-800">{item.item}</span>
                    <div className="flex items-center gap-2">
                      {(['GOOD', 'ATTENTION', 'CRITICAL'] as InspectionItemCondition[]).map((cond) => (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => {
                            const updated = [...interiorChecklist];
                            updated[idx].condition = cond;
                            setInteriorChecklist(updated);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                            item.condition === cond
                              ? cond === 'GOOD'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : cond === 'ATTENTION'
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-rose-600 text-white border-rose-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {cond}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Engine */}
            <div>
              <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider mb-2">
                3. Engine Bay & Fluids
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {engineChecklist.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-800">{item.item}</span>
                    <div className="flex items-center gap-2">
                      {(['GOOD', 'ATTENTION', 'CRITICAL'] as InspectionItemCondition[]).map((cond) => (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => {
                            const updated = [...engineChecklist];
                            updated[idx].condition = cond;
                            setEngineChecklist(updated);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                            item.condition === cond
                              ? cond === 'GOOD'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : cond === 'ATTENTION'
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-rose-600 text-white border-rose-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {cond}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety */}
            <div>
              <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider mb-2">
                4. Safety & Braking Underbody
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {safetyChecklist.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-800">{item.item}</span>
                    <div className="flex items-center gap-2">
                      {(['GOOD', 'ATTENTION', 'CRITICAL'] as InspectionItemCondition[]).map((cond) => (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => {
                            const updated = [...safetyChecklist];
                            updated[idx].condition = cond;
                            setSafetyChecklist(updated);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                            item.condition === cond
                              ? cond === 'GOOD'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : cond === 'ATTENTION'
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-rose-600 text-white border-rose-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {cond}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Technician Inspection Notes & General Observations
              </label>
              <textarea
                value={inspectionRemarks}
                onChange={(e) => setInspectionRemarks(e.target.value)}
                rows={2}
                placeholder="Front brake pad thickness critical; engine oil dark..."
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. SERVICE TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Add Task Box */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Service Task</h3>
            <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="e.g. Front ceramic brake pads replacement & disc caliper greasing"
                required
                className="flex-1 text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
              />
              <div className="w-28">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={newTaskHours}
                  onChange={(e) => setNewTaskHours(Number(e.target.value))}
                  placeholder="Est. Hours"
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Add Task
              </button>
            </form>
          </div>

          {/* Tasks List */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tasks Execution Pipeline</h3>
                <p className="text-xs text-slate-500">
                  Tasks move from PENDING → IN PROGRESS → COMPLETED. Progress updates automatically.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-700">
                {job.tasks.filter((t) => t.status === 'COMPLETED').length} / {job.tasks.length} Completed
              </span>
            </div>

            {job.status === 'WAITING_FOR_APPROVAL' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  Business Rule: Service tasks cannot be executed while awaiting customer approval.
                </span>
              </div>
            )}

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {job.tasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No tasks registered yet.</div>
              ) : (
                job.tasks.map((task) => (
                  <div key={task.id} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{task.description}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Est: {task.estimatedLabourHours} hrs • Actual: {task.actualLabourHours || 0} hrs • Assigned:{' '}
                        {task.assignedTechnicianName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={task.status} size="sm" />
                      <div className="flex items-center gap-1">
                        {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                            className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                          >
                            Start
                          </button>
                        )}
                        {task.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateTaskStatus(task.id, 'COMPLETED')}
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100"
                          >
                            Mark Done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. PARTS & LABOUR TAB */}
      {activeTab === 'parts' && (
        <div className="space-y-6">
          {/* Add Part to Job */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Allocate Part from Catalogue</h3>
            {partError && (
              <div className="p-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded">
                {partError}
              </div>
            )}
            <form onSubmit={handleAddPart} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <select
                  value={selectedPartId}
                  onChange={(e) => setSelectedPartId(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                >
                  <option value="">Select OEM Part</option>
                  {partsCatalogue.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stockQuantity === 0}>
                      {p.name} ({p.partNumber}) — ₹{p.unitPrice} [Stock: {p.stockQuantity}]
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  value={partQty}
                  onChange={(e) => setPartQty(Number(e.target.value))}
                  placeholder="Qty"
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Add Part (Deducts Stock)
              </button>
            </form>
          </div>

          {/* Allocated Parts Table */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Allocated Parts for Job</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Part Details</th>
                    <th className="py-2.5 px-3">Qty</th>
                    <th className="py-2.5 px-3">Unit Price</th>
                    <th className="py-2.5 px-3">Tax (GST)</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {job.parts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        No parts allocated yet.
                      </td>
                    </tr>
                  ) : (
                    job.parts.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {p.name} <span className="font-mono text-slate-400">({p.partNumber})</span>
                        </td>
                        <td className="py-2.5 px-3">{p.quantity}</td>
                        <td className="py-2.5 px-3">₹{p.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3">₹{p.taxAmount.toLocaleString('en-IN')} ({p.taxRate}%)</td>
                        <td className="py-2.5 px-3 font-extrabold text-slate-900 text-right">
                          ₹{p.total.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Labour Allocation */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Labour Line Item</h3>
            <form onSubmit={handleAddLabour} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <select
                  value={selectedLabourId}
                  onChange={(e) => setSelectedLabourId(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                >
                  <option value="">Select Labour Operation</option>
                  {labourCatalogue.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.description} ({l.code}) — ₹{l.ratePerHour}/hr ({l.standardHours} hrs)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={labourHours}
                  onChange={(e) => setLabourHours(Number(e.target.value))}
                  placeholder="Hours"
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Add Labour Line
              </button>
            </form>

            {/* Labour List */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Labour Code</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Hours</th>
                    <th className="py-2.5 px-3">Rate/hr</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {job.labour.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        No labour line items registered yet.
                      </td>
                    </tr>
                  ) : (
                    job.labour.map((l) => (
                      <tr key={l.id}>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{l.labourCode}</td>
                        <td className="py-2.5 px-3">{l.description}</td>
                        <td className="py-2.5 px-3">{l.hours} hrs</td>
                        <td className="py-2.5 px-3">₹{l.ratePerHour}</td>
                        <td className="py-2.5 px-3 font-extrabold text-slate-900 text-right">
                          ₹{l.total.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. ESTIMATE & APPROVAL TAB */}
      {activeTab === 'estimate' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Service Estimate #{job.estimate?.estimateNumber || 'DRAFT'}
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated from parts, labour, statutory GST taxes (18%), and applied customer discounts.
                </p>
              </div>
              <button
                onClick={handleGenerateEstimate}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
              >
                Recalculate Estimate
              </button>
            </div>

            {/* Breakdown Card */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 space-y-4 max-w-lg mx-auto">
              <div className="space-y-2.5 text-xs text-slate-600 divide-y divide-slate-200/60">
                <div className="flex justify-between font-medium pt-1">
                  <span>Parts Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{job.estimate?.partsSubtotal.toLocaleString('en-IN') || 0}
                  </span>
                </div>
                <div className="flex justify-between font-medium pt-2.5">
                  <span>Labour Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{job.estimate?.labourSubtotal.toLocaleString('en-IN') || 0}
                  </span>
                </div>
                <div className="flex justify-between font-medium pt-2.5">
                  <span>Workshop Consumables & Sanitization</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{job.estimate?.additionalCharges || 150}
                  </span>
                </div>
                <div className="flex justify-between font-medium pt-2.5 text-rose-600">
                  <span>Loyalty Discount</span>
                  <span className="font-mono font-bold">
                    -₹{job.estimate?.discountAmount || 0}
                  </span>
                </div>
                <div className="flex justify-between font-medium pt-2.5">
                  <span>GST Taxes (18%)</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{job.estimate?.taxAmount.toLocaleString('en-IN') || 0}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-3 text-base text-slate-900 font-extrabold border-t-2 border-slate-300">
                  <span>Grand Total</span>
                  <span className="text-xl text-blue-600 font-black">
                    ₹{job.estimate?.grandTotal.toLocaleString('en-IN') || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Approval Decision Box */}
            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Customer Estimate Approval Gateway</h4>
                  <p className="text-xs text-blue-700">
                    Current Status:{' '}
                    <span className="font-extrabold">{job.estimate?.status || 'NOT_GENERATED'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCustomerApprovalDecision('APPROVE')}
                    disabled={job.estimate?.status === 'APPROVED'}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-40 transition"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>Approve Estimate</span>
                  </button>
                  <button
                    onClick={() => setRejectionModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {job.estimate?.rejectionReason && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-800 text-xs border border-rose-200 font-medium">
                  Rejection Reason: "{job.estimate.rejectionReason}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. QUALITY CHECK TAB */}
      {activeTab === 'qc' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Manager Quality Inspection Checklist</h3>
              <p className="text-xs text-slate-500">
                Service center manager must certify all parameters before delivery clearance.
              </p>
            </div>
            {job.qualityCheck && <StatusBadge status={job.qualityCheck.status} size="md" />}
          </div>

          <div className="space-y-3">
            {qcItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between bg-slate-50/50"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">{item.title}</p>
                  <p className="text-[11px] text-slate-500">{item.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={item.passed}
                  onChange={(e) => {
                    const copy = [...qcItems];
                    copy[idx].passed = e.target.checked;
                    setQcItems(copy);
                  }}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Manager Remarks</label>
            <textarea
              value={qcRemarks}
              onChange={(e) => setQcRemarks(e.target.value)}
              rows={2}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleSubmitQC(false)}
              className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition"
            >
              Fail Quality Check (Return to Tech)
            </button>
            <button
              onClick={() => handleSubmitQC(true)}
              className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
            >
              Pass Quality Check & Clear for Invoicing
            </button>
          </div>
        </div>
      )}

      {/* 7. INVOICE & BILLING TAB */}
      {activeTab === 'invoice' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tax Invoice #{job.invoiceNumber || 'INV-PENDING'}
              </h3>
              <p className="text-xs text-slate-500">
                Official GST Tax Invoice and Payment Tracking
              </p>
            </div>
            <button
              onClick={handleDownloadInvoicePDF}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl transition"
            >
              <Download className="h-4 w-4" /> Download PDF Invoice
            </button>
          </div>

          {/* Payment Recording Form */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Record Customer Payment
            </h4>
            <form onSubmit={handleRecordPayment} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <input
                  type="number"
                  min="1"
                  value={payAmount || ''}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  placeholder="Amount in ₹"
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white font-mono font-bold"
                />
              </div>
              <div>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">NEFT / Net Banking</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="Txn / Auth Ref No"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                Record Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. DELIVERY CLEARANCE TAB */}
      {activeTab === 'delivery' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Vehicle Handover & Delivery Clearance</h3>
            <p className="text-xs text-slate-500">
              Verify pre-conditions: QC Passed, Invoice Generated, and Balance Cleared.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold block text-slate-700 mb-1">1. Quality Check</span>
              <StatusBadge status={job.qualityCheck?.status || 'PENDING'} size="sm" />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold block text-slate-700 mb-1">2. Invoice Generated</span>
              <span className="font-mono font-bold text-blue-600">
                {job.invoiceNumber ? `✓ ${job.invoiceNumber}` : 'Pending'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold block text-slate-700 mb-1">3. Status</span>
              <StatusBadge status={job.status} size="sm" />
            </div>
          </div>

          <form onSubmit={handleDeliverVehicle} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Final Exit Odometer (km) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={finalOdo}
                  onChange={(e) => setFinalOdo(Number(e.target.value))}
                  required
                  min={job.currentOdometer}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Handover Notes
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-semibold">
                  Customer verified service satisfaction & accepted vehicle keys.
                </span>
              </div>
              <button
                type="submit"
                disabled={job.status === 'DELIVERED'}
                className="px-6 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50 transition"
              >
                {job.status === 'DELIVERED' ? 'Already Delivered' : 'Complete Handover & Mark DELIVERED'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Customer Estimate Rejection</h3>
            <p className="text-xs text-slate-500">
              Please provide the customer's specific rejection feedback or price revision request.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="e.g. Brake pad cost feels high, please provide alternative aftermarket brand quote..."
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
                onClick={() => handleCustomerApprovalDecision('REJECT')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
