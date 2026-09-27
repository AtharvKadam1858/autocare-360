import fs from 'fs';
import path from 'path';
import {
  Customer,
  Vehicle,
  Booking,
  JobCard,
  Part,
  Labour,
  Invoice,
  Payment,
  ServiceHistoryItem,
  Notification,
  AuditLog,
  User,
  DashboardMetrics,
  JobStatus,
  EstimateStatus,
  TaskStatus,
  Inspection,
  ServiceTask,
  JobPart,
  JobLabour,
  QualityCheck,
  UserRole,
} from '@/types';
import {
  INITIAL_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_VEHICLES,
  INITIAL_PARTS,
  INITIAL_LABOUR_RATES,
  INITIAL_BOOKINGS,
  INITIAL_JOB_CARDS,
  INITIAL_INVOICES,
  INITIAL_SERVICE_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './seedData';

interface DatabaseSchema {
  users: User[];
  customers: Customer[];
  vehicles: Vehicle[];
  parts: Part[];
  labourRates: Labour[];
  bookings: Booking[];
  jobCards: JobCard[];
  invoices: Invoice[];
  serviceHistory: ServiceHistoryItem[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

const DB_FILE_PATH = process.env.VERCEL
  ? path.join('/tmp', 'autocare360.db.json')
  : path.join(process.cwd(), 'data', 'autocare360.db.json');

class DatabaseService {
  private data: DatabaseSchema;
  private isInitialized = false;

  constructor() {
    this.data = this.getDefaultState();
    this.init();
  }

  private getDefaultState(): DatabaseSchema {
    return {
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      customers: JSON.parse(JSON.stringify(INITIAL_CUSTOMERS)),
      vehicles: JSON.parse(JSON.stringify(INITIAL_VEHICLES)),
      parts: JSON.parse(JSON.stringify(INITIAL_PARTS)),
      labourRates: JSON.parse(JSON.stringify(INITIAL_LABOUR_RATES)),
      bookings: JSON.parse(JSON.stringify(INITIAL_BOOKINGS)),
      jobCards: JSON.parse(JSON.stringify(INITIAL_JOB_CARDS)),
      invoices: JSON.parse(JSON.stringify(INITIAL_INVOICES)),
      serviceHistory: JSON.parse(JSON.stringify(INITIAL_SERVICE_HISTORY)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
      auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)),
    };
  }

  private init() {
    if (this.isInitialized) return;
    try {
      if (typeof window === 'undefined') {
        const dir = path.dirname(DB_FILE_PATH);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        if (fs.existsSync(DB_FILE_PATH)) {
          const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
          if (raw) {
            const parsed = JSON.parse(raw);
            this.data = {
              ...this.getDefaultState(),
              ...parsed,
            };
          }
        } else {
          this.persist();
        }
      }
    } catch (e) {
      console.warn('DB file storage fallback to memory:', e);
    }
    this.isInitialized = true;
  }

  private persist() {
    try {
      if (typeof window === 'undefined') {
        const dir = path.dirname(DB_FILE_PATH);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
      }
    } catch (e) {
      console.warn('Error persisting DB to disk:', e);
    }
  }

  // --- Reset to Demo Data ---
  public resetToSeed(): void {
    this.data = this.getDefaultState();
    this.persist();
  }

  // --- Audit Log Helper ---
  public logAudit(
    userId: string,
    userName: string,
    userRole: UserRole,
    action: string,
    entity: string,
    entityId: string,
    description: string
  ): void {
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      userRole,
      action,
      entity,
      entityId,
      description,
    };
    this.data.auditLogs.unshift(entry);
    this.persist();
  }

  // --- Notifications Helper ---
  public addNotification(
    title: string,
    message: string,
    type: 'info' | 'warning' | 'success' | 'urgent',
    link?: string,
    roleTarget: UserRole | 'ALL' = 'ALL'
  ): void {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      type,
      isRead: false,
      link,
      roleTarget,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(notif);
    this.persist();
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.data.customers.find((c) => c.id === id);
  }

  public createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>, actor?: { id: string; name: string; role: UserRole }): Customer {
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.data.customers.unshift(newCustomer);
    this.persist();

    if (actor) {
      this.logAudit(actor.id, actor.name, actor.role, 'CUSTOMER_CREATED', 'Customer', newCustomer.id, `Created customer record for ${newCustomer.name} (${newCustomer.phone})`);
    }
    return newCustomer;
  }

  public updateCustomer(id: string, updates: Partial<Customer>, actor?: { id: string; name: string; role: UserRole }): Customer {
    const idx = this.data.customers.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Customer with ID ${id} not found`);

    this.data.customers[idx] = {
      ...this.data.customers[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();

    if (actor) {
      this.logAudit(actor.id, actor.name, actor.role, 'CUSTOMER_UPDATED', 'Customer', id, `Updated customer record for ${this.data.customers[idx].name}`);
    }
    return this.data.customers[idx];
  }

  // --- Vehicles ---
  public getVehicles(): Vehicle[] {
    return this.data.vehicles;
  }

  public getVehicleById(id: string): Vehicle | undefined {
    return this.data.vehicles.find((v) => v.id === id);
  }

  public getVehiclesByCustomerId(customerId: string): Vehicle[] {
    return this.data.vehicles.filter((v) => v.customerId === customerId);
  }

  public createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>, actor?: { id: string; name: string; role: UserRole }): Vehicle {
    const customer = this.getCustomerById(vehicle.customerId);
    if (!customer) throw new Error(`Customer with ID ${vehicle.customerId} does not exist`);

    const regNorm = vehicle.registrationNumber.trim().toUpperCase();
    const existing = this.data.vehicles.find((v) => v.registrationNumber.replace(/\s+/g, '').toUpperCase() === regNorm.replace(/\s+/g, ''));
    if (existing) {
      throw new Error(`Vehicle with registration number ${regNorm} already exists`);
    }

    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `veh-${Date.now()}`,
      registrationNumber: regNorm,
      customerName: customer.name,
      createdAt: now,
      updatedAt: now,
    };
    this.data.vehicles.unshift(newVehicle);
    this.persist();

    if (actor) {
      this.logAudit(actor.id, actor.name, actor.role, 'VEHICLE_REGISTERED', 'Vehicle', newVehicle.id, `Registered vehicle ${newVehicle.registrationNumber} (${newVehicle.make} ${newVehicle.model}) for ${customer.name}`);
    }
    return newVehicle;
  }

  // --- Bookings ---
  public getBookings(): Booking[] {
    return this.data.bookings;
  }

  public getBookingById(id: string): Booking | undefined {
    return this.data.bookings.find((b) => b.id === id);
  }

  public createBooking(booking: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt' | 'updatedAt'>, actor?: { id: string; name: string; role: UserRole }): Booking {
    const customer = this.getCustomerById(booking.customerId);
    if (!customer) throw new Error('Customer does not exist');
    const vehicle = this.getVehicleById(booking.vehicleId);
    if (!vehicle) throw new Error('Vehicle does not exist');

    const nextNumber = this.data.bookings.length + 1001;
    const now = new Date().toISOString();

    const newBooking: Booking = {
      ...booking,
      id: `bk-${Date.now()}`,
      bookingNumber: `BK-${nextNumber}`,
      customerName: customer.name,
      customerPhone: customer.phone,
      vehicleRegistration: vehicle.registrationNumber,
      vehicleModel: `${vehicle.make} ${vehicle.model}`,
      createdAt: now,
      updatedAt: now,
    };

    this.data.bookings.unshift(newBooking);
    this.persist();

    this.addNotification(
      'New Service Booking Requested',
      `Booking #${newBooking.bookingNumber} received for ${newBooking.vehicleRegistration} on ${newBooking.preferredDate}.`,
      'info',
      `/bookings`
    );

    if (actor) {
      this.logAudit(actor.id, actor.name, actor.role, 'BOOKING_CREATED', 'Booking', newBooking.bookingNumber, `Created booking for ${newBooking.vehicleRegistration} (${newBooking.serviceType})`);
    }
    return newBooking;
  }

  public updateBookingStatus(id: string, status: Booking['status'], actor?: { id: string; name: string; role: UserRole }): Booking {
    const idx = this.data.bookings.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error(`Booking ${id} not found`);

    this.data.bookings[idx].status = status;
    this.data.bookings[idx].updatedAt = new Date().toISOString();
    this.persist();

    if (actor) {
      this.logAudit(actor.id, actor.name, actor.role, 'BOOKING_STATUS_CHANGED', 'Booking', this.data.bookings[idx].bookingNumber, `Updated booking status to ${status}`);
    }
    return this.data.bookings[idx];
  }

  // --- Vehicle Check-In & Job Card Creation ---
  public checkInVehicle(
    params: {
      bookingId?: string;
      customerId: string;
      vehicleId: string;
      currentOdometer: number;
      fuelLevelPercent: number;
      complaint: string;
      assignedAdvisorId: string;
      assignedTechnicianId?: string;
    },
    actor: { id: string; name: string; role: UserRole }
  ): JobCard {
    const customer = this.getCustomerById(params.customerId);
    if (!customer) throw new Error('Customer not found');
    const vehicle = this.getVehicleById(params.vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');

    const advisor = this.getUserById(params.assignedAdvisorId) || { name: 'Assigned Advisor' };
    const technician = (params.assignedTechnicianId && this.getUserById(params.assignedTechnicianId)) || { id: 'user-technician', name: 'Deepak Shinde' };

    // Update vehicle current odometer
    vehicle.currentOdometer = Math.max(vehicle.currentOdometer, params.currentOdometer);
    vehicle.updatedAt = new Date().toISOString();

    // If bookingId provided, mark booking checked-in
    if (params.bookingId) {
      const bIdx = this.data.bookings.findIndex((b) => b.id === params.bookingId);
      if (bIdx !== -1) {
        this.data.bookings[bIdx].status = 'CHECKED_IN';
        this.data.bookings[bIdx].updatedAt = new Date().toISOString();
      }
    }

    const nextJobNumber = this.data.jobCards.length + 1001;
    const now = new Date().toISOString();

    const newJob: JobCard = {
      id: `job-${Date.now()}`,
      jobId: `JOB-${nextJobNumber}`,
      bookingId: params.bookingId,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      vehicleId: vehicle.id,
      vehicleRegistration: vehicle.registrationNumber,
      vehicleMake: vehicle.make,
      vehicleModel: vehicle.model,
      vehicleYear: vehicle.manufacturingYear,
      vehicleFuel: vehicle.fuelType,
      assignedAdvisorId: params.assignedAdvisorId,
      assignedAdvisorName: advisor.name,
      assignedTechnicianId: technician.id,
      assignedTechnicianName: technician.name,
      customerComplaint: params.complaint,
      currentOdometer: params.currentOdometer,
      fuelLevelPercent: params.fuelLevelPercent,
      status: 'INSPECTION',
      overallProgressPercent: 10,
      tasks: [],
      parts: [],
      labour: [],
      createdAt: now,
      updatedAt: now,
    };

    this.data.jobCards.unshift(newJob);
    this.persist();

    this.logAudit(actor.id, actor.name, actor.role, 'VEHICLE_CHECKED_IN', 'JobCard', newJob.jobId, `Checked in ${vehicle.registrationNumber} at ${params.currentOdometer} km. Job Card #${newJob.jobId} opened.`);
    this.addNotification(
      'Vehicle Checked In',
      `Vehicle ${vehicle.registrationNumber} checked in. Job Card #${newJob.jobId} created in Inspection status.`,
      'info',
      `/jobs/${newJob.id}`
    );

    return newJob;
  }

  // --- Job Cards ---
  public getJobCards(): JobCard[] {
    return this.data.jobCards;
  }

  public getJobCardById(id: string): JobCard | undefined {
    return this.data.jobCards.find((j) => j.id === id || j.jobId === id);
  }

  public getJobCardsByCustomerId(customerId: string): JobCard[] {
    return this.data.jobCards.filter((j) => j.customerId === customerId);
  }

  public updateJobStatus(id: string, status: JobStatus, actor?: { id: string; name: string; role: UserRole }): JobCard {
    const job = this.getJobCardById(id);
    if (!job) throw new Error(`Job Card ${id} not found`);

    job.status = status;
    job.updatedAt = new Date().toISOString();
    this.persist();

    if (actor) {
      this.logAudit(actor.id, actor.name, actor.role, 'JOB_STATUS_UPDATED', 'JobCard', job.jobId, `Job Card #${job.jobId} status transitioned to ${status}`);
    }
    return job;
  }

  // --- Inspection Checklist ---
  public saveInspection(
    jobCardId: string,
    inspectionData: Omit<Inspection, 'id' | 'jobCardId' | 'completedAt'>,
    actor: { id: string; name: string; role: UserRole }
  ): JobCard {
    const job = this.getJobCardById(jobCardId);
    if (!job) throw new Error('Job Card not found');

    const completedAt = new Date().toISOString();
    const inspection: Inspection = {
      ...inspectionData,
      id: `insp-${Date.now()}`,
      jobCardId: job.id,
      completedAt,
    };

    job.inspection = inspection;
    job.currentOdometer = inspectionData.odometer;
    job.fuelLevelPercent = inspectionData.fuelLevelPercent;

    if (job.status === 'INSPECTION' || job.status === 'DRAFT') {
      job.status = 'ESTIMATE_CREATED';
    }
    job.overallProgressPercent = Math.max(job.overallProgressPercent, 20);
    job.updatedAt = completedAt;
    this.persist();

    this.logAudit(actor.id, actor.name, actor.role, 'INSPECTION_COMPLETED', 'Inspection', inspection.id, `Completed inspection for Job #${job.jobId} (${job.vehicleRegistration})`);
    return job;
  }

  // --- Service Tasks ---
  public addTaskToJob(
    jobCardId: string,
    taskData: {
      description: string;
      estimatedLabourHours: number;
      assignedTechnicianId: string;
    },
    actor?: { id: string; name: string; role: UserRole }
  ): JobCard {
    const job = this.getJobCardById(jobCardId);
    if (!job) throw new Error('Job Card not found');

    const tech = this.getUserById(taskData.assignedTechnicianId) || { name: 'Assigned Tech' };
    const newTask: ServiceTask = {
      id: `tsk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jobCardId: job.id,
      description: taskData.description,
      estimatedLabourHours: taskData.estimatedLabourHours,
      actualLabourHours: 0,
      status: 'PENDING',
      assignedTechnicianId: taskData.assignedTechnicianId,
      assignedTechnicianName: tech.name,
    };

    job.tasks.push(newTask);
    this.recalculateJobProgress(job);
    job.updatedAt = new Date().toISOString();
    this.persist();

    if (actor) {
      this.logAudit(actor.id, actor.name, actor.role, 'TASK_ADDED', 'ServiceTask', newTask.id, `Added task "${newTask.description}" to Job #${job.jobId}`);
    }
    return job;
  }

  public updateTaskStatus(
    jobCardId: string,
    taskId: string,
    status: TaskStatus,
    actualHours?: number,
    actor?: { id: string; name: string; role: UserRole }
  ): JobCard {
    const job = this.getJobCardById(jobCardId);
    if (!job) throw new Error('Job Card not found');

    if (job.status === 'WAITING_FOR_APPROVAL' || job.status === 'ESTIMATE_CREATED' || job.status === 'DRAFT') {
      throw new Error('Service tasks cannot be executed before customer approval');
    }

    const task = job.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    task.status = status;
    if (actualHours !== undefined) {
      task.actualLabourHours = actualHours;
    }
    if (status === 'IN_PROGRESS' && !task.startedAt) {
      task.startedAt = new Date().toISOString();
      if (job.status === 'APPROVED') {
        job.status = 'IN_PROGRESS';
      }
    } else if (status === 'COMPLETED') {
      task.completedAt = new Date().toISOString();
      if (!task.actualLabourHours) {
        task.actualLabourHours = task.estimatedLabourHours;
      }
    }

    this.recalculateJobProgress(job);
    job.updatedAt = new Date().toISOString();
    this.persist();

    if (actor) {
      this.logAudit(actor.id, actor.name, actor.role, 'TASK_STATUS_UPDATED', 'ServiceTask', taskId, `Task "${task.description}" updated to ${status}`);
    }
    return job;
  }

  private recalculateJobProgress(job: JobCard): void {
    if (!job.tasks || job.tasks.length === 0) return;

    const completed = job.tasks.filter((t) => t.status === 'COMPLETED').length;
    const inProgress = job.tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const total = job.tasks.length;

    const percent = Math.round(((completed + inProgress * 0.5) / total) * 100);
    job.overallProgressPercent = Math.min(100, Math.max(job.overallProgressPercent, percent));

    // If all tasks are completed and job is in IN_PROGRESS, advance to QUALITY_CHECK!
    if (completed === total && job.status === 'IN_PROGRESS') {
      job.status = 'QUALITY_CHECK';
      job.overallProgressPercent = 100;
      this.addNotification(
        'Ready for Quality Check',
        `All tasks completed for Job #${job.jobId} (${job.vehicleRegistration}). Ready for Manager Quality Check.`,
        'info',
        `/jobs/${job.id}`,
        'SERVICE_MANAGER'
      );
    }
  }

  // --- Parts Management ---
  public getParts(): Part[] {
    return this.data.parts;
  }

  public getPartById(id: string): Part | undefined {
    return this.data.parts.find((p) => p.id === id);
  }

  public addPartToJob(
    jobCardId: string,
    partId: string,
    quantity: number,
    actor?: { id: string; name: string; role: UserRole }
  ): JobCard {
    const job = this.getJobCardById(jobCardId);
    if (!job) throw new Error('Job Card not found');

    const part = this.getPartById(partId);
    if (!part) throw new Error('Part not found');

    if (part.stockQuantity < quantity) {
      throw new Error(`Insufficient inventory. Available: ${part.stockQuantity}, Requested: ${quantity}`);
    }

    // Deduct stock
    part.stockQuantity -= quantity;
    if (part.stockQuantity === 0) {
      part.status = 'OUT_OF_STOCK';
      this.addNotification('Part Out of Stock', `Part ${part.name} (${part.partNumber}) is now OUT OF STOCK!`, 'urgent', '/inventory', 'ADMIN');
    } else if (part.stockQuantity <= part.reorderLevel) {
      part.status = 'LOW_STOCK';
      this.addNotification('Part Low Stock Warning', `Part ${part.name} (${part.partNumber}) has dropped to ${part.stockQuantity} units (Reorder level: ${part.reorderLevel})`, 'warning', '/inventory', 'ADMIN');
    }
    part.updatedAt = new Date().toISOString();

    const unitPrice = part.unitPrice;
    const taxRate = part.taxRate;
    const taxAmount = (unitPrice * quantity * taxRate) / 100;
    const total = unitPrice * quantity + taxAmount;

    const jobPart: JobPart = {
      id: `jp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jobCardId: job.id,
      partId: part.id,
      partNumber: part.partNumber,
      name: part.name,
      quantity,
      unitPrice,
      taxRate,
      taxAmount,
      total,
    };

    job.parts.push(jobPart);
    this.recalculateEstimate(job);
    job.updatedAt = new Date().toISOString();
    this.persist();

    if (actor) {
      this.logAudit(actor.id, actor.name, actor.role, 'PART_ADDED_TO_JOB', 'Part', part.partNumber, `Allocated ${quantity}x ${part.name} to Job #${job.jobId}`);
    }
    return job;
  }

  public updatePartStock(partId: string, quantityToAdd: number, actor?: { id: string; name: string; role: UserRole }): Part {
    const part = this.getPartById(partId);
    if (!part) throw new Error('Part not found');

    part.stockQuantity += quantityToAdd;
    if (part.stockQuantity > part.reorderLevel) {
      part.status = 'IN_STOCK';
    } else if (part.stockQuantity > 0) {
      part.status = 'LOW_STOCK';
    } else {
      part.status = 'OUT_OF_STOCK';
    }
    part.updatedAt = new Date().toISOString();
    this.persist();

    if (actor) {
      this.logAudit(actor.id, actor.name, actor.role, 'INVENTORY_RESTOCKED', 'Part', part.partNumber, `Restocked ${quantityToAdd} units of ${part.name}. New total: ${part.stockQuantity}`);
    }
    return part;
  }

  // --- Labour ---
  public getLabourRates(): Labour[] {
    return this.data.labourRates;
  }

  public addLabourToJob(
    jobCardId: string,
    labourId: string,
    technicianId: string,
    hours?: number,
    actor?: { id: string; name: string; role: UserRole }
  ): JobCard {
    const job = this.getJobCardById(jobCardId);
    if (!job) throw new Error('Job Card not found');

    const rate = this.data.labourRates.find((l) => l.id === labourId);
    if (!rate) throw new Error('Labour code not found');

    const tech = this.getUserById(technicianId) || { name: 'Assigned Tech' };
    const actualHours = hours || rate.standardHours;
    const total = actualHours * rate.ratePerHour;

    const jobLabour: JobLabour = {
      id: `jl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jobCardId: job.id,
      labourCode: rate.code,
      description: rate.description,
      technicianId,
      technicianName: tech.name,
      hours: actualHours,
      ratePerHour: rate.ratePerHour,
      total,
    };

    job.labour.push(jobLabour);
    this.recalculateEstimate(job);
    job.updatedAt = new Date().toISOString();
    this.persist();

    if (actor) {
      this.logAudit(actor.id, actor.name, actor.role, 'LABOUR_ADDED', 'Labour', rate.code, `Added labour line "${rate.description}" (${actualHours} hrs) to Job #${job.jobId}`);
    }
    return job;
  }

  // --- Estimates ---
  public generateOrUpdateEstimate(
    jobCardId: string,
    discounts: number = 0,
    additionalCharges: number = 0,
    actor?: { id: string; name: string; role: UserRole }
  ): JobCard {
    const job = this.getJobCardById(jobCardId);
    if (!job) throw new Error('Job Card not found');

    this.recalculateEstimate(job, discounts, additionalCharges);
    if (job.status === 'DRAFT' || job.status === 'INSPECTION') {
      job.status = 'WAITING_FOR_APPROVAL';
    }
    job.updatedAt = new Date().toISOString();
    this.persist();

    if (job.estimate) {
      this.addNotification(
        'Estimate Awaiting Customer Approval',
        `Estimate #${job.estimate.estimateNumber} for ₹${job.estimate.grandTotal.toLocaleString('en-IN')} is awaiting approval for ${job.customerName}.`,
        'warning',
        `/jobs/${job.id}`
      );
    }

    if (actor && job.estimate) {
      this.logAudit(actor.id, actor.name, actor.role, 'ESTIMATE_GENERATED', 'Estimate', job.estimate.estimateNumber, `Generated estimate #${job.estimate.estimateNumber} for Job #${job.jobId} (Total: ₹${job.estimate.grandTotal})`);
    }
    return job;
  }

  private recalculateEstimate(job: JobCard, discount = 0, additional = 0): void {
    const partsSubtotal = job.parts.reduce((acc, p) => acc + p.unitPrice * p.quantity, 0);
    const labourSubtotal = job.labour.reduce((acc, l) => acc + l.total, 0);

    const partsTax = job.parts.reduce((acc, p) => acc + p.taxAmount, 0);
    const labourTax = labourSubtotal * 0.18; // 18% GST on services
    const taxAmount = Number((partsTax + labourTax).toFixed(2));

    const grandTotal = Number((partsSubtotal + labourSubtotal + additional - discount + taxAmount).toFixed(2));

    const estNumber = job.estimate?.estimateNumber || `EST-${1000 + this.data.jobCards.indexOf(job) + 1}`;

    job.estimate = {
      id: job.estimate?.id || `est-${Date.now()}`,
      estimateNumber: estNumber,
      jobCardId: job.id,
      partsSubtotal,
      labourSubtotal,
      additionalCharges: additional || job.estimate?.additionalCharges || 0,
      discountAmount: discount || job.estimate?.discountAmount || 0,
      taxAmount,
      grandTotal,
      status: job.estimate?.status || 'PENDING_APPROVAL',
      rejectionReason: job.estimate?.rejectionReason,
      approvedByCustomerAt: job.estimate?.approvedByCustomerAt,
      createdAt: job.estimate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // --- Customer Approval & Rejection ---
  public handleCustomerApproval(
    jobCardId: string,
    decision: 'APPROVE' | 'REJECT',
    rejectionReason?: string,
    actor?: { id: string; name: string; role: UserRole }
  ): JobCard {
    const job = this.getJobCardById(jobCardId);
    if (!job) throw new Error('Job Card not found');
    if (!job.estimate) throw new Error('Cannot approve or reject a job without an estimate');

    const now = new Date().toISOString();

    if (decision === 'APPROVE') {
      job.estimate.status = 'APPROVED';
      job.estimate.approvedByCustomerAt = now;
      job.status = 'APPROVED';
      job.overallProgressPercent = Math.max(job.overallProgressPercent, 35);

      this.addNotification(
        'Estimate Approved by Customer',
        `Estimate #${job.estimate.estimateNumber} has been APPROVED by ${job.customerName}. Technicians can proceed!`,
        'success',
        `/jobs/${job.id}`
      );
      this.logAudit(
        actor?.id || 'cust-portal',
        actor?.name || job.customerName,
        actor?.role || 'CUSTOMER',
        'ESTIMATE_APPROVED',
        'Estimate',
        job.estimate.estimateNumber,
        `Customer approved service estimate #${job.estimate.estimateNumber} for ₹${job.estimate.grandTotal.toLocaleString('en-IN')}`
      );
    } else {
      job.estimate.status = 'REJECTED';
      job.estimate.rejectionReason = rejectionReason || 'Customer requested revisions';
      job.status = 'ESTIMATE_CREATED';

      this.addNotification(
        'Estimate Rejected by Customer',
        `Estimate #${job.estimate.estimateNumber} was REJECTED by ${job.customerName}: "${job.estimate.rejectionReason}"`,
        'urgent',
        `/jobs/${job.id}`,
        'SERVICE_ADVISOR'
      );
      this.logAudit(
        actor?.id || 'cust-portal',
        actor?.name || job.customerName,
        actor?.role || 'CUSTOMER',
        'ESTIMATE_REJECTED',
        'Estimate',
        job.estimate.estimateNumber,
        `Customer rejected estimate #${job.estimate.estimateNumber}: ${rejectionReason}`
      );
    }

    job.updatedAt = now;
    this.persist();
    return job;
  }

  // --- Quality Check ---
  public submitQualityCheck(
    jobCardId: string,
    passed: boolean,
    remarks: string,
    checklistItems: { id: string; title: string; description: string; passed: boolean }[],
    actor: { id: string; name: string; role: UserRole }
  ): JobCard {
    const job = this.getJobCardById(jobCardId);
    if (!job) throw new Error('Job Card not found');

    const now = new Date().toISOString();
    const qc: QualityCheck = {
      id: `qc-${Date.now()}`,
      jobCardId: job.id,
      inspectorId: actor.id,
      inspectorName: actor.name,
      items: checklistItems,
      status: passed ? 'PASSED' : 'FAILED',
      remarks,
      checkedAt: now,
    };

    job.qualityCheck = qc;

    if (passed) {
      job.status = 'READY_FOR_DELIVERY';
      job.overallProgressPercent = 100;
      this.logAudit(actor.id, actor.name, actor.role, 'QUALITY_CHECK_PASSED', 'QualityCheck', qc.id, `Quality Check PASSED for Job #${job.jobId} (${job.vehicleRegistration})`);

      // Auto-generate invoice if not already generated!
      if (!job.invoiceId) {
        this.generateInvoiceForJob(job.id, actor);
      }

      this.addNotification(
        'Quality Check Passed - Ready for Delivery',
        `Job #${job.jobId} passed QA inspection. Ready for billing clearance and delivery.`,
        'success',
        `/billing`,
        'BILLING_STAFF'
      );
    } else {
      job.status = 'IN_PROGRESS';
      this.logAudit(actor.id, actor.name, actor.role, 'QUALITY_CHECK_FAILED', 'QualityCheck', qc.id, `Quality Check FAILED for Job #${job.jobId}: ${remarks}`);
      this.addNotification(
        'Quality Check Failed',
        `Job #${job.jobId} failed inspection: "${remarks}". Returned to technician for rectification.`,
        'urgent',
        `/jobs/${job.id}`,
        'TECHNICIAN'
      );
    }

    job.updatedAt = now;
    this.persist();
    return job;
  }

  // --- Invoicing ---
  public getInvoices(): Invoice[] {
    return this.data.invoices;
  }

  public getInvoiceById(id: string): Invoice | undefined {
    return this.data.invoices.find((inv) => inv.id === id || inv.invoiceNumber === id);
  }

  public getInvoiceByJobId(jobCardId: string): Invoice | undefined {
    return this.data.invoices.find((inv) => inv.jobCardId === jobCardId);
  }

  public generateInvoiceForJob(jobCardId: string, actor: { id: string; name: string; role: UserRole }): Invoice {
    const job = this.getJobCardById(jobCardId);
    if (!job) throw new Error('Job Card not found');

    const existing = this.getInvoiceByJobId(job.id);
    if (existing) return existing;

    const customer = this.getCustomerById(job.customerId);
    const vehicle = this.getVehicleById(job.vehicleId);

    const partsSubtotal = job.parts.reduce((acc, p) => acc + p.unitPrice * p.quantity, 0);
    const labourSubtotal = job.labour.reduce((acc, l) => acc + l.total, 0);
    const additionalCharges = job.estimate?.additionalCharges || 150;
    const discountAmount = job.estimate?.discountAmount || 0;
    const taxAmount = job.estimate?.taxAmount || Number(((partsSubtotal + labourSubtotal) * 0.18).toFixed(2));
    const grandTotal = Number((partsSubtotal + labourSubtotal + additionalCharges - discountAmount + taxAmount).toFixed(2));

    const nextInvNumber = `INV-${this.data.invoices.length + 1004}`;
    const now = new Date().toISOString();

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: nextInvNumber,
      invoiceDate: now,
      jobCardId: job.id,
      customerId: job.customerId,
      customerName: job.customerName,
      customerPhone: job.customerPhone,
      customerEmail: job.customerEmail,
      customerAddress: customer?.address || 'Baner, Pune, MH',
      vehicleId: job.vehicleId,
      vehicleRegistration: job.vehicleRegistration,
      vehicleModel: `${job.vehicleMake} ${job.vehicleModel}`,
      partsSubtotal,
      labourSubtotal,
      additionalCharges,
      discountAmount,
      taxAmount,
      grandTotal,
      paidAmount: 0,
      balanceAmount: grandTotal,
      paymentStatus: 'UNPAID',
      payments: [],
      createdAt: now,
      updatedAt: now,
    };

    job.invoiceId = invoice.id;
    job.invoiceNumber = invoice.invoiceNumber;
    this.data.invoices.unshift(invoice);
    this.persist();

    this.logAudit(actor.id, actor.name, actor.role, 'INVOICE_GENERATED', 'Invoice', invoice.invoiceNumber, `Generated tax invoice #${invoice.invoiceNumber} for ₹${invoice.grandTotal.toLocaleString('en-IN')}`);
    return invoice;
  }

  // --- Payments ---
  public recordPayment(
    invoiceId: string,
    amount: number,
    paymentMethod: Payment['paymentMethod'],
    referenceNumber: string,
    notes: string | undefined,
    actor: { id: string; name: string; role: UserRole }
  ): Invoice {
    const invoice = this.getInvoiceById(invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    if (amount <= 0) throw new Error('Payment amount must be greater than zero');
    if (amount > invoice.balanceAmount + 0.01) {
      throw new Error(`Payment cannot exceed outstanding balance of ₹${invoice.balanceAmount}`);
    }

    const nextPaymentNumber = `PAY-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const payment: Payment = {
      id: `pay-${Date.now()}`,
      paymentNumber: nextPaymentNumber,
      invoiceId: invoice.id,
      amount,
      paymentMethod,
      referenceNumber,
      notes,
      receivedById: actor.id,
      receivedByName: actor.name,
      paidAt: now,
    };

    invoice.payments.push(payment);
    invoice.paidAmount = Number((invoice.paidAmount + amount).toFixed(2));
    invoice.balanceAmount = Math.max(0, Number((invoice.grandTotal - invoice.paidAmount).toFixed(2)));

    if (invoice.balanceAmount === 0) {
      invoice.paymentStatus = 'PAID';
    } else {
      invoice.paymentStatus = 'PARTIALLY_PAID';
    }
    invoice.updatedAt = now;
    this.persist();

    this.logAudit(actor.id, actor.name, actor.role, 'PAYMENT_RECORDED', 'Payment', payment.paymentNumber, `Recorded payment of ₹${amount} via ${paymentMethod} for Invoice #${invoice.invoiceNumber}`);
    this.addNotification(
      'Payment Recorded',
      `Payment of ₹${amount.toLocaleString('en-IN')} received for Invoice #${invoice.invoiceNumber} via ${paymentMethod}.`,
      'success',
      `/billing`
    );
    return invoice;
  }

  // --- Vehicle Delivery ---
  public deliverVehicle(
    jobCardId: string,
    params: {
      finalOdometer: number;
      customerConfirmation: boolean;
      deliveryNotes: string;
    },
    actor: { id: string; name: string; role: UserRole }
  ): JobCard {
    const job = this.getJobCardById(jobCardId);
    if (!job) throw new Error('Job Card not found');

    if (job.status !== 'READY_FOR_DELIVERY') {
      throw new Error(`Vehicle cannot be delivered while in "${job.status}" status. Quality check must be PASSED first.`);
    }

    const invoice = this.getInvoiceByJobId(job.id);
    if (!invoice) {
      throw new Error('Cannot deliver vehicle without an invoice.');
    }
    if (invoice.paymentStatus !== 'PAID' && invoice.balanceAmount > 0) {
      throw new Error(`Cannot deliver vehicle with outstanding invoice balance of ₹${invoice.balanceAmount}. Payment must be cleared.`);
    }

    const now = new Date().toISOString();
    job.delivery = {
      id: `del-${Date.now()}`,
      jobCardId: job.id,
      vehicleId: job.vehicleId,
      customerId: job.customerId,
      deliveryDate: now,
      finalOdometer: params.finalOdometer,
      customerConfirmation: params.customerConfirmation,
      staffMemberId: actor.id,
      staffMemberName: actor.name,
      deliveryNotes: params.deliveryNotes,
      createdAt: now,
    };

    job.status = 'DELIVERED';
    job.overallProgressPercent = 100;
    job.updatedAt = now;

    // Update vehicle odometer
    const vehicle = this.getVehicleById(job.vehicleId);
    if (vehicle) {
      vehicle.currentOdometer = Math.max(vehicle.currentOdometer, params.finalOdometer);
      vehicle.updatedAt = now;
    }

    // Add entry to permanent Service History
    const historyItem: ServiceHistoryItem = {
      id: `sh-${Date.now()}`,
      vehicleId: job.vehicleId,
      jobCardId: job.id,
      date: now.split('T')[0],
      odometer: params.finalOdometer,
      complaints: job.customerComplaint,
      servicesPerformed: job.tasks.map((t) => t.description),
      partsUsed: job.parts.map((p) => `${p.name} (x${p.quantity})`),
      totalAmount: invoice.grandTotal,
      technicianName: job.assignedTechnicianName,
      serviceAdvisorName: job.assignedAdvisorName,
      invoiceNumber: invoice.invoiceNumber,
      status: 'DELIVERED',
    };
    this.data.serviceHistory.unshift(historyItem);

    this.persist();

    this.logAudit(actor.id, actor.name, actor.role, 'VEHICLE_DELIVERED', 'Delivery', job.jobId, `Vehicle ${job.vehicleRegistration} successfully handed over and delivered to ${job.customerName}`);
    this.addNotification(
      'Vehicle Handover Complete',
      `Vehicle ${job.vehicleRegistration} has been delivered to ${job.customerName}. Service history archived.`,
      'success',
      `/history`
    );
    return job;
  }

  // --- Service History ---
  public getServiceHistory(vehicleId?: string): ServiceHistoryItem[] {
    if (vehicleId) {
      return this.data.serviceHistory.filter((sh) => sh.vehicleId === vehicleId);
    }
    return this.data.serviceHistory;
  }

  // --- Notifications ---
  public getNotifications(): Notification[] {
    return this.data.notifications;
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.persist();
    }
  }

  public markAllNotificationsAsRead(): void {
    this.data.notifications.forEach((n) => (n.isRead = true));
    this.persist();
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  // --- Dashboard Analytics ---
  public getDashboardMetrics(): DashboardMetrics {
    const todayStr = new Date().toISOString().split('T')[0];

    const todayBookingsCount = this.data.bookings.filter(
      (b) => b.preferredDate === todayStr || b.createdAt.startsWith(todayStr)
    ).length;

    const vehiclesInServiceCount = this.data.jobCards.filter(
      (j) => j.status !== 'DELIVERED' && j.status !== 'CANCELLED'
    ).length;

    const waitingForApprovalCount = this.data.jobCards.filter(
      (j) => j.status === 'WAITING_FOR_APPROVAL'
    ).length;

    const inProgressCount = this.data.jobCards.filter(
      (j) => j.status === 'IN_PROGRESS' || j.status === 'APPROVED'
    ).length;

    const readyForDeliveryCount = this.data.jobCards.filter(
      (j) => j.status === 'READY_FOR_DELIVERY'
    ).length;

    const totalDeliveredCount = this.data.jobCards.filter(
      (j) => j.status === 'DELIVERED'
    ).length;

    const totalRevenue = this.data.invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);

    const pendingPaymentsAmount = this.data.invoices.reduce((acc, inv) => acc + inv.balanceAmount, 0);

    const lowStockPartsCount = this.data.parts.filter(
      (p) => p.status === 'LOW_STOCK' || p.status === 'OUT_OF_STOCK'
    ).length;

    return {
      todayBookingsCount,
      vehiclesInServiceCount,
      waitingForApprovalCount,
      inProgressCount,
      readyForDeliveryCount,
      totalDeliveredCount,
      totalRevenue,
      pendingPaymentsAmount,
      lowStockPartsCount,
    };
  }

  public getDashboardChartsData() {
    // 1. Service Jobs by Status
    const statusCounts: Record<string, number> = {};
    this.data.jobCards.forEach((j) => {
      statusCounts[j.status] = (statusCounts[j.status] || 0) + 1;
    });
    const jobsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace(/_/g, ' '),
      value: count,
    }));

    // 2. Monthly Revenue Trend
    const monthlyRevenue = [
      { month: 'Apr', revenue: 64200, bookings: 18 },
      { month: 'May', revenue: 78500, bookings: 24 },
      { month: 'Jun', revenue: 91400, bookings: 29 },
      { month: 'Jul', revenue: 84000, bookings: 26 },
      { month: 'Aug', revenue: 104500, bookings: 35 },
      { month: 'Sep', revenue: 118350, bookings: 38 },
    ];

    // 3. Popular Services
    const serviceTypeCounts: Record<string, number> = {};
    this.data.bookings.forEach((b) => {
      const type = b.serviceType.replace(/_/g, ' ');
      serviceTypeCounts[type] = (serviceTypeCounts[type] || 0) + 1;
    });
    const popularServices = Object.entries(serviceTypeCounts).map(([type, count]) => ({
      name: type,
      count,
    }));

    // 4. Parts consumption
    const partsUsage: Record<string, number> = {};
    this.data.jobCards.forEach((j) => {
      j.parts.forEach((p) => {
        partsUsage[p.name] = (partsUsage[p.name] || 0) + p.quantity;
      });
    });
    const topParts = Object.entries(partsUsage)
      .slice(0, 5)
      .map(([name, quantity]) => ({
        name: name.length > 20 ? name.slice(0, 18) + '...' : name,
        quantity,
      }));

    return {
      jobsByStatus,
      monthlyRevenue,
      popularServices,
      topParts,
    };
  }
}

// Global singleton instance
export const db = new DatabaseService();
