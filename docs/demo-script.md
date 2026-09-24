# 10–15 Minute Demonstration Script — AUTOCARE 360

**Target Audience**: Campus Assessment Evaluators, Engineering Directors, Technical Product Interviewers  
**Presenter Role**: Full-Stack Lead Architect & Engineer  
**Product**: AUTOCARE 360 — Complete Vehicle Service Management System  

---

## Part 1: Problem Context & Architectural Introduction (2 mins)

> *"Good morning/afternoon. Today I am excited to demonstrate AUTOCARE 360, an enterprise-grade vehicle service management system built for multi-bay automotive service centers.*  
>  
> *In traditional service centers, business processes are heavily fragmented across paper job sheets, disconnected inventory spreadsheets, WhatsApp customer approvals, and standalone billing machines. This results in parts leakage, customer billing disputes, and delivery bottlenecks.*  
>  
> *AUTOCARE 360 unifies this entire journey into **one continuous, connected pipeline**: from customer intake to vehicle check-in, 20-point digital inspection, real-time stock deduction, customer estimate approval, technician task execution, quality control, tax invoicing, payment receipt, and delivery clearance.*  
>  
> *The system is built on Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts, and a resilient relational data persistence architecture. Let’s jump directly into the live application."*

---

## Part 2: Operations Control Dashboard (1.5 mins)

- **Navigate to**: `/` (Home Dashboard)
- **Key Talking Points**:
  - Point out the **KPI Metrics Cards**: Today's Bookings (e.g. 5), Vehicles in Service (e.g. 7), Waiting for Approval (e.g. 1), In Progress, Ready for Delivery, Realized Revenue (₹118,350+), Outstanding Balances, and Low Stock Alerts.
  - Explain that **all numbers and charts are live calculations** querying the relational database — zero hardcoding.
  - Highlight the **Pending Approvals Banner**: Shows that Customer Rahul Patil's Tata Nexon (#JOB-1001) has an estimate of ₹10,077 awaiting customer approval.
  - Show the **Recharts Visualizations**:
    1. *Monthly Revenue Inflow*: Demonstrating historical financial performance.
    2. *Service Jobs by Workshop Status*: Real-time stage distribution.
  - Demonstrate the **Guided Demo Walkthrough**: Click the top-right button `Interactive Demo Tour` to show interviewers the built-in 14-step timeline modal!

---

## Part 3: Customer & Vehicle Fleet Registration (1.5 mins)

- **Navigate to**: `/customers`
- **Key Talking Points**:
  - Show the customer registry: Rahul Patil, Priya Sharma, Amit Verma, Vikram Malhotra.
  - Highlight that vehicles are **strictly linked to customers** via foreign key constraints.
  - Point out vehicle specifications: Registration plates (e.g., `MH 12 AB 4587`), VIN/Chassis numbers, fuel type (Diesel, Petrol, Hybrid, EV), and historical odometer.
  - Click `Add Customer` or `Register Vehicle` to show the form validations (prevents duplicate vehicle registration numbers).

---

## Part 4: Service Booking & Scheduling Conflict Prevention (1 min)

- **Navigate to**: `/bookings`
- **Key Talking Points**:
  - Show current bookings in various states: `REQUESTED`, `CONFIRMED`, `CHECKED_IN`.
  - Explain how the booking engine prevents double-booking the same vehicle at the same appointment time.
  - Show the quick action: Confirm a requested booking or click `Check-In` to intake the vehicle directly to the workshop floor!

---

## Part 5: Vehicle Check-In Desk (1.5 mins)

- **Navigate to**: `/check-in`
- **Key Talking Points**:
  - Explain: *"When the vehicle physically enters the service center, the Service Advisor conducts intake."*
  - Demonstrate the inputs:
    - Current Entry Odometer (e.g. 34,500 km) with validation ensuring it cannot be lower than the last visit.
    - Interactive Fuel Level Slider (e.g. 65%).
    - Existing Body Imperfections / Scratch Checklist (e.g. Rear Bumper scuff).
    - Customer primary concern: *"35,000 km periodic service, front brake squeal, AC odor."*
    - Assignment of Service Advisor (Sameer Joshi) and Lead Technician (Deepak Shinde).
  - Click `Generate Job Card & Proceed to Inspection`: Show how it updates the booking to `CHECKED_IN` and generates `JobCard` in `INSPECTION` state with 10% progress!

---

## Part 6: Workshop Job Card & 20-Point Digital Inspection (2 mins)

