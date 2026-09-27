# AUTOCARE 360 — Complete Vehicle Service Management System

> **A Production-Grade SaaS Platform for Automobile Service Center Operations**  
> Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Recharts, and Relational Database Engine.

> **🚀 Live Production Deployment**: [https://autocare-360-seven.vercel.app](https://autocare-360-seven.vercel.app)  
> **📦 GitHub Repository**: [https://github.com/AtharvKadam1858/autocare-360](https://github.com/AtharvKadam1858/autocare-360)

---

## 1. Project Overview & Business Problem

Modern automobile service workshops suffer from fragmented operational silos: bookings written in paper diaries, parts managed in disconnected spreadsheets, customer repair approvals negotiated informally over phone calls or WhatsApp, and bills generated on standalone point-of-sale machines.

This lack of integration creates:
- **Revenue Leakage**: Parts installed by technicians without systematic inventory reservation or tax calculation.
- **Customer Disputes**: Unapproved labour charges and unexpected invoice totals.
- **Turnaround Bottlenecks**: Delays between inspection, customer approval, and bay scheduling.
- **Safety Liabilities**: Inadequate pre-delivery inspection records and missing service history.

**AUTOCARE 360** solves this by establishing **one continuous, connected digital pipeline**:
```
Customer Registration ➔ Vehicle Registration ➔ Service Booking ➔ Vehicle Check-In ➔
20-Point Digital Inspection ➔ Service Tasks ➔ Parts Inventory Allocation ➔ Labour Estimation ➔
Service Estimate ➔ Customer Approval Gateway ➔ Service Execution ➔ Quality Check ➔
Tax Invoice ➔ Multi-Method Payments ➔ Vehicle Delivery Handover ➔ Lifetime Service History
```

---

## 2. Key Features

- **Operations Control Dashboard**: Real-time KPI cards, Recharts visualizations for monthly revenue realization, job status distribution, and low-stock alerts.
- **Interactive Guided Demo Mode**: Built-in 14-step timeline modal (`Interactive Demo Tour`) allowing interviewers and evaluators to test and step through the full pipeline with live state changes.
- **Customer & Fleet Registry**: Relational customer profiles linked to vehicles with unique license plates, VINs, fuel types, and odometer histories.
- **Service Bookings**: Appointment scheduling with automated conflict detection preventing double-booking the same vehicle in overlapping slots.
- **Vehicle Check-In Desk**: Entry intake capturing odometer, interactive fuel gauge, existing body scratch checklist, customer complaints, and immediate Job Card generation in `INSPECTION` state.
- **20-Point Digital Vehicle Inspection**: Categorized checklist across Exterior, Interior, Engine, and Safety systems with `GOOD`, `ATTENTION`, and `CRITICAL` condition flags.
- **Service Tasks Execution**: Tasks transition through `PENDING` ➔ `IN_PROGRESS` ➔ `COMPLETED`. Overall job progress automatically recalculates ($$\text{Progress} = \frac{\text{Completed} + 0.5 \times \text{In Progress}}{\text{Total}} \times 100\%$$).
- **Parts Management & Auto-Deduction**: Real-time inventory catalogue. Adding parts to a job verifies stock, decrements quantity, triggers `LOW_STOCK` warnings, and prevents negative stock.
- **Labour Operations**: Standard operation codes, standard hours, hourly rates, and technician allocation.
- **Service Estimates**: Precise computation of Parts + Labour + Consumables - Discounts + Statutory GST (18%).
- **Customer Approval Gateway**: Customer reviews estimate via dedicated portal and executes real database state transitions (`APPROVE` or `REJECT` with mandatory reason). Unlocks service task execution only when approved.
- **Manager Quality Check**: 6-point certification (task execution, parts torqued, foam wash, OBD scan, dynamic road test, complaint resolution) required before delivery. Automatically creates the tax invoice upon passing.
- **Billing & Payments**: Tax invoice tracking, balance calculations, and multi-method payment receipt (`UPI`, `CARD`, `CASH`, `BANK_TRANSFER`).
- **High-Resolution PDF Invoices**: Branded, printable GST tax invoices generated via `jspdf` and `jspdf-autotable`.
- **Delivery Clearance Gates**: Enforces 3 mandatory prerequisites (QC Passed, Invoice Generated, Payment Balance = ₹0) before allowing handover.
- **Vehicle Lifetime Service History**: Immutable chronological audit archive of past visits, complaints, parts replaced, and invoice records.
- **In-App Notification Engine**: Notification drawer with unread counter badge and alerts for low stock, approval requests, and delivery readiness.
- **System Audit Trail**: Complete immutable event log tracking operator, role, action, entity, and timestamp.

---

## 3. Technology Stack

- **Frontend Framework**: Next.js 14.2 (App Router)
- **UI & Components**: React 18, Tailwind CSS, Lucide React Icons
- **Data Analytics & Charts**: Recharts
- **Document Generation**: jsPDF, jsPDF-AutoTable
- **Language**: TypeScript 5 (Strict Mode)
- **Backend**: Next.js Server-Side API Route Handlers
- **Database Engine**: Relational Service Engine with Atomic JSON Disk Persistence (`data/autocare360.db.json`) and zero-latency in-memory cache
- **Deployment**: Vercel Serverless Ready

---

## 4. User Roles & Demo Credentials

AUTOCARE 360 features role-based access control with a **1-click Quick Role Switcher** in the top header:

| Role | Name | Email | Password | Primary Capabilities |
|---|---|---|---|---|
| **Admin** | Rahul Khurana | `admin@autocare360.demo` | `Demo@12345` | Full system access, configuration, restock, audit trail |
| **Service Advisor** | Sameer Joshi | `advisor@autocare360.demo` | `Demo@12345` | Customer check-in, bookings, estimate presentation, delivery |
| **Service Manager** | Arvind Swamy | `manager@autocare360.demo` | `Demo@12345` | Workshop floor oversight, technician delegation, Quality Check |
| **Technician** | Deepak Shinde | `technician@autocare360.demo` | `Demo@12345` | 20-point inspection checklist, service task execution |
| **Billing Staff** | Neha Kulkarni | `billing@autocare360.demo` | `Demo@12345` | Tax invoice generation, payment recording, balance clearance |
| **Customer** | Rahul Patil | `customer@autocare360.demo` | `Demo@12345` | Private Customer Portal, live tracking, 1-click Approve / Reject |

---

## 5. Local Setup & Installation

### Prerequisites
- Node.js 18.x or higher (Tested on Node.js v24.13.1)
- npm 9.x or higher

### Installation Steps

1. Clone or extract the repository:
```bash
git clone <repository-url>
cd autocare-360
```

2. Install dependencies:
```bash
npm install
```

3. Run the automated test suite:
```bash
npm test
```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser:
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 6. Environment Variables

Create a `.env.local` file in the project root if integrating external cloud databases:

```env
# Optional: External PostgreSQL connection (Supabase / Neon)
# If omitted, AUTOCARE 360 runs seamlessly using its persistent relational engine
DATABASE_URL=postgresql://postgres:password@localhost:5432/autocare360
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 7. Testing Suite

Run the automated domain and business logic tests:
```bash
npm test
```

The test runner validates:
- [x] Relational customer-to-vehicle foreign key integrity
- [x] Duplicate registration plate prevention
- [x] Booking scheduling collision checks
- [x] Parts inventory auto-deduction and negative stock prevention
- [x] Customer approval / rejection state machine transitions
- [x] Service task execution locks before customer approval
- [x] Progress percentage formula calculation
- [x] GST 18% tax and discount calculations
- [x] Manager Quality Check pass/fail gateways
- [x] Multi-method payment balance settlement
- [x] Delivery handover clearance gates (QC pass & balance = ₹0)
- [x] All 18 RESTful Next.js API endpoints

---

## 8. Deployment to Vercel

AUTOCARE 360 is optimized for zero-config Vercel deployment:

1. Push your repository to GitHub / GitLab.
2. Import the project in your Vercel Dashboard.
3. Framework Preset: **Next.js**
4. Root Directory: `./`
5. Click **Deploy**.

To deploy using Vercel CLI:
```bash
npx vercel --prod
```

---

## 9. AI Development Documentation

For detailed analysis of AI architecture generation, prompt engineering, and autonomous debugging:
- [Business Process Analysis](docs/business-process.md)
- [AI-Assisted Development](docs/ai-development.md)
- [10–15 Minute Demonstration Script](docs/demo-script.md)
- [Interview Questions & Answers](docs/interview-questions.md)
