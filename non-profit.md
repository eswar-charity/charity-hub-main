# Charity Hub — Nonprofit Journey Build Instructions
# Screens: Welcome & Account, Organization Details, Verification Status, Launchpad Home
# Stack: FastAPI (Python) + Supabase + React (TypeScript) + Cloudinary
# UI: Match Figma screens exactly — frame names listed below
# Note: SE journey already built. Extend the existing project — do not recreate it.

---

## GROUND RULES
- Never ask clarifying questions. Make decisions and keep building.
- This extends the existing charity-hub-se project. Reuse existing patterns: same Axios instance, same Redux store structure, same Supabase client, same FastAPI app.
- Read only files needed for the current step. Use line-range reads via filesystem MCP.
- After each step run the check command and fix errors before moving on.
- Before writing any component, use Figma MCP to inspect that exact frame first.
- /compact after Step 2 (backend done), /compact again after Step 5 (pages done).

---

## FIGMA REFERENCE
File: Charity Hub (Page 1)

Exact frame names to use in all Figma MCP calls:
  "Welcome & Account"      → NP signup and account creation screen
  "Organization Details"   → EIN, legal name, address, contact form (Step 2 of 4)
  "Verification Status"    → EIN check progress, verification timeline, church alternative
  "Launchpad Home"         → NP dashboard: events, approvals, donations, payouts, activity

Figma MCP call format:
  figma get frame "Welcome & Account"
  figma get frame "Organization Details"
  figma get frame "Verification Status"
  figma get frame "Launchpad Home"

Get color and text tokens once at the start:
  figma get styles "color"
  figma get styles "text"

---

## WHAT TO BUILD (scope only these 4 screens)

1. Welcome & Account     → NP signup page (name, email, password, continue CTA)
2. Organization Details  → 4-step verification form: EIN, legal name, address, contact email, website
3. Verification Status   → Read-only status page showing verification pipeline stages
4. Launchpad Home        → NP dashboard: events panel, approvals panel, engagement chart, donations list, payouts, activity feed

---

## PROJECT STRUCTURE ADDITIONS
# Add these to the existing charity-hub-se project

```
backend/app/
  models/
    nonprofit.py          ← new
  routers/
    nonprofit_auth.py     ← new
    nonprofit_profile.py  ← new
    launchpad.py          ← new
  services/
    verification_service.py  ← new

frontend/src/
  pages/
    nonprofit/
      NPSignup.tsx            ← new (Welcome & Account screen)
      OrganizationDetails.tsx ← new (Organization Details screen)
      VerificationStatus.tsx  ← new (Verification Status screen)
      LaunchpadHome.tsx       ← new (Launchpad Home screen)
  components/
    launchpad/
      EventsPanel.tsx         ← new
      ApprovalsPanel.tsx      ← new
      DonationsPanel.tsx      ← new
      PayoutsPanel.tsx        ← new
      EngagementChart.tsx     ← new
      ActivityFeed.tsx        ← new
  types/
    nonprofit.types.ts        ← new
  store/
    npSlice.ts                ← new
  services/
    nonprofit.service.ts      ← new

supabase/migrations/
  006_nonprofits.sql          ← new
  007_np_rls_policies.sql     ← new
```

---

## ENV ADDITIONS
# Append to existing backend/.env — no changes to existing vars

```
# Stripe Connect (for payout setup shown on Launchpad Home)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# IRS EIN verification (mock for now — real API in production)
EIN_VERIFY_MODE=mock
```

---

## STEP 1 — SUPABASE SCHEMA

### supabase/migrations/006_nonprofits.sql

