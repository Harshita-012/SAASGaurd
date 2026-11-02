# SaaSGuard — Smarter SaaS Spending. Safer Employee Access.

A modern, frontend-only SaaS subscription and employee-access management platform built with React, Vite, Tailwind CSS, Lucide React, and Recharts.

---

## 🚀 Live Demo & Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### 2. Installation
```bash
# Clone or navigate to the directory
cd SaasGaurd

# Install dependencies
npm install

# Start the Vite local development server
npm run dev
```

Visit **`http://localhost:5173/`** in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🎨 Visual Identity & Design System

SaaSGuard follows a bespoke color direction tailored for a modern B2B SaaS startup:

- **Midnight Plum** (`#21152F`): Deep brand anchor for the persistent sidebar and premium cards.
- **Dark Aubergine** (`#342344`): Active navigation states and secondary structural containers.
- **Electric Lime** (`#C8F169`): High-contrast primary call-to-action buttons, glow badges, and positive metrics.
- **Soft Lavender** (`#E8DFF4`): Secondary accent highlights and tags.
- **Warm Ivory** (`#F8F6F0`): Warm, readable main canvas background.
- **Muted Grey** (`#8B8792`): Balanced secondary metadata text.

---

## 🧩 Key Platform Capabilities & Modules

1. **Executive Dashboard**
   - Summary cards: Total applications, Monthly SaaS spending, Active employees, Total licences, Potentially unused licences, Upcoming renewals.
   - Dynamic Recharts: Monthly spending trends, licence allocation donut chart, top applications bar chart, category spend progress bars.
   - Operational feeds: Upcoming renewals (within 30 days), inactive seat alerts, and active offboarding checklists.

2. **Subscriptions Management**
   - Complete CRUD (Add, Edit, Delete with confirmation dialog).
   - Monthly equivalent calculation for annual contracts.
   - Search by name, vendor, owner, filter by category and billing cycle, sort by cost and renewal date.
   - **CSV Export & CSV Import** functionality with automatic quota calculation.

3. **Employee Directory**
   - Complete employee records (12 realistic seeded profiles).
   - Modal inspection showing all assigned applications, license tiers, role access levels, and monthly cost attribution per employee.
   - Direct button to initiate exit offboarding workflow.

4. **Access Management**
   - Dual-view matrix: **By Employee** and **By Application**.
   - Entitlement provisioning with duplicate assignment prevention.
   - Access revocation dialog that returns seats to the unallocated subscription pool.

5. **Usage Monitoring & Audit**
   - Simulates login activity with last-active timestamps.
   - Configurable inactivity threshold selector (**30 Days**, **45 Days**, **60 Days**).
   - Clear compliance labeling of *potentially unused* vs confirmed unused seats.
   - Direct "Verify with employee" and "Reclaim Seat" workflows.

6. **Cost Optimisation Engine**
   - Rule-based recommendations: unassigned seat reductions, duplicate tool consolidation, inactive user reclaims, and annual contract rightsizing.
   - Status transitions: **Active** → **Accepted** → **Completed** / **Dismissed**.
   - Transparent pricing disclosure separating estimated potential savings from contractual realized billing.

7. **Structured Offboarding Workflow**
   - When an exit is initiated, SaaSGuard automatically generates an application-by-application revocation checklist.
   - Interactive progress bar calculating completion percentage.
   - Offboarding completion is locked until all checklist items are marked verified.
   - Clear disclaimer that actual console de-provisioning is manual in this MVP.

8. **Notifications Center**
   - Real-time alerts for urgent renewals (within 7 days), pending offboardings, and cost suggestions.
   - Category filters (Renewals, Usage, Offboarding, Unread) and "Mark All as Read" action.

9. **Settings & Demo Data Control**
   - Organization legal name, domain, reporting currency, and governance inactivity limit.
   - **Reset Demo Data**: One-click restore back to the original JSON seed datasets.
   - **Export Full Workspace JSON**: Full client-side database backup.

---

## 💾 Data Architecture & Persistence

- **Seed Data**: Original JSON files located in `src/data/`:
  - `employees.json`
  - `subscriptions.json`
  - `assignments.json`
  - `usage.json`
  - `recommendations.json`
  - `notifications.json`
  - `offboarding.json`
  - `company.json`
- **State Management**: React Context (`src/context/DataContext.jsx`) synchronizing all state changes to browser `localStorage` under key `saasguard_storage_v1`.
- **Zero Backend**: Fully functional offline client application without external database or node server dependencies.