- **Navigate to**: `/jobs/job-1` (Rahul Patil's Tata Nexon `MH 12 AB 4587`)
- **Key Talking Points**:
  - Highlight the master **9-stage visual milestone stepper**: Intake ➔ Inspection ➔ Estimate ➔ Approval ➔ Approved ➔ Service ➔ QC ➔ Ready ➔ Delivered.
  - Click the **Inspection Checklist** tab:
    - Show the 4 comprehensive categories:
      1. *Exterior*: Body condition, windshield, lighting, tyre tread depth.
      2. *Interior*: Cabin AC cooling, dashboard warning lights, power windows.
      3. *Engine*: Oil degradation, coolant levels, battery voltage (12.6V).
      4. *Safety*: Front brake pad wear (marked **CRITICAL** due to under 2.5mm pad thickness), suspension.
    - Show the status flags: `GOOD`, `ATTENTION`, and `CRITICAL`.
    - Click `Save Inspection Findings` — demonstrates how inspection data updates job status to `ESTIMATE_CREATED`.

---

## Part 7: Service Tasks, Parts Allocation & Labour Estimation (2 mins)

- **Click Tab**: **Parts & Labour**
  - Show OEM Parts allocation from catalogue:
    - `Castrol Edge Fully Synthetic 5W-30 (3.5L)` — ₹2,450
    - `Bosch Oil Filter` — ₹380
    - `Brembo Front Brake Pads Set` — ₹2,800
    - `Valeo Cabin AC Filter` — ₹650
  - Demonstrate **real-time stock deduction**: When added, stockQuantity decreases immediately. If an attempt is made to allocate more than in stock, backend throws: *"Insufficient inventory"*.
  - Show the Labour line items:
    - `Engine Oil Replacement` (0.8 hrs @ ₹750/hr = ₹600)
    - `Front Brake Pads Removal & Fitting` (1.2 hrs @ ₹800/hr = ₹960)
    - `3D Wheel Alignment` (1.0 hr @ ₹850/hr = ₹850)
- **Click Tab**: **Estimate & Approval**
  - Show the auto-calculated estimate breakdown:
    - Parts Subtotal: ₹6,280
    - Labour Subtotal: ₹2,410
    - Workshop Consumables: ₹150
    - Loyalty Discount: -₹400
    - GST Taxes (18%): ₹1,537.20
    - **Grand Total: ₹10,077.20**
    - Status: `WAITING_FOR_APPROVAL`

---

## Part 8: Customer Approval Gateway via Customer Portal (1.5 mins)

- **Navigate to**: `/customer-portal`
- **Key Talking Points**:
  - *"This is one of the most critical engineering requirements of the assessment: customer transparency and real database state transition."*
  - Switch perspective to customer Rahul Patil on his phone:
    - He views his Tata Nexon `MH 12 AB 4587` with real-time progress bar.
    - He sees the itemized estimate for ₹10,077.20.
    - Show the **Approval Gateway**:
      - If he clicks `Request Revisions`: modal prompts for reason and updates state to `REJECTED`, notifying the advisor.
      - If he clicks `Approve Estimate`: state machine updates database to `APPROVED`, records approval timestamp, and unlocks workshop task execution!
  - Click `Approve Estimate` — show the instant confirmation!

---

## Part 9: Service Execution & Progress Tracking (1 min)

- **Return to**: `/jobs/job-1` or `/jobs/job-2`
- **Click Tab**: **Service Tasks**
  - Show the tasks:
    1. Spark plugs inspection & replacement
    2. Throttle body cleaning & calibration
    3. 3D wheel alignment
  - Click `Start` (moves task to `IN_PROGRESS`) and `Mark Done` (moves to `COMPLETED`).
  - Demonstrate how the **Overall Progress Bar automatically calculates**:
    $$\text{Progress} = \frac{\text{Completed} + 0.5 \times \text{In Progress}}{\text{Total}} \times 100\%$$
  - When all tasks reach 100%, show that the Job Card **automatically advances to `QUALITY_CHECK`**!

---

## Part 10: Manager Quality Check & Auto-Invoicing (1.5 mins)

- **Click Tab**: **Quality Check** (or view Job #JOB-1003)
- **Key Talking Points**:
  - Service Manager Arvind Swamy inspects the 6 critical QA points:
    1. Service execution completed
    2. OEM parts torqued to specification
    3. Vehicle foam washed and vacuumed
    4. Warning lights & OBD cleared
    5. Dynamic road test conducted
    6. Customer complaint resolved
  - Click `Pass Quality Check`:
    - System updates job status to `READY_FOR_DELIVERY`.
    - **Automatically generates the GST Tax Invoice** (#`INV-1004`)!

---

## Part 11: Billing, Multi-Method Payments & PDF Generation (1.5 mins)

- **Navigate to**: `/billing`
- **Key Talking Points**:
  - View the generated tax invoice with Grand Total, Paid Amount, and Balance.
  - Click `Pay` on an outstanding balance:
    - Select payment method: `UPI / QR Code`, `Card`, `Cash`, or `Bank Transfer`.
    - Enforces business rule: Payment cannot exceed invoice balance.
    - Complete payment: Balance immediately drops to ₹0 and status transitions to `PAID`.
  - Click `Download PDF Invoice`:
    - Generates a branded, high-resolution PDF tax invoice with invoice number, customer details, parts breakdown, GST breakdown, and receipt seal.

---

## Part 12: Delivery Handover & Lifetime Service History (1.5 mins)

- **Navigate to**: `/delivery`
- **Key Talking Points**:
  - Point out the **3 Delivery Clearance Gates**:
    1. Quality Check Passed (✓)
    2. Tax Invoice Generated (✓)
    3. Payment Cleared Balance = ₹0 (✓)
  - Show that if balance is pending, delivery is physically disabled.
  - Click `Release & Deliver Vehicle`:
    - Prompts for exit odometer (e.g. 34,512 km) and customer acceptance confirmation.
    - Marks Job Card `DELIVERED`.
    - **Instantly writes an immutable record to the permanent `ServiceHistory` table!**
- **Navigate to**: `/history`
  - Show the vehicle's permanent historical record containing visit date, complaints, services executed, parts replaced, technician, and invoice number!

---

## Part 13: Conclusion & Engineering Summary (1 min)

> *"In summary, AUTOCARE 360 demonstrates:*  
> *1. Complete coverage of the connected automobile service lifecycle.*  
> *2. Zero placeholder buttons, zero simulated fake actions — every action updates relational database state.*  
> *3. Strict business rule enforcement across inventory, approvals, and delivery clearances.*  
> *4. Enterprise-grade code quality with 100% passing automated test suites and successful production builds.*  
>  
> *Thank you, and I look forward to your questions."*