```sql
create type np_verification_status as enum (
  'submitted','verifying','verified','settlement_setup','active','rejected'
);

create type np_type as enum ('standard','church','religious_org');

create table nonprofits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,

  -- Welcome & Account screen fields
  organization_name text not null,
  email text not null,

  -- Organization Details screen fields (Step 2 of 4 in Figma)
  ein text unique,
  legal_name text,
  registered_address text,
  official_contact_email text,
  website text,
  np_type np_type default 'standard',

  -- Verification pipeline
  verification_status np_verification_status default 'submitted',
  ein_check_passed boolean default false,
  ein_check_started_at timestamptz,
  verified_at timestamptz,
  rejection_reason text,

  -- Stripe Connect (payout setup — shown as banner on Launchpad Home)
  stripe_account_id text,
  stripe_onboarding_complete boolean default false,

  -- Launchpad stats (denormalised for fast dashboard reads)
  total_events_active integer default 0,
  total_events_draft integer default 0,
  total_donations_received numeric(12,2) default 0,
  pending_approvals_count integer default 0,
  next_payout_date date,
  next_payout_amount numeric(12,2) default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SE events submitted to this NP for approval
create table np_event_approvals (
  id uuid primary key default gen_random_uuid(),
  nonprofit_id uuid references nonprofits(id) on delete cascade not null,
  event_id uuid references events(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id),
  review_note text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz
);

-- Recent donations shown on Launchpad Home
create table np_donations (
  id uuid primary key default gen_random_uuid(),
  nonprofit_id uuid references nonprofits(id) on delete cascade not null,
  event_id uuid references events(id),
  donor_display_name text default 'Anonymous',
  donor_avatar_initials text,
  donor_avatar_color text,
  amount numeric(10,2) not null,
  stripe_payment_intent_id text,
  donated_at timestamptz default now()
);

-- Activity feed shown on Launchpad Home
create table np_activity (
  id uuid primary key default gen_random_uuid(),
  nonprofit_id uuid references nonprofits(id) on delete cascade not null,
  activity_text text not null,
  activity_type text default 'info',
  flagged boolean default false,
  created_at timestamptz default now()
);

-- Engagement data for the chart on Launchpad Home
create table np_engagement_daily (
  id uuid primary key default gen_random_uuid(),
  nonprofit_id uuid references nonprofits(id) on delete cascade not null,
  date date not null,
  participant_count integer default 0,
  donation_count integer default 0,
  unique(nonprofit_id, date)
);

create index idx_nonprofits_user_id on nonprofits(user_id);
create index idx_nonprofits_ein on nonprofits(ein);
create index idx_np_approvals_nonprofit on np_event_approvals(nonprofit_id);
create index idx_np_approvals_status on np_event_approvals(status);
create index idx_np_donations_nonprofit on np_donations(nonprofit_id);
create index idx_np_activity_nonprofit on np_activity(nonprofit_id);
create index idx_np_engagement_nonprofit_date on np_engagement_daily(nonprofit_id, date);
```

### supabase/migrations/007_np_rls_policies.sql

```sql
alter table nonprofits enable row level security;
alter table np_event_approvals enable row level security;
alter table np_donations enable row level security;
alter table np_activity enable row level security;
alter table np_engagement_daily enable row level security;

-- Nonprofits: users manage only their own record
create policy "NP own record" on nonprofits for all
  using (auth.uid() = user_id);

-- Approvals: NP manages approvals for their own org
create policy "NP manage own approvals" on np_event_approvals for all
  using (nonprofit_id in (select id from nonprofits where user_id = auth.uid()));

-- Donations: NP reads own donations
create policy "NP read own donations" on np_donations for select
  using (nonprofit_id in (select id from nonprofits where user_id = auth.uid()));

-- Activity: NP reads own activity
create policy "NP read own activity" on np_activity for select
  using (nonprofit_id in (select id from nonprofits where user_id = auth.uid()));

-- Engagement: NP reads own engagement
create policy "NP read own engagement" on np_engagement_daily for select
  using (nonprofit_id in (select id from nonprofits where user_id = auth.uid()));
```

Run: supabase db push
Verify with Supabase MCP: list tables, list policies for nonprofits

---

## STEP 2 — BACKEND

### backend/app/models/nonprofit.py

Pydantic models:

