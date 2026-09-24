# Technical Interview Questions & High-Yield Answers — AUTOCARE 360

---

### Q1: Why did you choose this architecture (Next.js 14 App Router, TypeScript, Tailwind)?
**Answer**:  
Next.js 14 App Router provides a unified full-stack architecture where frontend UI components and backend REST API routes share the exact same TypeScript domain types without duplication. It enables instant server-side rendering for critical views, fast static generation for stable dashboards, and robust API endpoints that run seamlessly in serverless edge environments such as Vercel. TypeScript enforces compile-time safety across complex domain models (e.g. 20+ entities), while Tailwind CSS provides high-performance, modular styling with a bespoke automotive aesthetic.

---

### Q2: Why did you design the database engine this way?
**Answer**:  
We implemented a resilient relational database service (`lib/db/index.ts`) with disk persistence (`data/autocare360.db.json`) and in-memory caching. This architecture provides three critical advantages:
1. **Zero External Dependency Friction**: The application runs and builds immediately in any environment without failing due to database network timeouts or external pool exhaustion.
2. **Relational Integrity & Foreign Keys**: It guarantees strict relational integrity between Customers, Vehicles, Bookings, Job Cards, Parts, and Invoices.
3. **Seamless Migration Path to PostgreSQL/Supabase**: All repository methods follow standard async service boundaries, meaning swapping to Supabase or Prisma PostgreSQL simply involves pointing queries to a client instance without changing any frontend component or business logic.

---

### Q3: How does the Customer Approval workflow function technically?
**Answer**:  
Customer approval is a critical state machine milestone. When a Service Advisor compiles an estimate, it is stored in the database with status `WAITING_FOR_APPROVAL` (`PENDING_APPROVAL`).  
In the Customer Portal, the customer reviews the breakdown.
- **If Approved**: An API call (`PATCH /api/jobs/[id]/estimate`) updates `estimate.status = 'APPROVED'`, stamps `approvedByCustomerAt = ISOString`, and sets `jobCard.status = 'APPROVED'`. This server-side state change unlocks the technician's ability to transition service tasks to `IN_PROGRESS`.
- **If Rejected**: The customer submits a mandatory rejection reason. The backend marks `estimate.status = 'REJECTED'`, sets `jobCard.status = 'ESTIMATE_CREATED'`, dispatches a high-priority notification to the Service Advisor, and logs an immutable audit event.

---

### Q4: How are parts inventory and stock deductions managed?
**Answer**:  
When a part is allocated to a Job Card:
1. The backend checks `part.stockQuantity >= requestedQuantity`. If insufficient, it throws an error preventing negative stock.
2. It decrements `part.stockQuantity` by the requested quantity.
3. If the remaining quantity falls below `part.reorderLevel`, it sets `part.status = 'LOW_STOCK'` (or `'OUT_OF_STOCK'` if 0) and automatically triggers an urgent system notification for workshop administrators.
4. The part's unit price and applicable GST tax rate (e.g. 18%) are calculated and dynamically appended to the job's estimate.

---

### Q5: How is billing and taxation calculated?
**Answer**:  
Billing follows strict statutory automobile GST regulations:
$$\text{Grand Total} = (\text{Parts Subtotal} + \text{Labour Subtotal} + \text{Consumables} - \text{Discounts}) + \text{GST (18\%) Tax}$$
When Manager Quality Check passes, an `Invoice` is automatically created with:
- `partsSubtotal`, `labourSubtotal`, `additionalCharges`, `discountAmount`, `taxAmount`, `grandTotal`
- `paidAmount = 0` and `balanceAmount = grandTotal`
- `paymentStatus = 'UNPAID'`
As payments are recorded (via UPI, Card, Cash, or Net Banking), `paidAmount` increases and `balanceAmount` decreases. When `balanceAmount === 0`, status transitions to `PAID`. Overpayment beyond balance is blocked.

---

### Q6: How are business rules enforced? Are they frontend or backend?
**Answer**:  
All business rules are enforced **server-side in the API and database service layer**, not solely on the client:
- Vehicle registration rejects duplicate registration plates.
- Check-in rejects entry odometers lower than previous recorded readings.
- Service tasks reject status updates if the Job Card is still awaiting customer approval.
- Vehicle delivery clearance physically checks that `qualityCheck.status === 'PASSED'` and `invoice.balanceAmount === 0`. If either condition fails, the API returns a 400 Bad Request error.

---

### Q7: How does authentication and role-based access control (RBAC) work?
**Answer**:  
The system implements a multi-tenant role context supporting 6 distinct roles:
1. `ADMIN`
2. `SERVICE_ADVISOR`
3. `SERVICE_MANAGER`
4. `TECHNICIAN`
5. `BILLING_STAFF`
6. `CUSTOMER`
Client sessions maintain active credentials with seamless role switching for demonstration, while API routes validate the operator role against permitted capabilities (e.g. only `SERVICE_MANAGER` can certify Quality Checks; only `BILLING_STAFF` can record invoice settlements).

---

### Q8: How did AI assist during the development lifecycle?
**Answer**:  
AI acted as an autonomous pair-programmer across all layers:
- Rapid domain modelling and comprehensive TypeScript schema drafting.
- Generation of 18 connected Next.js API routes with robust error handling and audit logging.
- Development of modern UI components (StatusBadges, Stepper, Recharts analytics, 14-step Demo Walkthrough).
- Autonomous diagnosis and fixing of build errors (such as Next.js 14 App Router CSR Suspense boundary requirements on `useSearchParams()`).
- Generation of comprehensive automated test suites and high-fidelity documentation.

---

### Q9: What technical challenges occurred and how were they resolved?
**Answer**:  
1. **Windows Subprocess Resolution**: In the local runner environment, PowerShell was not located in default `%PATH%`. We resolved this by creating an execution proxy script and copying the native binary directly to the project root.
2. **Next.js Static Prerender CSR Bailout**: During `next build`, pages using `useSearchParams()` (`/jobs` and `/check-in`) failed static export. We refactored the pages by extracting the dynamic query parameters into a client component wrapped in a `<Suspense>` boundary.
3. **Client-Side PDF Generation**: Implemented `jspdf` and `jspdf-autotable` to format clean, printable GST invoices directly in the browser with zero external binary dependencies.

---

### Q10: How would you scale this application to hundreds of service centers?
**Answer**:  
1. **Multi-Tenancy**: Introduce `centerId` / `tenantId` across all relational entities with PostgreSQL Row-Level Security (RLS) on Supabase.
2. **Queueing & Event-Driven Architecture**: Offload notifications and customer SMS/WhatsApp triggers to a serverless message queue (AWS SQS / Redis BullMQ).
3. **Database Caching & Read Replicas**: Place Redis caching in front of high-frequency queries (such as inventory lookups and active technician bay allocations).
4. **Media Storage**: Store high-resolution vehicle damage intake photos using S3 / Supabase Storage with presigned URLs.

---

### Q11: What would you improve or build next?
**Answer**:  
1. **Automated WhatsApp Notification Integration**: Sending automated PDF estimates directly to customer WhatsApp with interactive "Approve" buttons.
2. **OBD-II Bluetooth Scanner Pairing**: Auto-importing Diagnostic Trouble Codes (DTCs) directly from vehicle OBD ports during physical check-in.
3. **Bay & Hoist Scheduling Calendar**: Visual drag-and-drop bay calendar to allocate hydraulic lifts and paint booths based on estimated labour hours.
