import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Clock, Home, CalendarDays, ClipboardCheck, Activity, MoreHorizontal } from 'lucide-react'
import { npService } from '../../services/nonprofit.service'

interface Approval {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  review_note?: string
  events: { title: string; hero_image_url?: string } | null
}

const TAB_ITEMS = [
  { icon: Home,           label: 'Home',      path: '/np/launchpad' },
  { icon: CalendarDays,   label: 'Events',    path: '/np/events' },
  { icon: ClipboardCheck, label: 'Approvals', path: '/np/approvals' },
  { icon: Activity,       label: 'Activity',  path: '/np/activity' },
  { icon: MoreHorizontal, label: 'More',      path: '/np/more' },
]

const FILTER_TABS = ['pending', 'approved', 'rejected'] as const
type FilterTab = typeof FILTER_TABS[number]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function NPApprovals() {
  const navigate = useNavigate()
  const location = useLocation()
  const [filter, setFilter] = useState<FilterTab>('pending')
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = (status: FilterTab) => {
    setLoading(true)
    npService.getApprovals(status)
      .then(res => setApprovals((res.data as any).approvals ?? []))
      .catch(() => setApprovals([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(filter) }, [filter])

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    setError(null)
    try {
      await npService.approveEvent(id)
      setApprovals(prev => prev.filter(a => a.id !== id))
    } catch (e: any) {
      setError(e.response?.data?.detail ?? 'Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    setActionLoading(rejectTarget)
    setError(null)
    try {
      await npService.rejectEvent(rejectTarget, rejectReason)
      setApprovals(prev => prev.filter(a => a.id !== rejectTarget))
      setRejectTarget(null)
      setRejectReason('')
    } catch (e: any) {
      setError(e.response?.data?.detail ?? 'Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F4FA' }}>
      {/* Header */}
      <header className="bg-white px-5 py-4 sticky top-0 z-10" style={{ borderBottom: '1px solid #EEF3FB' }}>
        <div className="max-w-[390px] mx-auto lg:max-w-none flex items-center gap-3">
          <button onClick={() => navigate('/np/launchpad')} className="p-1">
            <ArrowLeft size={20} style={{ color: '#414750' }} />
          </button>
          <h1 className="text-[17px] font-bold" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
            Event Approvals
          </h1>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="bg-white sticky top-[61px] z-10" style={{ borderBottom: '1px solid #EEF3FB' }}>
        <div className="max-w-[390px] mx-auto lg:max-w-none flex">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="flex-1 py-3 text-[13px] font-semibold capitalize"
              style={{
                fontFamily: "'Roboto', sans-serif",
                color: filter === tab ? '#1A6EB5' : '#9CA3AF',
                borderBottom: filter === tab ? '2px solid #1A6EB5' : '2px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-24 overflow-y-auto">
        <div className="max-w-[390px] mx-auto lg:max-w-[680px] px-4 py-4 flex flex-col gap-3">

          {error && (
            <div className="px-4 py-3 rounded-xl text-[13px]"
              style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontFamily: "'Roboto', sans-serif" }}>
              {error}
            </div>
          )}

          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ backgroundColor: '#EEF3FB' }} />
            ))
          ) : approvals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EEF3FB' }}>
                <ClipboardCheck size={24} style={{ color: '#9CA3AF' }} />
              </div>
              <p className="text-[15px] font-semibold" style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
                No {filter} approvals
              </p>
              <p className="text-[13px] text-center" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
                {filter === 'pending'
                  ? 'New event submissions will appear here'
                  : `${filter.charAt(0).toUpperCase() + filter.slice(1)} events will appear here`}
              </p>
            </div>
          ) : (
            approvals.map(approval => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                filter={filter}
                actionLoading={actionLoading === approval.id}
                onApprove={() => handleApprove(approval.id)}
                onReject={() => { setRejectTarget(approval.id); setRejectReason('') }}
              />
            ))
          )}
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white z-20"
        style={{ borderTop: '1px solid #EEF3FB', boxShadow: '0 -2px 12px rgba(0,0,0,0.05)' }}>
        <div className="max-w-[390px] mx-auto lg:max-w-none flex items-center">
          {TAB_ITEMS.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path
            return (
              <button key={path} onClick={() => navigate(path)}
                className="flex-1 flex flex-col items-center gap-1 py-3">
                <Icon size={20} style={{ color: active ? '#1A6EB5' : '#9CA3AF' }} />
                <span className="text-[10px] font-semibold"
                  style={{ color: active ? '#1A6EB5' : '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setRejectTarget(null) }}>
          <div className="w-full max-w-[480px] bg-white rounded-t-3xl p-6 pb-10 flex flex-col gap-4">
            <h3 className="text-[17px] font-bold" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
              Reject event
            </h3>
            <p className="text-[13px]" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
              Provide a reason so the SE can revise and resubmit.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Please clarify the fundraising breakdown..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-[#1A6EB5]"
              style={{ backgroundColor: '#EEF3FB', fontFamily: "'Roboto', sans-serif", color: '#111827', border: '1.5px solid transparent' }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 py-3.5 rounded-full text-[14px] font-semibold"
                style={{ backgroundColor: '#EEF3FB', color: '#414750', fontFamily: "'Roboto', sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === rejectTarget}
                className="flex-1 py-3.5 rounded-full text-white text-[14px] font-bold disabled:opacity-50"
                style={{ backgroundColor: '#DC2626', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em' }}
              >
                {actionLoading === rejectTarget ? 'REJECTING...' : 'REJECT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ApprovalCard({ approval, filter, actionLoading, onApprove, onReject }: {
  approval: Approval
  filter: FilterTab
  actionLoading: boolean
  onApprove: () => void
  onReject: () => void
}) {
  const eventTitle = approval.events?.title ?? 'Untitled Event'
  const heroUrl = approval.events?.hero_image_url

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #EEF3FB' }}>
      <div className="flex items-center gap-3 p-4">
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: '#EEF3FB' }}>
          {heroUrl
            ? <img src={heroUrl} alt="" className="w-full h-full object-cover" />
            : <CalendarDays size={20} style={{ color: '#9CA3AF' }} />
          }
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold truncate" style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
            {eventTitle}
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
            Submitted {formatDate(approval.submitted_at)}
          </p>
          {filter !== 'pending' && (
            <div className="flex items-center gap-1.5 mt-1">
              {filter === 'approved'
                ? <CheckCircle size={12} style={{ color: '#16A34A' }} />
                : <XCircle size={12} style={{ color: '#DC2626' }} />
              }
              <span className="text-[11px] font-bold capitalize"
                style={{ color: filter === 'approved' ? '#16A34A' : '#DC2626', fontFamily: "'Oswald', sans-serif" }}>
                {filter}
              </span>
            </div>
          )}
          {filter === 'rejected' && approval.review_note && (
            <p className="text-[12px] mt-1 italic" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
              "{approval.review_note}"
            </p>
          )}
        </div>
        {/* Pending: show clock badge */}
        {filter === 'pending' && (
          <div className="flex-shrink-0">
            <Clock size={14} style={{ color: '#F59E0B' }} />
          </div>
        )}
      </div>

      {/* Action buttons — only for pending */}
      {filter === 'pending' && (
        <div className="flex border-t" style={{ borderColor: '#EEF3FB' }}>
          <button
            onClick={onReject}
            disabled={actionLoading}
            className="flex-1 py-3 text-[13px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
            style={{ color: '#DC2626', fontFamily: "'Roboto', sans-serif", borderRight: '1px solid #EEF3FB' }}
          >
            <XCircle size={14} />
            Reject
          </button>
          <button
            onClick={onApprove}
            disabled={actionLoading}
            className="flex-1 py-3 text-[13px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-40"
            style={{ color: '#16A34A', fontFamily: "'Roboto', sans-serif" }}
          >
            {actionLoading
              ? <div className="w-4 h-4 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
              : <><CheckCircle size={14} />Approve</>
            }
          </button>
        </div>
      )}
    </div>
  )
}
