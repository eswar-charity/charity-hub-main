# Charity Hub — SE Journey Build Instructions
# Stack: FastAPI (Python) + Supabase + React (TypeScript) + Cloudinary
# UI: Match Figma screens exactly — no custom design decisions

## GROUND RULES FOR CLAUDE CODE
- Never ask clarifying questions. Make decisions and keep building.
- Read only the files you need for the current step. Do not load the entire codebase into context on every step.
- After each step, run the relevant check command and fix errors before moving to the next step.
- Write small, focused files. Split large components into sub-components immediately.
- Never re-read a file you already have in context in the same session.
- Prefer editing existing files over creating new ones when extending functionality.
- When implementing UI, open the Figma MCP and inspect the exact screen before writing any component. Match spacing, colors, font sizes, and component structure exactly from Figma.

---



## FIGMA REFERENCE
File key: 0my34YJKWQ7UqEQaaUOdOw

Screen map (exact frame names — use these in all figma MCP calls):

- Sign Up           → src/pages/auth/Signup.tsx
- Verify Email      → src/pages/auth/VerifyEmail.tsx
- Parental Consent  → src/pages/auth/ParentalConsent.tsx
- Profile Setup     → src/pages/profile/ProfileSetup.tsx
- Creator Dashboard → src/pages/dashboard/CreatorDashboard.tsx
- Create Event      → src/pages/events/CreateEvent.tsx
- Event Preview     → src/pages/events/EventPreview.tsx
- Submission Status → src/pages/events/SubmissionStatus.tsx
- Live Event View   → src/pages/events/LiveEventView.tsx
- Event Summary     → src/pages/events/EventSummary.tsx


## PROJECT STRUCTURE

```
charity-hub-se/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── se.py
│   │   │   ├── event.py
│   │   │   ├── media.py
│   │   │   └── recognition.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── se_profile.py
│   │   │   ├── events.py
│   │   │   ├── media.py
│   │   │   ├── recognition.py
│   │   │   └── dashboard.py
│   │   ├── services/
│   │   │   ├── cloudinary_service.py
│   │   │   ├── supabase_service.py
│   │   │   └── recognition_service.py
│   │   └── middleware/
│   │       ├── auth.py
│   │       └── minor_protection.py
│   ├── requirements.txt
│   └── .env
    frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── router.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Signup.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── VerifyEmail.tsx
│   │   │   └── ParentalConsent.tsx
│   │   │
│   │   ├── profile/
│   │   │   └── ProfileSetup.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── CreatorDashboard.tsx
│   │   │
│   │   └── events/
│   │       ├── CreateEvent.tsx
│   │       ├── EventPreview.tsx
│   │       ├── LiveEventView.tsx
│   │       ├── EventSummary.tsx
│   │       └── SubmissionStatus.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── events/
│   │   │   ├── EventForm.tsx
│   │   │   ├── EventPreviewCard.tsx
│   │   │   ├── EventSummaryCard.tsx
│   │   │   └── LiveEventPlayer.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── SignupForm.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── OTPInput.tsx
│   │   │   └── ConsentForm.tsx
│   │   │
│   │   ├── profile/
│   │   │   └── ProfileForm.tsx
│   │   │
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Loader.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProfile.ts
│   │   ├── useEvents.ts
│   │   └── useLiveEvent.ts
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── profile.service.ts
│   │   ├── event.service.ts
│   │   └── liveEvent.service.ts
│   │
│   ├── store/
│   │   ├── index.ts
│   │   ├── authSlice.ts
│   │   ├── profileSlice.ts
│   │   ├── eventSlice.ts
│   │   └── liveEventSlice.ts
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── profile.types.ts
│   │   ├── event.types.ts
│   │   └── liveEvent.types.ts
│   │
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── validations.ts
│   │
│   └── assets/
│       ├── images/
│       ├── icons/
│       └── illustrations/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env
└── supabase/
    └── migrations/
        ├── 001_se_profiles.sql
        ├── 002_events.sql
        ├── 003_media.sql
        ├── 004_recognition.sql
        └── 005_rls_policies.sql
```

---

