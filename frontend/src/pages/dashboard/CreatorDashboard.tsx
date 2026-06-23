import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../../hooks/useProfile'
import { useAuth } from '../../hooks/useAuth'
import { Loader } from '../../components/common/Loader'
import { ChevronRight, Megaphone, Plus } from 'lucide-react'

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  live:             { label: 'LIVE',      color: '#16A34A', bg: '#DCFCE7' },
  pending_approval: { label: 'IN REVIEW', color: '#1A6EB5', bg: '#EBF3FC' },
  draft:            { label: 'DRAFT',     color: '#6B7280', bg: '#F3F4F6' },
  rejected:         { label: 'REJECTED',  color: '#DC2626', bg: '#FEE2E2' },
  wrap_up:          { label: 'WRAP UP',   color: '#9333EA', bg: '#F3E8FF' },
}

function EventRow({ event, onClick }: { event: any; onClick: () => void }) {
  const status = STATUS_STYLES[event.status] ?? STATUS_STYLES.draft
  const updatedAgo = '2h ago'

  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-3 bg-white rounded-xl px-4 text-left hover:shadow-sm transition-shadow"
      style={{ border: '1px solid #EEF3FB' }}>
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: '#EEF3FB' }}>
        {event.hero_image_url
          ? <img src={event.hero_image_url} alt="" className="w-full h-full object-cover" />
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 10h16M4 14h10" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" /></svg>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold truncate" style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
          {event.title}
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
          Updated {updatedAgo}
        </p>
        <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ color: status.color, backgroundColor: status.bg, fontFamily: "'Oswald', sans-serif", letterSpacing: '0.05em' }}>
          {status.label}
        </span>
      </div>
      <ChevronRight size={16} style={{ color: '#9CA3AF' }} />
    </button>
  )
}

