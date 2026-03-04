# Generocity Dashboard - Complete Feature Overview

## System Overview

**Generocity** is a lead generation platform connecting South African businesses with zero-capital solar solutions through Green Share Virtual Power Plant (VPP) and Nedbank financing.

### Core Entities
- **Sales Representatives (Agents)**: Independent contractors who identify and submit qualified business leads
- **Businesses**: Commercial/industrial clients seeking zero-capex solar installations
- **Admins**: Platform administrators who manage the approval process

---

## Dashboard Architecture

### User Roles & Access

#### 1. Sales Representative Dashboard
Primary interface for agents to manage leads, track performance, and earn commissions.

**Navigation Structure:**
```
├── Overview (Dashboard Home)
├── New Lead (Submission Form)
├── My Leads (Lead Management)
├── Analytics (Performance Metrics)
├── Earnings (Commission & Incentives)
├── Knowledge (Guidelines & Training)
├── Contract (Digital Agreement)
└── Profile (Account Settings)
```

#### 2. Business Dashboard
For registered businesses to track their solar application progress.

**Navigation Structure:**
```
├── Application Status (9-step progress)
├── Documents (Upload/Manage)
└── Profile (Account Info)
```

#### 3. Admin Dashboard
For platform administrators to manage leads and users.

---

## Feature Details

### 1. Overview Page (`/dashboard`)

**Purpose:** Central command center showing real-time performance metrics.

**Key Components:**

#### Weekly Performance Target
- **Visual Progress Indicator**: Shows current week vs 20-business target
- **Quick Stats**: 
  - Qualified this week / Target (20) / Still needed
  - Progress percentage bar (blue → green when complete)
- **CTA Buttons**: 
  - "View Incentives & Bonuses" → Earnings page
  - "Submit New Lead" → Submission form

#### Referral Link Section
- **Your Personal Link**: `https://foundation-1.co.za/for-business/apply?ref=XXX-XXXX`
- **One-click Copy**: Copies link to clipboard with visual feedback
- **Reference Code**: Unique agent identifier for manual entry
- **Instructions**: How to share with potential clients

#### Performance Metrics Grid
Six metric cards showing:
1. **Total Leads** - All-time submissions
2. **Approved** - Leads qualified & processed  
3. **Rejected** - Disqualified or unresponsive
4. **Contracts Signed** - Closed deals
5. **Commission Earned** - Lifetime earnings paid
6. **Pending Commission** - Awaiting payment

#### Pipeline Funnel
Visual horizontal bar chart showing conversion:
- Submitted → Approved → Contracts Signed

#### My Business Leads Table
Clean table showing last 5 leads with:
- Business name + registration number
- Status badge (In Progress/Pending/Accepted/Rejected)
- Submission date
- Progress percentage

**Design Pattern:** Cards with subtle shadows, color-coded status badges, hover effects

---

### 2. New Lead Page (`/dashboard/submit`)

**Purpose:** Form for submitting qualified business opportunities.

**Access Control:**
- Requires signed contract (shows "Contract Required" card if not signed)
- Redirects to contract page with 3-step process guide

**Qualification Banner (Red):**
Shows 3 mandatory criteria:
1. ✓ Business must be **registered**
2. ✓ Must provide **minimum 6 months** utility bills
3. ✓ Minimum electricity bill of **R15,000 per month**

**Form Sections:**

#### Business Details
- Business Name (text)
- Registration Number (text, format: YYYY/XXXXXX/XX)
- Physical Address (textarea)

#### Key Contact Person
- Full Name
- Role/Job Title  
- Phone Number
- Email Address

#### Documentation
- **Drag & Drop Upload Zone**: PDF, PNG, JPG (max 10MB)
- Visual feedback: border highlight on drag, file name display after selection
- Accepts utility bills only

#### Confirmation Checkbox
- "I confirm this business has explicitly expressed interest..."
- Required field validation

**Actions:**
- Cancel button (returns to previous page)
- Submit button (disabled until all fields valid)
- Success state with auto-redirect to leads list

**Validation:**
- All fields required
- Email format validation
- File size/type validation
- Checkbox must be checked

---

### 3. My Leads Page (`/dashboard/leads`)

**Purpose:** Complete list of all submitted leads with detailed status.

**Layout:** Full-width table with:
- Sortable columns
- Filter options (by status)
- Search functionality
- Pagination (20 per page)

**Columns:**
1. **Business** - Name + registration
2. **Contact** - Name, phone, email
3. **Status** - Current pipeline stage
4. **Submitted** - Date
5. **Documents** - Utility bill filename
6. **Actions** - View details, edit (if allowed)

**Status Values:**
- `submitted` → `pre_validated` → `partner_review` → `approved`/`rejected` → `contract_signed` → `commission_earned`

---

### 4. Analytics Page (`/dashboard/analytics`)

**Purpose:** Data-driven insights to optimize performance.

**Time Range Selector:**
- This Week / This Month / This Quarter
- Updates all metrics dynamically

**KPI Cards (4 metrics):**
1. **Total Leads** + month-over-month change indicator
2. **Conversion Rate** - % approved vs submitted
3. **Est. Earnings** - R2,000 × funded clients
4. **This Week** - Current progress vs 20 target

