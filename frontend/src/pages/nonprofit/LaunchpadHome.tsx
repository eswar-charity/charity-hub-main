import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Home, CalendarDays, ClipboardCheck, Activity, MoreHorizontal, CheckCircle } from 'lucide-react'
import { fetchLaunchpadThunk } from '../../store/npSlice'
import type { AppDispatch, RootState } from '../../store'
import { EventsPanel } from '../../components/launchpad/EventsPanel'
import { ApprovalsPanel } from '../../components/launchpad/ApprovalsPanel'
import { EngagementChart } from '../../components/launchpad/EngagementChart'
import { DonationsPanel } from '../../components/launchpad/DonationsPanel'
import { PayoutsPanel } from '../../components/launchpad/PayoutsPanel'
import { ActivityFeed } from '../../components/launchpad/ActivityFeed'

const TAB_ITEMS = [
  { icon: Home,           label: 'Home',      path: '/np/launchpad' },
  { icon: CalendarDays,   label: 'Events',    path: '/np/events' },
  { icon: ClipboardCheck, label: 'Approvals', path: '/np/approvals' },
  { icon: Activity,       label: 'Activity',  path: '/np/activity' },
  { icon: MoreHorizontal, label: 'More',      path: '/np/more' },
]

function Skeleton({ h = 'h-24' }: { h?: string }) {
  return <div className={`${h} rounded-2xl animate-pulse`} style={{ backgroundColor: '#EEF3FB' }} />
}