## ENVIRONMENT FILES

### backend/.env
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
APP_ENV=development
CORS_ORIGINS=http://localhost:5173
```

### frontend/.env
```
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

---

## STEP 1 — SUPABASE SCHEMA
# Write and run migrations in order.
# After each migration, verify with Supabase MCP: "list columns for [table]"

### supabase/migrations/001_se_profiles.sql
```sql
create table se_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  handle text unique not null,
  display_name text not null,
  bio text,
  cause_categories text[] default '{}',
  is_minor boolean default false,
  guardian_email text,
  guardian_consent_given boolean default false,
  avatar_public_id text,
  avatar_url text,
  recognition_tier text default 'Spark'
    check (recognition_tier in ('Spark','Flame','Torch','Beacon','Legend')),
  total_events_created integer default 0,
  total_donations_raised numeric(12,2) default 0,
  total_participants integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_se_profiles_user_id on se_profiles(user_id);
create index idx_se_profiles_handle on se_profiles(handle);
```

### supabase/migrations/002_events.sql
```sql
create type event_status as enum (
  'draft','pending_approval','live','wrap_up','memorial','archived','rejected'
);
create table events (
  id uuid primary key default gen_random_uuid(),
  se_profile_id uuid references se_profiles(id) on delete cascade not null,
  nonprofit_id uuid,
  title text not null,
  description text not null,
  cause_category text not null,
  location text,
  event_date date,
  status event_status default 'draft',
  hero_image_public_id text,
  hero_image_url text,
  promo_video_public_id text,
  promo_video_url text,
  is_private boolean default false,
  requires_peer_review boolean default false,
  total_donations numeric(12,2) default 0,
  total_participants integer default 0,
  rejection_reason text,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_events_se_profile_id on events(se_profile_id);
create index idx_events_status on events(status);
```

### supabase/migrations/003_media.sql
```sql
create type media_resource_type as enum ('image','video');
create table event_media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  public_id text not null,
  secure_url text not null,
  media_type media_resource_type not null,
  width integer,
  height integer,
  duration numeric,
  format text,
  display_order integer default 0,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now()
);
create index idx_event_media_event_id on event_media(event_id);
```

### supabase/migrations/004_recognition.sql
```sql
create table recognition_events (
  id uuid primary key default gen_random_uuid(),
  se_profile_id uuid references se_profiles(id) on delete cascade not null,
  event_type text not null,
  points_earned integer default 0,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
create table recognition_tiers (
  tier_name text primary key,
  min_points integer not null,
  badge_color text not null,
  perks text[] default '{}'
);
insert into recognition_tiers values
  ('Spark',  0,     '#F59E0B', ARRAY['Profile badge','Feed visibility']),
  ('Flame',  500,   '#F97316', ARRAY['Flame badge','Priority feed','Peer review access']),
  ('Torch',  2000,  '#EF4444', ARRAY['Torch badge','Analytics dashboard','Featured events']),
  ('Beacon', 5000,  '#8B5CF6', ARRAY['Beacon badge','NP partnership invites','Impact reports']),
  ('Legend', 15000, '#06B6D4', ARRAY['Legend badge','Platform ambassador','Direct NP contact']);
create index idx_recognition_se on recognition_events(se_profile_id);
```

### supabase/migrations/005_rls_policies.sql
```sql
alter table se_profiles enable row level security;
alter table events enable row level security;
alter table event_media enable row level security;
alter table recognition_events enable row level security;

create policy "SE own profile read" on se_profiles for select using (auth.uid() = user_id);
create policy "SE own profile update" on se_profiles for update using (auth.uid() = user_id);
create policy "SE own profile insert" on se_profiles for insert with check (auth.uid() = user_id);

create policy "SE manage own events" on events for all using (
  se_profile_id in (select id from se_profiles where user_id = auth.uid())
);
create policy "Public read live events" on events for select using (status = 'live');

create policy "Public read live event media" on event_media for select using (
  event_id in (select id from events where status = 'live')
);
create policy "SE manage own media" on event_media for all using (uploaded_by = auth.uid());

create policy "SE read own recognition" on recognition_events for select using (
  se_profile_id in (select id from se_profiles where user_id = auth.uid())
);
```