**Charts:**

#### Submission Trend (Bar Chart)
- Last 7 days, day-by-day breakdown
- Visual bar height = volume
- Labels: Mon, Tue, Wed, Thu, Fri, Sat, Sun

#### Status Breakdown (Grid)
Four status cards with color-coded dots:
- Submitted (blue)
- In Progress (yellow)
- Approved (green)
- Rejected (red)

**Performance Insights Section:**
Three insight cards with contextual advice:
1. Weekly Performance analysis
2. Conversion Rate suggestions
3. Revenue Potential breakdown

---

### 5. Earnings Page (`/dashboard/earnings`)

**Purpose:** Commission structure explanation and earnings tracking.

**This Month's Performance:**
Four cards showing:
1. **Funded Clients** - Current tier label (Starter/Rising Star/etc.)
2. **Base Commission** - R2,000 × count
3. **Volume Bonus** - Tier bonus amount (or "-" if no bonus)
4. **Total Earnings** - Base + Bonus (highlighted card)

**Next Tier Banner:**
Shows how many more clients needed for next bonus tier.

**Volume Bonus Tiers (4 cards):**
```
Tier 1 (1-9):     No Bonus      R2,000 × clients
Tier 2 (10-19):   +R5,000      (R2,000 × clients) + R5,000
Tier 3 (20-29):   +R10,000     (R2,000 × clients) + R10,000  
Tier 4 (30+):     +R15,000     (R2,000 × 30) + R15,000 = R75,000
```

Current tier highlighted with green border.

**Payment Information Grid:**
Four info cards:
1. Base Commission details
2. Volume Bonus timing (72 hours)
3. Bonus guarantee (objective)
4. Above 30 clients (discretionary bonuses)

---

### 6. Knowledge Page (`/dashboard/knowledge`)

**Purpose:** Comprehensive training resource for sales agents.

**Quick Reference Cards (4):**
- Weekly Target: 20
- Commission: R2,000
- Min. Bill: R15,000
- Documents: 6 Months

**Expandable Sections:**

#### What is Generocity?
- Green Share VPP partnership explanation
- Nedbank financing facility details
- Zero capex model benefits (5 bullet points)
- Highlight box about Power Purchase Agreement

#### Your Role: Lead Generation Only
- Important notice: "You are a Lead Generator, not a closer"
- DO list (5 tasks with green checkmarks)
- DON'T list (3 tasks with red X)
- Key message: Find businesses already open to solution

#### What Counts as Qualified?
- 5 numbered criteria cards with icons
- Warning box: "That is the filter. Nothing else."
- Visual grid layout

#### Who We're Looking For
- "We Want" list (5 traits with icons)
- "We DON'T Care About" (5 strikethrough items)
- Key message: "If you can produce qualified interest, you are qualified"

#### Compensation & Performance
- Large R2,000 highlight
- Weekly target box (20 businesses with warning styling)
- Important notice about penalties
- Volume bonus reminder

#### Getting Started Checklist
- Interactive checkboxes (5 items)
- CTA box: "Submit Your First Lead" button

**Design:** Collapsible sections (accordion style), color-coded lists, warning/notice boxes

---

### 7. Contract Page (`/dashboard/contract`)

**Purpose:** Digital signing of Independent Contractor Agreement.

**Status Indicator:**
- Pending: Yellow badge
- Signed: Green badge with date

**Contract Document:**
- Monospace font for professional appearance
- Structured sections with dividers:
  1. Independent Contractor Status
  2. Engagement and Duties
  3. Compensation (R2,000 per client)
  4. Volume Incentive Structure (4 tiers)
  5. Standards of Conduct
  6. Non-Circumvention (2 years)
  7. Fraud Liability
  8. Termination terms
  9. Confidentiality
  10. Indemnification
  11. Governing Law
  12. Entire Agreement
  13. Acknowledgment
- Signature page with both parties
- Company Reg: 2026/138664/07

**Actions:**
- Collapse/Expand contract
- Download as text file
- Digital signature form (if not signed)
  - Full name input
  - Agreement checkbox
  - Sign button

**Pre-populated Fields:**
- Agent name, ID, email, phone, address
- Company details
- Date auto-filled

---

### 8. Profile Page (`/dashboard/profile`)

**Purpose:** Account management and settings.

**Sections:**
- Personal Information (edit form)
- Bank Details (for commission payouts)
- Password Change
- Notification Preferences

---

### 9. Assist Panel (Floating Widget)

**Purpose:** AI-powered help assistant for agents.

**Trigger:** Blue "Assist" button (bottom-right corner)

**Interface:**
- Expandable chat panel
- Welcome message with capabilities
- Suggested questions (quick buttons)
- Typing indicator animation
- Navigation links in responses

**Knowledge Base Topics:**
- Qualified business criteria
- Weekly targets (20) and penalties
- Commission structure (R2,000 base + bonuses)
- How to submit leads
- Referral link location
- Contract requirements
- Analytics interpretation

**Response Pattern:**
- Text explanation
- Relevant navigation links
- Contextual suggestions

---