```python
class NPSignupRequest(BaseModel):
    organization_name: str
    email: str
    password: str

class NPOrgDetailsRequest(BaseModel):
    ein: str
    legal_name: str
    registered_address: str
    official_contact_email: str
    website: Optional[str]
    np_type: str = 'standard'   # 'standard' | 'church' | 'religious_org'

class NPVerificationStatusResponse(BaseModel):
    verification_status: str    # submitted | verifying | verified | settlement_setup | active | rejected
    ein_check_passed: bool
    ein_check_started_at: Optional[str]
    verified_at: Optional[str]
    rejection_reason: Optional[str]
    stripe_onboarding_complete: bool

class LaunchpadResponse(BaseModel):
    nonprofit: dict              # org name, verification_status, stripe_onboarding_complete
    events: dict                 # total_events_active, total_events_draft
    approvals: dict              # pending_approvals_count, recent_approvals (last 5)
    donations: list              # last 5 donations
    engagement: list             # last 14 days daily engagement data
    next_payout: dict            # next_payout_date, next_payout_amount, status
    activity: list               # last 10 activity items
```

### backend/app/services/verification_service.py

```python
# Simulates EIN verification pipeline stages
# In production: integrate IRS TIN matching API or third-party EIN verification

import asyncio
from datetime import datetime

MOCK_VALID_EINS = ["12-3456789", "98-7654321", "XX-XXXXXXX"]

async def start_ein_verification(nonprofit_id: str, ein: str, db):
    """
    Kick off verification pipeline.
    Updates nonprofit.verification_status through:
      submitted → verifying → verified → settlement_setup
    In mock mode: auto-advances after short delays.
    In production: webhook from IRS API triggers status updates.
    """
    # 1. Set status to 'verifying', record ein_check_started_at
    db.table('nonprofits').update({
        'verification_status': 'verifying',
        'ein_check_started_at': datetime.utcnow().isoformat()
    }).eq('id', nonprofit_id).execute()

    # 2. In mock mode: simulate async EIN check
    if ein.replace('-', '') != 'XXXXXXXXX':
        # Mock pass after 2s
        await asyncio.sleep(2)
        db.table('nonprofits').update({
            'ein_check_passed': True,
            'verification_status': 'verified',
            'verified_at': datetime.utcnow().isoformat()
        }).eq('id', nonprofit_id).execute()
    else:
        # Mock fail
        db.table('nonprofits').update({
            'verification_status': 'rejected',
            'rejection_reason': 'EIN not found in IRS database'
        }).eq('id', nonprofit_id).execute()

def get_verification_stages(np: dict) -> list:
    """
    Returns ordered stage list matching the Verification Status screen timeline.
    Each stage: { label, description, status: 'complete'|'active'|'pending' }
    Matches Figma stages exactly:
      1. Submitted — Application received successfully
      2. Verifying — Checking IRS database and validating authorized signers
      3. Verified
      4. Settlement Setup
      5. Active
    """
    status = np.get('verification_status', 'submitted')
    order = ['submitted', 'verifying', 'verified', 'settlement_setup', 'active']
    current_index = order.index(status) if status in order else 0

    stages = [
        {'key': 'submitted',        'label': 'Submitted',        'description': 'Application received successfully'},
        {'key': 'verifying',        'label': 'Verifying',        'description': 'Checking IRS database and validating authorized signers. Usually takes 2-4 hours.'},
        {'key': 'verified',         'label': 'Verified',         'description': ''},
        {'key': 'settlement_setup', 'label': 'Settlement Setup', 'description': ''},
        {'key': 'active',           'label': 'Active',           'description': ''},
    ]

    for i, stage in enumerate(stages):
        if i < current_index:
            stage['status'] = 'complete'
        elif i == current_index:
            stage['status'] = 'active'
        else:
            stage['status'] = 'pending'

    return stages
```

### backend/app/routers/nonprofit_auth.py

