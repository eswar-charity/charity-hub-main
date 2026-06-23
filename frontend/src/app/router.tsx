import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSelector } from 'react-redux'
import { lazy, Suspense, type ReactNode } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import type { RootState } from '../store'

// ── Lazy page imports (one chunk per page) ─────────────────────
const Login              = lazy(() => import('../pages/auth/Login'))
const Signup             = lazy(() => import('../pages/auth/Signup'))
const VerifyEmail        = lazy(() => import('../pages/auth/VerifyEmail'))
const ParentalConsent    = lazy(() => import('../pages/auth/ParentalConsent'))
const ProfileSetup       = lazy(() => import('../pages/profile/ProfileSetup'))
const CreatorDashboard   = lazy(() => import('../pages/dashboard/CreatorDashboard'))
const CreateEvent        = lazy(() => import('../pages/events/CreateEvent'))
const EventPreview       = lazy(() => import('../pages/events/EventPreview'))
const EventSummary       = lazy(() => import('../pages/events/EventSummary'))
const SubmissionStatus   = lazy(() => import('../pages/events/SubmissionStatus'))
const LiveEventView      = lazy(() => import('../pages/events/LiveEventView'))
const NPSignup           = lazy(() => import('../pages/nonprofit/NPSignup'))
const OrganizationDetails = lazy(() => import('../pages/nonprofit/OrganizationDetails'))
const VerificationStatus = lazy(() => import('../pages/nonprofit/VerificationStatus'))
const LaunchpadHome      = lazy(() => import('../pages/nonprofit/LaunchpadHome'))
const NPApprovals        = lazy(() => import('../pages/nonprofit/NPApprovals'))

// ── Shared spinner used as Suspense fallback ───────────────────
function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F0F4FA' }}>
      <div className="w-8 h-8 rounded-full border-[3px] border-[#1A6EB5] border-t-transparent animate-spin" />
    </div>
  )
}

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>
}

// ── SE auth guard ──────────────────────────────────────────────
function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, sessionLoading } = useAuth()
  if (sessionLoading) return <PageSpinner />
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function Protected({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppLayout>{children}</AppLayout>
    </AuthGuard>
  )
}

function ProtectedPage({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}

// ── NP auth guard ──────────────────────────────────────────────
function NPAuthGuard({ children }: { children: ReactNode }) {
  const nonprofit = useSelector((s: RootState) => s.np.nonprofit)
  const npSessionLoading = useSelector((s: RootState) => s.np.npSessionLoading)
  if (npSessionLoading) return <PageSpinner />
  if (!nonprofit) return <Navigate to="/np/signup" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  // ── Root ──
  { path: '/', element: <Navigate to="/dashboard" replace /> },

  // ── SE auth ──
  { path: '/login',            element: <Lazy><Login /></Lazy> },
  { path: '/signup',           element: <Lazy><Signup /></Lazy> },
  { path: '/verify-email',     element: <Lazy><VerifyEmail /></Lazy> },
  { path: '/parental-consent', element: <Lazy><ParentalConsent /></Lazy> },

  // ── SE protected ──
  { path: '/profile/setup',            element: <Lazy><Protected><ProfileSetup /></Protected></Lazy> },
  { path: '/dashboard',                element: <Lazy><Protected><CreatorDashboard /></Protected></Lazy> },
  { path: '/events',                   element: <Lazy><Protected><EventSummary /></Protected></Lazy> },
  { path: '/events/create',            element: <Lazy><ProtectedPage><CreateEvent /></ProtectedPage></Lazy> },
  { path: '/events/submission-status', element: <Lazy><Protected><SubmissionStatus /></Protected></Lazy> },
  { path: '/events/:id',               element: <Lazy><ProtectedPage><EventPreview /></ProtectedPage></Lazy> },
  { path: '/events/:id/live',          element: <Lazy><ProtectedPage><LiveEventView /></ProtectedPage></Lazy> },
  { path: '/events/:id/edit',          element: <Lazy><Protected><EventSummary /></Protected></Lazy> },

  // ── NP public ──
  { path: '/np/signup', element: <Lazy><NPSignup /></Lazy> },
  { path: '/np/login',  element: <Lazy><NPSignup /></Lazy> },

  // ── NP protected ──
  { path: '/np/org-details',  element: <Lazy><NPAuthGuard><OrganizationDetails /></NPAuthGuard></Lazy> },
  { path: '/np/verification', element: <Lazy><NPAuthGuard><VerificationStatus /></NPAuthGuard></Lazy> },
  { path: '/np/launchpad',    element: <Lazy><NPAuthGuard><LaunchpadHome /></NPAuthGuard></Lazy> },
  { path: '/np/approvals',    element: <Lazy><NPAuthGuard><NPApprovals /></NPAuthGuard></Lazy> },
  { path: '/np/events',       element: <Lazy><NPAuthGuard><LaunchpadHome /></NPAuthGuard></Lazy> },
  { path: '/np/activity',     element: <Lazy><NPAuthGuard><LaunchpadHome /></NPAuthGuard></Lazy> },
  { path: '/np/more',         element: <Lazy><NPAuthGuard><LaunchpadHome /></NPAuthGuard></Lazy> },
])