## User Flows

### New Agent Onboarding
1. Register with ID + Home Address (required for contract)
2. Sign Independent Contractor Agreement digitally
3. Review Knowledge Base
4. Get referral link from Overview
5. Submit first lead (after contract signed)
6. Track in Analytics/My Leads
7. Earn R2,000 per qualified lead

### Lead Submission Flow
1. Agent identifies qualified business
2. Collects 6 months utility bills
3. Confirms R15,000+ monthly spend
4. Gets clear expression of interest
5. Submits via New Lead form
6. Lead appears in My Leads (status: submitted)
7. Admin reviews → approves/rejects
8. Business signs contract
9. Agent earns R2,000 commission

### Weekly Performance Cycle
1. Monday: Review target progress on Overview
2. Daily: Submit qualified leads (target: 4/day = 20/week)
3. Track: Check Analytics for trends
4. Friday: Review weekly completion
5. Monthly: Earn volume bonuses based on tier

---

## Commission Structure Summary

### Base Commission
- **R2,000** per qualified business handed over
- Paid within 72 hours of verification

### Volume Bonuses (Monthly)
| Clients | Bonus | Total (approx) |
|---------|-------|----------------|
| 1-9     | R0    | R2,000 × count |
| 10-19   | R5,000| R25,000 at 10  |
| 20-29   | R10,000| R50,000 at 20 |
| 30+     | R15,000| R75,000 at 30 |

### Performance Penalties
- Underperformers still get paid (R2,000 per lead)
- BUT consistent underperformance reduces future payout rates
- Weekly target: 20 qualified businesses

---

## Technical Notes

### Qualification Criteria (Hard Requirements)
A business MUST meet ALL 5 criteria:
1. Registered South African business entity
2. Actively operational (not dormant)
3. 6 consecutive months of utility bills available
4. Minimum R15,000/month electricity bill
5. Decision-maker expressed interest in zero-cost solar

### Access Control
- **Contract Required**: Cannot submit leads until contract is signed
- **Role-based Navigation**: Different menus for Sales vs Business vs Admin
- **Authentication**: JWT-based with localStorage persistence

### Data Models
- **Lead Status Pipeline**: 9-step process from submission to commission
- **Onboarding Steps**: Registration → Utility Bill → Proposal → Contract → KYC → Decision
- **User Types**: sales_rep, business, admin

### Key Integrations (Future)
- LLM for Assist panel (currently rule-based)
- File upload for utility bills (currently simulated)
- Email notifications (console logging for now)
- Payment processing (manual for now)

---

## Design System

### Color Coding
- **Success (Green)**: Approved, completed, positive metrics
- **Info (Blue)**: In progress, neutral states, links
- **Warning (Yellow)**: Pending, KPIs, attention needed
- **Error (Red)**: Rejected, failed, requirements not met

### Typography
- Headings: Bold, tight leading
- Body: Regular, relaxed leading for readability
- Numbers: Monospace for financial/registration data

### Spacing
- Cards: 24px padding
- Sections: 32px gaps
- Tight groupings: 16px

### Interactive Elements
- Buttons: 8px radius, hover lift effect
- Links: Underline on hover, consistent blue color
- Inputs: Border highlight on focus
- Cards: Subtle shadow, border on hover

---

## Demo Credentials

### Sales Representative
- Email: `demo@foundation-1.co.za`
- Password: `demo123`
- Reference Code: F1-JMOL-4821

### Business
- Email: `business@foundation-1.co.za`
- Password: `business123`

### Admin
- Email: `admin@foundation-1.co.za`
- Password: `admin123`

---

## File Structure

```
/src
├── app/dashboard/
│   ├── page.tsx (Overview)
│   ├── layout.tsx
│   ├── submit/page.tsx (New Lead)
│   ├── leads/page.tsx (My Leads)
│   ├── analytics/page.tsx (Analytics)
│   ├── earnings/page.tsx (Earnings)
│   ├── knowledge/page.tsx (Knowledge)
│   ├── contract/page.tsx (Contract)
│   └── profile/page.tsx (Profile)
├── components/
│   ├── DashboardShell.tsx (Navigation wrapper)
│   ├── AssistPanel.tsx (Floating chat)
│   ├── StepProgressBar.tsx (9-step visual)
│   └── ...
├── lib/
│   ├── types.ts (TypeScript definitions)
│   ├── store.ts (Mock data store)
│   └── auth-context.tsx (Authentication)
└── ...
```

---

## URLs Reference

| Page | URL |
|------|-----|
| Homepage | http://localhost:3002 |
| Login | http://localhost:3002/auth |
| Dashboard | http://localhost:3002/dashboard |
| New Lead | http://localhost:3002/dashboard/submit |
| My Leads | http://localhost:3002/dashboard/leads |
| Analytics | http://localhost:3002/dashboard/analytics |
| Earnings | http://localhost:3002/dashboard/earnings |
| Knowledge | http://localhost:3002/dashboard/knowledge |
| Contract | http://localhost:3002/dashboard/contract |
| Profile | http://localhost:3002/dashboard/profile |

---

*Last Updated: 2026-02-17*
*Version: 1.0*
