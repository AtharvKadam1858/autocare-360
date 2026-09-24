export type UserRole =
  | 'ADMIN'
  | 'SERVICE_ADVISOR'
  | 'SERVICE_MANAGER'
  | 'TECHNICIAN'
  | 'BILLING_STAFF'
  | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  customerId?: string; // If customer role, linked to customer record
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type FuelType = 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID';

export interface Vehicle {
  id: string;
  customerId: string;
  registrationNumber: string; // e.g., MH 12 AB 4587
  vin: string; // Chassis / VIN
  make: string; // Tata, Mahindra, Hyundai, Maruti, etc.
  model: string; // Nexon, XUV700, Creta, etc.
  variant: string; // XZ+, AX7, SX(O), etc.
  manufacturingYear: number;
  fuelType: FuelType;
  currentOdometer: number;
  color: string;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CANCELLED'
  | 'COMPLETED';

export type ServiceType =
  | 'PERIODIC_MAINTENANCE'
  | 'GENERAL_REPAIR'
  | 'BODY_WORK_PAINT'
  | 'AC_SERVICE'
  | 'BRAKE_SERVICE'
  | 'WHEEL_TYRE_CARE'
  | 'ELECTRICAL_DIAGNOSIS'
  | 'EXPRESS_SERVICE';

export interface Booking {
  id: string;
  bookingNumber: string; // BK-1001
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  vehicleRegistration: string;
  vehicleModel: string;
  serviceType: ServiceType;
  preferredDate: string; // YYYY-MM-DD
  preferredTime: string; // HH:mm
  complaintDescription: string;
  pickupDropPreference: 'SELF_DROP' | 'PICKUP_REQUESTED' | 'DOORSTEP_DROP';
  assignedAdvisorId: string;
  assignedAdvisorName: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus =
  | 'DRAFT'
  | 'INSPECTION'
  | 'ESTIMATE_CREATED'
  | 'WAITING_FOR_APPROVAL'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'READY_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type InspectionItemCondition = 'GOOD' | 'ATTENTION' | 'CRITICAL';

export interface InspectionCheckItem {
  id: string;
  category: 'Exterior' | 'Interior' | 'Engine' | 'Safety';
  item: string;
  condition: InspectionItemCondition;
  notes: string;
}

export interface Inspection {
  id: string;
  jobCardId: string;
  inspectorId: string;
  inspectorName: string;
  odometer: number;
  fuelLevelPercent: number; // 0-100
  visibleDamageNotes: string;
  exteriorItems: InspectionCheckItem[];
  interiorItems: InspectionCheckItem[];
  engineItems: InspectionCheckItem[];
  safetyItems: InspectionCheckItem[];
  photos?: string[];
  overallRemarks: string;
  completedAt: string;
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface ServiceTask {
  id: string;
  jobCardId: string;
  description: string;
  estimatedLabourHours: number;
  actualLabourHours: number;
  status: TaskStatus;
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

export type PartInventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Part {
  id: string;
  partNumber: string; // e.g. BP-102
  name: string;
  category: string;
  brand: string;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  supplier: string;
  taxRate: number; // e.g. 18 for 18% GST
  status: PartInventoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface JobPart {
  id: string;
  jobCardId: string;
  partId: string;
  partNumber: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface Labour {
  id: string;
  code: string;
  description: string;
  standardHours: number;
  ratePerHour: number;
}

export interface JobLabour {
  id: string;
  jobCardId: string;
  labourCode: string;
  description: string;
  technicianId: string;
  technicianName: string;
  hours: number;
  ratePerHour: number;
  total: number;
}

export type EstimateStatus =
  | 'DRAFT'
  | 'SENT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

export interface Estimate {
  id: string;
  estimateNumber: string; // EST-1001
  jobCardId: string;
  partsSubtotal: number;
  labourSubtotal: number;
  additionalCharges: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  status: EstimateStatus;
  rejectionReason?: string;
  approvedByCustomerAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QualityCheckItem {
  id: string;
  title: string;
  description: string;
  passed: boolean;
}

export interface QualityCheck {
  id: string;
  jobCardId: string;
  inspectorId: string;
  inspectorName: string;
  items: QualityCheckItem[];
  status: 'PASSED' | 'FAILED';
  remarks: string;
  checkedAt: string;
}

export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER';

export interface Payment {
  id: string;
  paymentNumber: string; // PAY-1001
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string; // UPI txn or Auth code
  notes?: string;
  receivedById: string;
  receivedByName: string;
  paidAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-1001
  invoiceDate: string;
  jobCardId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  vehicleId: string;
  vehicleRegistration: string;
  vehicleModel: string;
  partsSubtotal: number;
  labourSubtotal: number;
  additionalCharges: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryRecord {
  id: string;
  jobCardId: string;
  vehicleId: string;
  customerId: string;
  deliveryDate: string;
  finalOdometer: number;
  customerConfirmation: boolean;
  staffMemberId: string;
  staffMemberName: string;
  deliveryNotes: string;
  createdAt: string;
}

export interface ServiceHistoryItem {
  id: string;
  vehicleId: string;
  jobCardId: string;
  date: string;
  odometer: number;
  complaints: string;
  servicesPerformed: string[];
  partsUsed: string[];
  totalAmount: number;
  technicianName: string;
  serviceAdvisorName: string;
  invoiceNumber: string;
  status: 'COMPLETED' | 'DELIVERED';
}

export interface JobCard {
  id: string;
  jobId: string; // JOB-1001
  bookingId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleId: string;
  vehicleRegistration: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleFuel: FuelType;
  assignedAdvisorId: string;
  assignedAdvisorName: string;
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  customerComplaint: string;
  currentOdometer: number;
  fuelLevelPercent: number;
  status: JobStatus;
  overallProgressPercent: number; // 0 to 100
  inspection?: Inspection;
  tasks: ServiceTask[];
  parts: JobPart[];
  labour: JobLabour[];
  estimate?: Estimate;
  qualityCheck?: QualityCheck;
  invoiceId?: string;
  invoiceNumber?: string;
  delivery?: DeliveryRecord;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'info' | 'warning' | 'success' | 'urgent';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  roleTarget?: UserRole | 'ALL';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  description: string;
}

export interface DashboardMetrics {
  todayBookingsCount: number;
  vehiclesInServiceCount: number;
  waitingForApprovalCount: number;
  inProgressCount: number;
  readyForDeliveryCount: number;
  totalDeliveredCount: number;
  totalRevenue: number;
  pendingPaymentsAmount: number;
  lowStockPartsCount: number;
}