Run: supabase db push
Verify with Supabase MCP: list all tables

---

## STEP 2 — BACKEND

### backend/requirements.txt
```
fastapi==0.111.0
uvicorn[standard]==0.30.0
supabase==2.5.0
python-jose[cryptography]==3.3.0
python-multipart==0.0.9
cloudinary==1.40.0
pydantic==2.7.0
pydantic-settings==2.3.0
httpx==0.27.0
python-dotenv==1.0.0
```

### backend/app/config.py
Use pydantic-settings BaseSettings. Load all env vars with type validation. Export single `settings` instance.

### backend/app/database.py
Create Supabase client using settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY. Export as `db`.

### backend/app/middleware/auth.py
FastAPI dependency `get_current_user`:
- Extract Bearer token from Authorization header
- Verify using Supabase JWT secret via python-jose
- Return decoded payload with user_id and email
- Raise HTTP 401 if missing or invalid

### backend/app/middleware/minor_protection.py
FastAPI dependency `require_guardian_consent`:
- Check se_profile.is_minor for current user
- If minor and guardian_consent_given=False, raise HTTP 403 "Guardian consent required"

### backend/app/models/se.py
Pydantic models: SEProfileCreate, SEProfileUpdate, SEProfileResponse
Include all fields from the se_profiles table. Use snake_case.

### backend/app/models/event.py
Pydantic models: EventCreate, EventUpdate, EventResponse
Include all fields from the events table.

### backend/app/models/media.py
Pydantic models: MediaItemCreate, MediaItemResponse
Fields: public_id, secure_url, media_type, width, height, duration, format

### backend/app/models/recognition.py
Pydantic models: RecognitionEventResponse, TierResponse, DashboardResponse

### backend/app/services/cloudinary_service.py
Functions:
- get_upload_signature(folder, resource_type) — return signed params for browser upload
- delete_media(public_id, resource_type) — destroy from Cloudinary

### backend/app/services/recognition_service.py
POINTS_MAP = {event_created:50, event_live:100, donation_received:10, participant_joined:5, peer_review_given:25}
TIER_THRESHOLDS = {Spark:0, Flame:500, Torch:2000, Beacon:5000, Legend:15000}
Functions:
- award_points(se_profile_id, event_type, metadata) — insert recognition_event, recalculate tier, update se_profile
- get_se_points(se_profile_id) — sum all points from recognition_events

### backend/app/routers/auth.py
POST /auth/signup — create Supabase auth user + se_profile row
POST /auth/login — return Supabase session
POST /auth/logout — invalidate session
GET /auth/me — return user + se_profile

### backend/app/routers/se_profile.py
GET /se/profile — own profile (requires auth)
PUT /se/profile — update profile (requires auth)
POST /se/profile/avatar — update avatar_public_id + avatar_url (requires auth)
GET /se/profile/{handle} — public profile by handle

### backend/app/routers/events.py
GET /events/my — list own events, filter by status query param
POST /events — create event draft (requires auth, minor check)
GET /events/{id} — event detail
PUT /events/{id} — update event (requires auth, owner check)
DELETE /events/{id} — delete draft (requires auth, owner check)
POST /events/{id}/submit — draft → pending_approval, award event_created points
POST /events/{id}/hero-image — update hero image fields
POST /events/{id}/promo-video — update promo video fields

### backend/app/routers/media.py
GET /media/sign — return Cloudinary upload signature (query: folder, resource_type)
POST /media/event/{event_id} — save MediaItem to event_media table
DELETE /media/{media_id} — delete from event_media + Cloudinary

### backend/app/routers/recognition.py
GET /recognition/tiers — all tiers from recognition_tiers table
GET /recognition/my — current SE tier, points, recent recognition_events
GET /recognition/my/stats — lifetime totals

### backend/app/routers/dashboard.py
GET /dashboard/se — single endpoint returning:
  { se_profile, recent_events (last 5), recognition (tier+points+next_tier), lifetime_stats, pending_count }