```
POST /np/auth/signup
  - Create Supabase auth user with email+password
  - Insert nonprofits row with organization_name, email, verification_status='submitted'
  - Return session token + nonprofit record

POST /np/auth/login
  - Supabase signInWithPassword
  - Return session + nonprofit record

GET /np/auth/me
  - Return current user + nonprofits row
```

### backend/app/routers/nonprofit_profile.py

```
POST /np/org-details
  Body: NPOrgDetailsRequest
  - Update nonprofits row with EIN, legal_name, address, contact_email, website, np_type
  - Trigger verification_service.start_ein_verification as background task
  - Return updated nonprofit record

GET /np/verification-status
  - Fetch nonprofits row for current user
  - Call get_verification_stages(np) to build stage list
  - Return: NPVerificationStatusResponse + stages list

POST /np/stripe-connect
  - Create Stripe Connect account for the nonprofit
  - Return Stripe onboarding URL
  - (Frontend opens this URL for the bank account setup shown as banner on Launchpad Home)

GET /np/stripe-connect/status
  - Check if Stripe onboarding is complete
  - Update stripe_onboarding_complete in DB
  - Return status
```

### backend/app/routers/launchpad.py

```
GET /np/launchpad
  Single endpoint — returns ALL data for Launchpad Home in one call:
  {
    nonprofit: { org_name, verification_status, stripe_onboarding_complete },
    events: { total_active, total_draft },
    approvals: {
      pending_count,
      recent: [ last 5 np_event_approvals with event title ]
    },
    donations: [ last 5 np_donations ],
    engagement: [ last 14 days from np_engagement_daily ],
    next_payout: { date, amount, status },
    activity: [ last 10 np_activity items ]
  }

GET /np/approvals
  - List all np_event_approvals for this NP (filter by status query param)

POST /np/approvals/{approval_id}/approve
  - Set np_event_approvals.status = 'approved'
  - Update event.status = 'live' in events table
  - Decrement nonprofits.pending_approvals_count
  - Add activity entry: "Event approved: [title]"

POST /np/approvals/{approval_id}/reject
  Body: { reason: string }
  - Set np_event_approvals.status = 'rejected'
  - Update event.status = 'rejected', set rejection_reason
  - Add activity entry: "Event rejected: [title]"
```

Add all new routers to backend/app/main.py:
```python
from app.routers import nonprofit_auth, nonprofit_profile, launchpad
app.include_router(nonprofit_auth.router, prefix="/np", tags=["NP Auth"])
app.include_router(nonprofit_profile.router, prefix="/np", tags=["NP Profile"])
app.include_router(launchpad.router, prefix="/np", tags=["Launchpad"])
```

Run: uvicorn app.main:app --reload --port 8000
Verify: http://localhost:8000/docs — all /np/* routes present

/compact

---

## STEP 3 — FRONTEND TYPES AND STORE

### frontend/src/types/nonprofit.types.ts

```ts
export type NPVerificationStatus =
  | 'submitted' | 'verifying' | 'verified'
  | 'settlement_setup' | 'active' | 'rejected'

export type NPType = 'standard' | 'church' | 'religious_org'

export interface Nonprofit {
  id: string
  userId: string
  organizationName: string
  email: string
  ein?: string
  legalName?: string
  registeredAddress?: string
  officialContactEmail?: string
  website?: string
  npType: NPType
  verificationStatus: NPVerificationStatus
  einCheckPassed: boolean
  stripeOnboardingComplete: boolean
  totalEventsActive: number
  totalEventsDraft: number
  totalDonationsReceived: number
  pendingApprovalsCount: number
  nextPayoutDate?: string
  nextPayoutAmount: number
  createdAt: string
}

export interface VerificationStage {
  key: string
  label: string
  description: string
  status: 'complete' | 'active' | 'pending'
}

export interface NPDonation {
  id: string
  donorDisplayName: string
  donorAvatarInitials: string
  donorAvatarColor: string
  amount: number
  donatedAt: string
}

export interface NPActivity {
  id: string
  activityText: string
  activityType: string
  flagged: boolean
  createdAt: string
}

export interface EngagementDay {
  date: string
  participantCount: number
  donationCount: number
}

export interface LaunchpadData {
  nonprofit: Nonprofit
  events: { totalActive: number; totalDraft: number }
  approvals: { pendingCount: number; recent: any[] }
  donations: NPDonation[]
  engagement: EngagementDay[]
  nextPayout: { date: string; amount: number; status: string }
  activity: NPActivity[]
}
```

