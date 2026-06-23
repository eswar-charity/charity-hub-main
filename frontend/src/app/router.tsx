import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSelector } from 'react-redux'
import { type ReactNode } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import type { RootState } from '../store'

import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'
import VerifyEmail from '../pages/auth/VerifyEmail'
import ParentalConsent from '../pages/auth/ParentalConsent'
import ProfileSetup from '../pages/profile/ProfileSetup'
import CreatorDashboard from '../pages/dashboard/CreatorDashboard'
import CreateEvent from '../pages/events/CreateEvent'
import EventPreview from '../pages/events/EventPreview'
import EventSummary from '../pages/events/EventSummary'
import SubmissionStatus from '../pages/events/SubmissionStatus'
import LiveEventView from '../pages/events/LiveEventView'

import NPSignup from '../pages/nonprofit/NPSignup'
import OrganizationDetails from '../pages/nonprofit/OrganizationDetails'
import VerificationStatus from '../pages/nonprofit/VerificationStatus'
import LaunchpadHome from '../pages/nonprofit/LaunchpadHome'
import NPApprovals from '../pages/nonprofit/NPApprovals'

// ── SE auth guard ──────────────────────────────────────────────
function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, sessionLoading } = useAuth()
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F0F4FA' }}>
        <div className="w-8 h-8 rounded-full border-[3px] border-[#1A6EB5] border-t-transparent animate-spin" />
      </div>
    )
  }
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
  if (npSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F0F4FA' }}>
        <div className="w-8 h-8 rounded-full border-[3px] border-[#1A6EB5] border-t-transparent animate-spin" />
      </div>
    )
  }
  if (!nonprofit) return <Navigate to="/np/signup" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  // ── Root ──
  { path: '/', element: <Navigate to="/dashboard" replace /> },

  // ── SE auth ──
  { path: '/login',             element: <Login /> },
  { path: '/signup',            element: <Signup /> },
  { path: '/verify-email',      element: <VerifyEmail /> },
  { path: '/parental-consent',  element: <ParentalConsent /> },

  // ── SE protected ──
  { path: '/profile/setup',           element: <Protected><ProfileSetup /></Protected> },
  { path: '/dashboard',               element: <Protected><CreatorDashboard /></Protected> },
  { path: '/events',                  element: <Protected><EventSummary /></Protected> },
  { path: '/events/create',           element: <ProtectedPage><CreateEvent /></ProtectedPage> },
  { path: '/events/submission-status',element: <Protected><SubmissionStatus /></Protected> },
  { path: '/events/:id',              element: <ProtectedPage><EventPreview /></ProtectedPage> },
  { path: '/events/:id/live',         element: <ProtectedPage><LiveEventView /></ProtectedPage> },
  { path: '/events/:id/edit',         element: <Protected><EventSummary /></Protected> },

  // ── NP public ──
  { path: '/np/signup', element: <NPSignup /> },
  { path: '/np/login',  element: <NPSignup /> },

  // ── NP protected (requires np Redux state) ──
  { path: '/np/org-details',   element: <NPAuthGuard><OrganizationDetails /></NPAuthGuard> },
  { path: '/np/verification',  element: <NPAuthGuard><VerificationStatus /></NPAuthGuard> },
  { path: '/np/launchpad',     element: <NPAuthGuard><LaunchpadHome /></NPAuthGuard> },

  // ── NP placeholder stubs ──
  { path: '/np/approvals', element: <NPAuthGuard><NPApprovals /></NPAuthGuard> },
  { path: '/np/events',    element: <NPAuthGuard><LaunchpadHome /></NPAuthGuard> },
  { path: '/np/activity',  element: <NPAuthGuard><LaunchpadHome /></NPAuthGuard> },
  { path: '/np/more',      element: <NPAuthGuard><LaunchpadHome /></NPAuthGuard> },
])