This prevents multiple API calls from the dashboard page.

### backend/app/main.py
FastAPI app with CORS middleware. Include all routers with prefixes. Add GET /health endpoint.

Run: uvicorn app.main:app --reload --port 8000
Verify: http://localhost:8000/docs shows all routes

/compact
---

## STEP 3 — FRONTEND SETUP

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install @supabase/supabase-js next-cloudinary \
  @reduxjs/toolkit react-redux react-router-dom \
  axios @tanstack/react-query \
  react-hook-form zod @hookform/resolvers \
  lucide-react clsx
```

---

## STEP 4 — TYPES

### src/types/se.types.ts
```ts
export type RecognitionTier = 'Spark' | 'Flame' | 'Torch' | 'Beacon' | 'Legend'
export interface SEProfile {
  id: string; userId: string; handle: string; displayName: string
  bio?: string; causeCategories: string[]; isMinor: boolean
  avatarUrl?: string; recognitionTier: RecognitionTier
  totalEventsCreated: number; totalDonationsRaised: number; totalParticipants: number
  createdAt: string
}
```

### src/types/event.types.ts
```ts
export type EventStatus = 'draft'|'pending_approval'|'live'|'wrap_up'|'memorial'|'archived'|'rejected'
export interface Event {
  id: string; seProfileId: string; title: string; description: string
  causeCategory: string; location?: string; eventDate?: string; status: EventStatus
  heroImageUrl?: string; promoVideoUrl?: string
  totalDonations: number; totalParticipants: number; createdAt: string
}
```

### src/types/media.types.ts
```ts
export type MediaResourceType = 'image' | 'video'
export interface MediaItem {
  id?: string; publicId: string; secureUrl: string
  resourceType: MediaResourceType; width?: number; height?: number
  duration?: number; format?: string
}
```

---

## STEP 5 — SERVICES AND STORE

### src/services/api.ts
Axios instance with baseURL from env. Request interceptor: attach Bearer token from Supabase session. Response interceptor: 401 → redirect /login, 403 → dispatch guardian consent error.

### src/services/auth.service.ts
Wrap Supabase auth: signUp, signIn, signOut, getSession, onAuthStateChange

### src/services/events.service.ts
Wrap all /events/* API calls. Return typed Event responses.

### src/services/media.service.ts
getUploadSignature(folder, resourceType), saveMediaItem(eventId, item), deleteMediaItem(id)

### src/store/authSlice.ts
State: { user, session, seProfile, loading, error }
Thunks: loginThunk, signupThunk, logoutThunk, loadSessionThunk

### src/store/eventsSlice.ts
State: { myEvents, currentEvent, loading, error }
Thunks: fetchMyEventsThunk, createEventThunk, updateEventThunk, submitEventThunk

### src/store/seSlice.ts
State: { profile, recognition, dashboardData, loading }
Thunks: fetchDashboardThunk, updateProfileThunk

### src/store/index.ts
Combine slices. Export RootState and AppDispatch types.

---

## STEP 6 — HOOKS

### src/hooks/useAuth.ts
Returns { user, seProfile, isAuthenticated, login, signup, logout } from Redux.

### src/hooks/useCloudinary.ts
Manages signed Cloudinary uploads. Calls GET /media/sign for credentials. Returns { upload, uploading, result }.

### src/hooks/useEvents.ts
Returns { myEvents, currentEvent, createEvent, updateEvent, submitEvent, loading } from Redux.

### src/hooks/useSEProfile.ts
Returns { profile, recognition, dashboardData, updateProfile, loading } from Redux.

---

## STEP 7 — MEDIA COMPONENTS
# Use Figma MCP to inspect upload screens before writing each component

### src/components/media/ImageUploader.tsx
Props: { onUpload: (item: MediaItem) => void, folder: string, label?: string }
Use CldUploadWidget with signed upload via useCloudinary hook.
Match Figma drop zone design exactly. Show progress bar during upload.

### src/components/media/VideoUploader.tsx
Same as ImageUploader but resourceType="video". Preview with CldVideoPlayer after upload.

### src/components/media/MediaGallery.tsx
Props: { items: MediaItem[], onRemove?: (id: string) => void, columns?: number }
CldImage for images, CldVideoPlayer for videos. Match Figma gallery grid exactly.

---

## STEP 8 — PAGES
# RULE: Before writing each page:

1. Verify the frame exists in the Figma file.
2. Run:
   figma get frame "<Exact Frame Name>"
3. Extract colors, typography, spacing, icons, and layout.
4. Match the frame exactly.
5. Do not invent UI patterns not present in Figma.
# Then implement to match that frame exactly.

### src/pages/auth/Signup.tsx
Figma screen: "Sign Up"

### src/pages/auth/Login.tsx
Figma screen: "Login"

### src/pages/auth/VerifyEmail.tsx
Figma screen: "Verify Email"

### src/pages/auth/ParentalConsent.tsx
Figma screen: "Parental Consent"

### src/pages/profile/ProfileSetup.tsx
Figma screen: "Profile Setup"

### src/pages/dashboard/CreatorDashboard.tsx
Figma screen: "Creator Dashboard"

### src/pages/events/CreateEvent.tsx
Figma screen: "Create Event"

### src/pages/events/EventPreview.tsx
Figma screen: "Event Preview"

### src/pages/events/SubmissionStatus.tsx
Figma screen: "Submission Status"

### src/pages/events/LiveEventView.tsx
Figma screen: "Live Event View"

### src/pages/events/EventSummary.tsx
Figma screen: "Event Summary"

---

## STEP 9 — LAYOUT AND ROUTING

Sign Up
Parental Consent
Verify Email
Profile Setup
Event Preview
Create Event
Creator Dashboard
Submission Status
Live Event View
Event Summary

---

## STEP 10 — FINAL CHECKS

```bash
# Backend
cd backend && uvicorn app.main:app --reload --port 8000
# http://localhost:8000/docs — all routes present