### frontend/src/store/npSlice.ts

```ts
State: {
  nonprofit: Nonprofit | null
  launchpadData: LaunchpadData | null
  verificationStages: VerificationStage[]
  loading: boolean
  error: string | null
}

Thunks:
  npSignupThunk(orgName, email, password)
  npLoginThunk(email, password)
  submitOrgDetailsThunk(details: NPOrgDetailsRequest)
  fetchVerificationStatusThunk()
  fetchLaunchpadThunk()
  approveEventThunk(approvalId)
  rejectEventThunk(approvalId, reason)
```

Add npSlice to existing store/index.ts combineReducers.

### frontend/src/services/nonprofit.service.ts

Wrap all /np/* API calls using the existing Axios instance from api.ts.
Return typed responses using nonprofit.types.ts.

---

## STEP 4 — ROUTING ADDITIONS
# Add to existing src/app/router.tsx — do not replace existing routes

```tsx
// NP routes — use NPLayout (separate from SELayout)
/np/signup          → NPSignup (no layout, no auth guard)
/np/org-details     → OrganizationDetails (NPLayout, requires NP auth)
/np/verification    → VerificationStatus (NPLayout, requires NP auth)
/np/launchpad       → LaunchpadHome (NPLayout, requires NP auth, requires verified status)
```

Create NPLayout (similar to SELayout but with NP-specific nav from Figma):
- Top nav: Charity Hub logo, notification bell, settings icon (match Figma header exactly)
- Bottom tab bar matching Launchpad Home Figma: Home, Events, Approvals, Activity, More

NP auth guard: check Redux npSlice.nonprofit — redirect to /np/signup if null.

---

## STEP 5 — PAGES
# RULE: Run figma get frame "[name]" BEFORE writing each page. Match exactly.

### frontend/src/pages/nonprofit/NPSignup.tsx
Figma frame: "Welcome & Account"

Inspect frame first: figma get frame "Welcome & Account"

From the Figma screen:
- Charity Hub logo top right with "Sign In" link
- Large heading: "Register your nonprofit"
- Subtext: "Verification keeps every donor protected."
- Three input fields: Organization Name, Work Email, Create Password (with eye toggle)
- Orange/amber CTA button: "CONTINUE →"
- Footer text: "By registering, you agree to our Terms of Service and Privacy Policy"

Implementation:
- react-hook-form + zod validation
- Password field with show/hide toggle
- On submit: npSignupThunk → on success navigate to /np/org-details
- Match all colors, spacing, font sizes exactly from Figma frame
- Mobile viewport: 390px wide (Figma shows 390x884 Hug)

### frontend/src/pages/nonprofit/OrganizationDetails.tsx
Figma frame: "Organization Details"

Inspect frame first: figma get frame "Organization Details"

From the Figma screen:
- Back arrow top left, "Charity Hub" header, step indicator "STEP 2 OF 4"
- Heading: "Organization Details"
- Subtext: "Please provide your organization's legal information to proceed with verification."
- Fields (match Figma field labels exactly):
    EIN (Employer Identification Number) — placeholder "XX-XXXXXXX"
    Legal Organization Name — placeholder "e.g. Global Giving Foundation"
    Registered Address — placeholder "123 Charity Lane, Suite 100"
    Official Contact Email — placeholder "contact@organization.org"
    Website — placeholder "https://www.organization.org" (Optional label)
- Orange/amber CTA button: "SUBMIT FOR VERIFICATION"
- Church/religious org section: "Are you a church or religious organization?" with "USE ALTERNATIVE VERIFICATION" button

Implementation:
- react-hook-form + zod (EIN format validation: XX-XXXXXXX pattern)
- On submit: submitOrgDetailsThunk → navigate to /np/verification
- Church path: show modal explaining alternative flow, set np_type='church'
- Auto-format EIN input: insert hyphen after 2nd digit automatically

### frontend/src/pages/nonprofit/VerificationStatus.tsx
Figma frame: "Verification Status"

Inspect frame first: figma get frame "Verification Status"

From the Figma screen:
- Back arrow, Charity Hub logo header
- Heading: "Verification Status"
- Subtext: "We're reviewing your organization details."
- Highlighted info box: "We're checking your EIN against IRS records. Usually takes 2-4 hours."
- Vertical timeline with 5 stages:
    ● Submitted — "Application received successfully" (filled dot = complete)
    ● Verifying — "Checking IRS database and validating authorized signers" (active = current)
    ○ Verified (empty dot = pending)
    ○ Settlement Setup
    ○ Active
- Bottom: "© Contact support" link

Implementation:
- Poll GET /np/verification-status every 10 seconds (use setInterval, clear on unmount)
- Render stages from verificationStages array in Redux store
- Stage dot states: complete = filled colored dot, active = filled with pulse animation, pending = empty outline dot
- Match exact colors from Figma for each stage state
- When status reaches 'settlement_setup': show Stripe Connect button to set up bank account
- When status reaches 'active': show "Go to Launchpad" button → navigate /np/launchpad

### frontend/src/pages/nonprofit/LaunchpadHome.tsx
Figma frame: "Launchpad Home"

Inspect frame first: figma get frame "Launchpad Home"

From the Figma screen (match layout exactly — mobile bottom tab nav):

TOP SECTION:
- NP name "Save the Whales" with blue verified checkmark badge
- "× Live" status chip

BANNER (conditional — shown when stripe not set up):
- Amber/yellow warning banner: "Action Required: Connect your bank account to receive payouts"
- "FIX NOW" button → opens Stripe Connect onboarding URL

EVENTS PANEL:
- Label "Events"
- Two large numbers side by side: "12 Active" and "4 Draft"
- "+ CREATE EVENT" button (outlined)

APPROVALS PANEL:
- Label "Approvals"
- Large number with red badge: "12" pending actions
- "REVIEW ALL" link

ENGAGEMENT SECTION:
- Label "Engagement"
- Line chart of recent activity (use recharts LineChart)
- Red flagged item text below chart: "2 flagged items require review"

RECENT DONATIONS SECTION:
- Label "Recent Donations"
- List of donors: avatar initials circle, donor name, amount right-aligned
  - "Anonymous" — $50.00
  - "Jane Doe" — $25.00
  - "Mark Smith" — $100.00

PAYOUTS SECTION:
- Label "Payouts"
- "Next payout scheduled for"
- Large date: "June 15"
- Status chip: "Processing"

ACTIVITY SECTION:
- Label "Activity"
- Two activity text items (from np_activity table)

BOTTOM TAB BAR (match Figma icons exactly):
- Home (active), Events, Approvals, Activity, More

Implementation:
- Single API call: fetchLaunchpadThunk → GET /np/launchpad
- Show loading skeleton while fetching (match card shapes from Figma)
- Stripe banner: only show if nonprofit.stripeOnboardingComplete === false AND verification_status === 'active'
- Engagement chart: recharts LineChart, last 14 days from engagement array
- Approve/reject inline on the approvals panel: tap "REVIEW ALL" → navigates to approvals list
- Pull to refresh: refetch launchpad data on pull (standard mobile pattern)
- Bottom tab bar navigation:
    Home → /np/launchpad
    Events → /np/events (not in scope — placeholder page)
    Approvals → /np/approvals (not in scope — placeholder page)
    Activity → /np/activity (not in scope — placeholder page)
    More → /np/more (not in scope — placeholder page)

---

## STEP 6 — LAUNCHPAD SUB-COMPONENTS
# Inspect "Launchpad Home" frame for each before writing

### src/components/launchpad/EventsPanel.tsx
Props: { totalActive: number, totalDraft: number, onCreateEvent: () => void }
Match Figma events panel exactly — two stat numbers, create button.

### src/components/launchpad/ApprovalsPanel.tsx
Props: { pendingCount: number, onReviewAll: () => void }
Match Figma approvals panel — large number, red notification badge, review all link.

### src/components/launchpad/EngagementChart.tsx
Props: { data: EngagementDay[] }
recharts LineChart. Match Figma line style, colors, axis labels.
Below chart: flagged items count in red text.

### src/components/launchpad/DonationsPanel.tsx
Props: { donations: NPDonation[] }
Match Figma donation list — avatar circle with initials and color, name, amount.
Avatar colors: generate consistently from donor name (hash name to color index).

### src/components/launchpad/PayoutsPanel.tsx
Props: { date: string, amount: number, status: string }
Match Figma payouts section — large date text, status chip.
Status chip colors: "Processing" = blue/gray, "Paid" = green, "Scheduled" = amber.

### src/components/launchpad/ActivityFeed.tsx
Props: { items: NPActivity[] }
Match Figma activity list — text items, flagged items shown with red indicator.

---

## STEP 7 — FINAL CHECKS

```bash
# Backend
cd backend && uvicorn app.main:app --reload --port 8000
# Verify: http://localhost:8000/docs shows all /np/* routes

# Frontend
cd frontend && npm run dev
# Verify: http://localhost:5173/np/signup loads Welcome & Account screen

# Checklist:
# [ ] Welcome & Account screen matches Figma "Welcome & Account" frame exactly
# [ ] Organization Details screen matches Figma "Organization Details" frame exactly
# [ ] Verification Status screen matches Figma "Verification Status" frame exactly
# [ ] Launchpad Home screen matches Figma "Launchpad Home" frame exactly
# [ ] EIN format auto-formats to XX-XXXXXXX pattern
# [ ] Verification status page polls every 10s and updates stages in real time
# [ ] Stripe banner only shows when stripe_onboarding_complete=false AND status=active
# [ ] Launchpad uses single API call — not 6 separate calls
# [ ] Church/religious org path shows alternative verification option
# [ ] RLS policies prevent NP from seeing other NPs' data
# [ ] Existing SE routes still work — no regressions
# [ ] TypeScript: npm run type-check — zero errors
# [ ] ESLint: npm run lint — zero errors
# [ ] Mobile viewport: all screens correct at 390px width
```

---

## TOKEN EFFICIENCY RULES
1. Figma MCP first — inspect frame before writing any component. No design guessing.
2. Supabase MCP — verify schema after migrations, never re-read SQL files.
3. /compact after Step 2 (backend done) and after Step 5 (pages done).
4. Launchpad endpoint returns all data in one call — never allow multiple fetches.
5. Reuse existing api.ts Axios instance — do not create a new one.
6. Reuse existing auth middleware — do not rewrite for NP, just add NP role check.
7. Line-range reads only — never load full files when you need one function.
8. Types defined once in nonprofit.types.ts — import everywhere.

---

## MCP QUICK REFERENCE

Figma MCP (run before each page):
  figma get frame "Welcome & Account"
  figma get frame "Organization Details"
  figma get frame "Verification Status"
  figma get frame "Launchpad Home"
  figma get styles "color"
  figma get styles "text"

Supabase MCP:
  list tables
  list policies for nonprofits
  query "select * from nonprofits limit 3"
  query "select * from np_event_approvals where status='pending' limit 5"

Slash commands:
  /compact   — after Step 2 and Step 5
  /cost      — check spend at any point
  /model claude-sonnet-4-6  — confirm model before starting