export default function CreatorDashboard() {
  const { fetchDashboard, dashboardData, loading } = useProfile()
  const { seProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { fetchDashboard() }, [])

  if (loading && !dashboardData) {
    return <div className="flex items-center justify-center h-64"><Loader /></div>
  }

  const data = dashboardData as Record<string, any> | null
  const profile = data?.se_profile ?? seProfile as Record<string, any> | null
  const stats = data?.lifetime_stats as Record<string, any> | null
  const recentEvents: any[] = data?.recent_events ?? []
  const recognition = data?.recognition as Record<string, any> | null

  const totalViews = stats?.total_participants ?? 0
  const totalReactions = stats?.total_donations_raised ?? 0
  const totalEventsCreated = stats?.total_events_created ?? 0

  return (
    <>
      {/* ═══════════════════════════════════════
          MOBILE layout — hidden on lg+
          (no changes from original)
      ═══════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col" style={{ backgroundColor: '#F0F4FA' }}>
        {/* Welcome row */}
        <div className="flex items-center gap-3 px-5 py-4 bg-white" style={{ borderBottom: '1px solid #EEF3FB' }}>
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white" style={{ backgroundColor: '#1A6EB5' }}>
                  {(profile?.display_name ?? 'A')[0]}
                </div>
            }
          </div>
          <div>
            <p className="text-[17px] font-bold" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
              Welcome back, {profile?.display_name ?? 'Creator'}
            </p>
            <p className="text-[13px]" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
              Ready to make an impact today?
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex bg-white" style={{ borderBottom: '1px solid #EEF3FB' }}>
          <div className="flex-1 px-5 py-4">
            <p className="text-[22px] font-bold" style={{ color: '#1A6EB5', fontFamily: "'Roboto', sans-serif" }}>
              {totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}
            </p>
            <p className="text-[11px] font-semibold" style={{ color: '#9CA3AF', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em' }}>
              TOTAL VIEWS
            </p>
          </div>
          <div className="w-px my-4" style={{ backgroundColor: '#EEF3FB' }} />
          <div className="flex-1 px-5 py-4">
            <p className="text-[22px] font-bold" style={{ color: '#1A6EB5', fontFamily: "'Roboto', sans-serif" }}>
              {Math.round(Number(totalReactions)).toLocaleString()}
            </p>
            <p className="text-[11px] font-semibold" style={{ color: '#9CA3AF', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em' }}>
              REACTIONS
            </p>
          </div>
        </div>

        <div className="px-4 py-5 flex flex-col gap-5">
          {/* Launch card */}
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: '#1A6EB5' }}>
              <Megaphone size={22} color="white" />
            </div>
            <h2 className="text-[18px] font-bold mb-1" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
              Launch a movement
            </h2>
            <p className="text-[13px] mb-5 leading-relaxed" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
              Start a new charity walk or community event and rally your supporters.
            </p>
            <button
              onClick={() => navigate('/events/create')}
              className="px-8 py-3.5 rounded-full text-white text-[14px] font-bold flex items-center gap-2"
              style={{ backgroundColor: '#F59E0B', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em' }}
            >
              <Plus size={16} strokeWidth={2.5} /> CREATE EVENT
            </button>
          </div>

          {/* My Events */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[17px] font-bold" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
                My Events
              </h2>
              <button onClick={() => navigate('/events')} style={{ color: '#1A6EB5', fontSize: 14, fontFamily: "'Roboto', sans-serif" }}>
                View All
              </button>
            </div>

            {recentEvents.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center" style={{ border: '1px solid #EEF3FB' }}>
                <p className="text-[14px]" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
                  No events yet. Create your first event!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentEvents.map((event: any) => (
                  <EventRow key={event.id} event={event} onClick={() => navigate(event.status === 'live' ? `/events/${event.id}/live` : `/events/${event.id}`)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          DESKTOP layout — hidden below lg
      ═══════════════════════════════════════ */}
      <div className="hidden lg:block min-h-screen p-8" style={{ backgroundColor: '#F0F4FA' }}>
        {/* Top welcome bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-200"
              style={{ border: '3px solid white', boxShadow: '0 2px 8px rgba(26,110,181,0.2)' }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white" style={{ backgroundColor: '#1A6EB5' }}>
                    {(profile?.display_name ?? 'A')[0]}
                  </div>
              }
            </div>
            <div>
              <h1 className="text-[26px] font-bold leading-tight" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
                Welcome back, {profile?.display_name ?? 'Creator'}
              </h1>
              <p className="text-[14px]" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
                Ready to make an impact today?
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/events/create')}
            className="px-6 py-3 rounded-full text-white text-[13px] font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#F59E0B', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.08em' }}
          >
            <Plus size={15} /> CREATE EVENT
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {[
            { value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : String(totalViews), label: 'TOTAL PARTICIPANTS', color: '#1A6EB5' },
            { value: `$${Math.round(Number(totalReactions)).toLocaleString()}`, label: 'DONATIONS RAISED', color: '#F59E0B' },
            { value: String(totalEventsCreated), label: 'EVENTS CREATED', color: '#10B981' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EEF3FB' }}>
              <p className="text-[34px] font-bold leading-none mb-2" style={{ color: s.color, fontFamily: "'Roboto', sans-serif" }}>
                {s.value}
              </p>
              <p className="text-[11px] font-semibold" style={{ color: '#9CA3AF', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.08em' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Two-column area: events list + right panel */}
        <div className="grid grid-cols-3 gap-6">
          {/* Events column (2/3) */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-bold" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>My Events</h2>
              <button onClick={() => navigate('/events')} style={{ color: '#1A6EB5', fontSize: 14, fontFamily: "'Roboto', sans-serif" }}>
                View All →
              </button>
            </div>
            {recentEvents.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 flex flex-col items-center" style={{ border: '1px solid #EEF3FB' }}>
                <Megaphone size={32} style={{ color: '#D1D5DB', marginBottom: 12 }} />
                <p className="text-[16px] font-semibold mb-2" style={{ color: '#374151', fontFamily: "'Roboto', sans-serif" }}>No events yet</p>
                <p className="text-[14px]" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>Create your first event to get started.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentEvents.map((event: any) => (
                  <EventRow key={event.id} event={event} onClick={() => navigate(event.status === 'live' ? `/events/${event.id}/live` : `/events/${event.id}`)} />
                ))}
              </div>
            )}
          </div>

          {/* Right panel (1/3) */}
          <div className="flex flex-col gap-5">
            {/* Launch card */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm" style={{ border: '1px solid #EEF3FB' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto" style={{ backgroundColor: '#1A6EB5' }}>
                <Megaphone size={22} color="white" />
              </div>
              <h3 className="text-[16px] font-bold mb-2" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
                Launch a movement
              </h3>
              <p className="text-[13px] mb-4 leading-relaxed" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
                Rally supporters around a cause that matters to you.
              </p>
              <button
                onClick={() => navigate('/events/create')}
                className="w-full py-3 rounded-full text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#F59E0B', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em' }}
              >
                <Plus size={14} /> CREATE EVENT
              </button>
            </div>

            {/* Recognition card */}
            {(recognition || profile?.recognition_tier) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EEF3FB' }}>
                <p className="text-[11px] font-bold mb-3" style={{ color: '#9CA3AF', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.08em' }}>
                  RECOGNITION
                </p>
                <p className="text-[26px] font-bold mb-1" style={{ color: '#1A6EB5', fontFamily: "'Roboto', sans-serif" }}>
                  {recognition?.tier ?? profile?.recognition_tier ?? 'Spark'}
                </p>
                <p className="text-[13px]" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
                  {recognition?.total_points ?? 0} points earned
                </p>
                {recognition?.next_tier && (
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] mb-1.5" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
                      <span>Next: {recognition.next_tier}</span>
                      <span>{recognition.points_to_next_tier} pts</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#EEF3FB' }}>
                      <div className="h-full rounded-full" style={{ backgroundColor: '#1A6EB5', width: '35%' }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