# Frontend
cd frontend && npm run dev
# http://localhost:5173 — login page loads

# Checklist:
# [ ] Supabase RLS active — anon requests return 401
# [ ] Cloudinary signed uploads — no API secret in browser network tab
# [ ] Recognition points awarded on event creation and submission
# [ ] Minor SE blocked without guardian_consent_given=true
# [ ] All pages match Figma screens (check side by side)
# [ ] TypeScript: npm run type-check — zero errors
# [ ] ESLint: npm run lint — zero errors
# [ ] Dashboard uses single API call, not 4 separate calls
```

---

## TOKEN EFFICIENCY RULES
# Follow throughout the build to avoid context overflow

1. Figma MCP for all UI — never guess design decisions, always inspect before writing
2. Supabase MCP for all DB — never re-read migration files after running them
3. Filesystem MCP with line-range reads — never load full files for a single function
4. /compact after completing backend (Step 2) before starting frontend
5. /compact again after completing pages (Step 8) before layout and routing
6. /clear when switching between backend and frontend work
7. /cost to check token spend at each step
8. Types defined once in src/types/ — import everywhere, never duplicate
9. Dashboard endpoint returns all data in one call — enforce this, never allow 4 separate calls
10. One component per file, one responsibility per component — keeps files small and reads fast

---

## MCP QUICK REFERENCE

## MCP QUICK REFERENCE

Figma MCP:

  figma get frame "Sign Up"
  figma get frame "Parental Consent"
  figma get frame "Verify Email"
  figma get frame "Profile Setup"
  figma get frame "Event Preview"
  figma get frame "Create Event"
  figma get frame "Creator Dashboard"
  figma get frame "Submission Status"
  figma get frame "Live Event View"
  figma get frame "Event Summary"

  figma get styles "color"           — get color tokens
  figma get styles "text"            — get typography tokens
  figma get styles "effect"          — get shadows/effects
  figma get styles "grid"            — get layout/grid tokens

Supabase MCP:
  list tables                         — verify schema
  list policies for events            — verify RLS
  query "select * from se_profiles limit 3"   — test data

Filesystem MCP:
  read src/hooks/useAuth.ts 1-30      — read only lines needed
  search "fetchDashboardThunk"        — find usages without full file load