export default function LaunchpadHome() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const { launchpadData, loading } = useSelector((s: RootState) => s.np)

  useEffect(() => { dispatch(fetchLaunchpadThunk()) }, [dispatch])

  const data = launchpadData
  const npInfo = data?.nonprofit
  const flaggedCount = data?.activity.filter(a => a.flagged).length ?? 0

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F4FA' }}>
      {/* Top header */}
      <header className="bg-white px-5 py-4 sticky top-0 z-10"
        style={{ borderBottom: '1px solid #EEF3FB' }}>
        <div className="max-w-[390px] mx-auto lg:max-w-none flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="text-[17px] font-bold" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
                {npInfo?.orgName ?? 'Your Organization'}
              </p>
              {npInfo?.verificationStatus === 'active' && (
                <CheckCircle size={16} style={{ color: '#1A6EB5' }} />
              )}
            </div>
            {npInfo?.verificationStatus === 'active' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold mt-0.5"
                style={{ color: '#16A34A', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em' }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: '#16A34A' }} />
                LIVE
              </span>
            )}
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: '#1A6EB5', fontFamily: "'Roboto', sans-serif" }}>
            {(npInfo?.orgName ?? 'O')[0]}
          </div>
        </div>
      </header>

      {/* Main scrollable content */}
      <div className="flex-1 pb-24 overflow-y-auto">
        <div className="max-w-[390px] mx-auto px-4 py-4 flex flex-col gap-4 lg:max-w-[900px] lg:grid lg:grid-cols-2 lg:gap-5 lg:py-6">

          {/* Stripe banner */}
          {data && !npInfo?.stripeOnboardingComplete && npInfo?.verificationStatus === 'active' && (
            <div className="px-4 py-3.5 rounded-2xl flex items-center gap-3 lg:col-span-2"
              style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
              <span className="text-lg">⚠</span>
              <p className="flex-1 text-[13px]" style={{ color: '#92400E', fontFamily: "'Roboto', sans-serif" }}>
                <strong>Action Required:</strong> Connect your bank account to receive payouts
              </p>
              <button
                className="text-[11px] font-bold px-3 py-1.5 rounded-full text-white flex-shrink-0"
                style={{ backgroundColor: '#D97706', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em' }}
              >
                FIX NOW
              </button>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && !data && (
            <>
              <Skeleton h="h-36" /><Skeleton h="h-36" /><Skeleton h="h-48" />
              <Skeleton h="h-36" /><Skeleton h="h-28" /><Skeleton h="h-28" />
            </>
          )}

          {data && (
            <>
              <EventsPanel
                totalActive={data.events.totalActive}
                totalDraft={data.events.totalDraft}
                onCreateEvent={() => navigate('/events/create')}
              />
              <ApprovalsPanel
                pendingCount={data.approvals.pendingCount}
                onReviewAll={() => navigate('/np/approvals')}
              />
              <div className="lg:col-span-2">
                <EngagementChart data={data.engagement} flaggedCount={flaggedCount} />
              </div>
              <DonationsPanel donations={data.donations} />
              <PayoutsPanel
                date={data.nextPayout.date}
                amount={data.nextPayout.amount}
                status={data.nextPayout.status}
              />
              <div className="lg:col-span-2">
                <ActivityFeed items={data.activity} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white flex items-center justify-around px-2 py-2.5 z-20 lg:hidden"
        style={{ borderTop: '1px solid #EEF3FB', boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}
      >
        {TAB_ITEMS.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 px-2 py-1"
            >
              <Icon size={20} style={{ color: isActive ? '#1A6EB5' : '#9CA3AF' }} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px]" style={{
                color: isActive ? '#1A6EB5' : '#9CA3AF',
                fontFamily: "'Roboto', sans-serif",
                fontWeight: isActive ? 600 : 400,
              }}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Desktop side nav for launchpad */}
      <nav className="hidden lg:flex fixed top-0 left-0 h-full w-56 flex-col bg-white z-20"
        style={{ borderRight: '1px solid #EEF3FB' }}>
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#005592' }}>
            <svg width="14" height="13" viewBox="0 0 24 23" fill="none">
              <path d="M6 23C5.16667 23 4.45833 22.7083 3.875 22.125C3.29167 21.5417 3 20.8333 3 20C3 19.1667 3.29167 18.4583 3.875 17.875C4.45833 17.2917 5.16667 17 6 17C6.23333 17 6.45 17.025 6.65 17.075C6.85 17.125 7.04167 17.1917 7.225 17.275L8.65 15.5C8.18333 14.9833 7.85833 14.4 7.675 13.75C7.49167 13.1 7.45 12.45 7.55 11.8L5.525 11.125C5.24167 11.5417 4.88333 11.875 4.45 12.125C4.01667 12.375 3.53333 12.5 3 12.5C2.16667 12.5 1.45833 12.2083 0.875 11.625C0.291667 11.0417 0 10.3333 0 9.5C0 8.66667 0.291667 7.95833 0.875 7.375C1.45833 6.79167 2.16667 6.5 3 6.5C3.83333 6.5 4.54167 6.79167 5.125 7.375C5.70833 7.95833 6 8.66667 6 9.5C6 9.53333 6 9.56667 6 9.6C6 9.63333 6 9.66667 6 9.7L8.025 10.4C8.35833 9.8 8.80417 9.29167 9.3625 8.875C9.92083 8.45833 10.55 8.19167 11.25 8.075V5.9C10.6 5.71667 10.0625 5.3625 9.6375 4.8375C9.2125 4.3125 9 3.7 9 3C9 2.16667 9.29167 1.45833 9.875 0.875C10.4583 0.291667 11.1667 0 12 0C12.8333 0 13.5417 0.291667 14.125 0.875C14.7083 1.45833 15 2.16667 15 3C15 3.7 14.7833 4.3125 14.35 4.8375C13.9167 5.3625 13.3833 5.71667 12.75 5.9V8.075C13.45 8.19167 14.0792 8.45833 14.6375 8.875C15.1958 9.29167 15.6417 9.8 15.975 10.4L18 9.7C18 9.66667 18 9.63333 18 9.6C18 9.56667 18 9.53333 18 9.5C18 8.66667 18.2917 7.95833 18.875 7.375C19.4583 6.79167 20.1667 6.5 21 6.5C21.8333 6.5 22.5417 6.79167 23.125 7.375C23.7083 7.95833 24 8.66667 24 9.5C24 10.3333 23.7083 11.0417 23.125 11.625C22.5417 12.2083 21.8333 12.5 21 12.5C20.4667 12.5 19.9792 12.375 19.5375 12.125C19.0958 11.875 18.7417 11.5417 18.475 11.125L16.45 11.8C16.55 12.45 16.5083 13.0958 16.325 13.7375C16.1417 14.3792 15.8167 14.9667 15.35 15.5L16.775 17.25C16.9583 17.1667 17.15 17.1042 17.35 17.0625C17.55 17.0208 17.7667 17 18 17C18.8333 17 19.5417 17.2917 20.125 17.875C20.7083 18.4583 21 19.1667 21 20C21 20.8333 20.7083 21.5417 20.125 22.125C19.5417 22.7083 18.8333 23 18 23C17.1667 23 16.4583 22.7083 15.875 22.125C15.2917 21.5417 15 20.8333 15 20C15 19.6667 15.0542 19.3458 15.1625 19.0375C15.2708 18.7292 15.4167 18.45 15.6 18.2L14.175 16.425C13.4917 16.8083 12.7625 17 11.9875 17C11.2125 17 10.4833 16.8083 9.8 16.425L8.4 18.2C8.58333 18.45 8.72917 18.7292 8.8375 19.0375C8.94583 19.3458 9 19.6667 9 20C9 20.8333 8.70833 21.5417 8.125 22.125C7.54167 22.7083 6.83333 23 6 23Z" fill="#005592"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 13, color: '#005592', letterSpacing: '0.1em' }}>
            CHARITY HUB
          </span>
        </div>
        <div className="mx-4 mb-3" style={{ height: 1, backgroundColor: '#EEF3FB' }} />
        <div className="flex flex-col gap-1 px-3">
          {TAB_ITEMS.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path
            return (
              <button key={label} onClick={() => navigate(path)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left"
                style={{
                  backgroundColor: isActive ? '#EBF3FC' : 'transparent',
                  color: isActive ? '#1A6EB5' : '#6B7280',
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                }}>
                <Icon size={17} strokeWidth={isActive ? 2 : 1.5} />
                {label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Desktop: shift content right of side nav */}
      <style>{`@media (min-width: 1024px) { .launchpad-content { margin-left: 224px; } }`}</style>
    </div>
  )
}
