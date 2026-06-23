import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventService } from '../../services/event.service'
import { useEvents } from '../../hooks/useEvents'
import { Loader } from '../../components/common/Loader'
import { Clock, MapPin, Users } from 'lucide-react'
import type { Event } from '../../types/event.types'

function formatDate(dateStr?: string) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return { month: d.toLocaleString('en', { month: 'short' }).toUpperCase(), day: d.getDate() }
}

export default function EventPreview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const { submitEvent, loading: submitting } = useEvents()

  useEffect(() => {
    if (!id) return
    eventService.getEvent(id).then(r => setEvent(r.data)).finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async () => {
    if (!id) return
    await submitEvent(id)
    navigate('/events/submission-status')
  }

  if (loading) return <div className="flex justify-center py-16"><Loader /></div>
  if (!event) return <div className="text-center py-16 text-gray-400">Event not found</div>

  const date = formatDate(event.eventDate)

  return (
    <div className="min-h-screen lg:flex lg:justify-center" style={{ backgroundColor: '#F0F4FA' }}>
      <div className="flex flex-col min-h-screen lg:min-h-0 lg:w-full lg:max-w-[720px]">
      {/* Preview banner */}
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ backgroundColor: '#F4F8FC', borderBottom: '1px solid #EEF3FB' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#9CA3AF" strokeWidth="2" />
          <circle cx="12" cy="12" r="3" stroke="#9CA3AF" strokeWidth="2" />
        </svg>
        <p className="text-[13px]" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
          Preview — how your event will appear
        </p>
      </div>

      <div className="flex-1 pb-28">
        {/* Hero image */}
        <div className="relative w-full h-52 bg-gray-300">
          {event.heroImageUrl
            ? <img src={event.heroImageUrl} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#1A6EB5' }}>
                <p className="text-white text-[14px] opacity-60">No cover image</p>
              </div>
          }
          {date && (
            <div className="absolute top-4 left-4 rounded-xl px-3 py-2 text-center min-w-[52px]"
              style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
              <p className="text-[10px] font-bold" style={{ color: '#EF4444', fontFamily: "'Oswald', sans-serif" }}>
                {date.month}
              </p>
              <p className="text-[22px] font-bold leading-none" style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
                {date.day}
              </p>
            </div>
          )}
        </div>

        <div className="px-4 py-5">
          {/* Title */}
          <h1 className="text-[22px] font-bold mb-3 leading-snug" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
            {event.title || 'Untitled Event'}
          </h1>

          {/* Host */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-gray-300" />
            <p className="text-[13px]" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
              Hosted by <span className="font-semibold">You</span>
            </p>
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-1.5 text-[13px]" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
              <Clock size={14} style={{ color: '#9CA3AF' }} />
              9:00 AM - 12:00 PM
            </div>
            {event.location && (
              <div className="flex items-center gap-1.5 text-[13px]" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
                <MapPin size={14} style={{ color: '#9CA3AF' }} />
                {event.location}
              </div>
            )}
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-2 mb-6">
            <Users size={14} style={{ color: '#9CA3AF' }} />
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white"
                  style={{ backgroundColor: ['#1A6EB5', '#F59E0B', '#10B981'][i] }} />
              ))}
            </div>
            <span className="text-[13px]" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
              {event.totalParticipants || 0} joined
            </span>
          </div>

          {/* Story */}
          <div>
            <h2 className="text-[17px] font-bold mb-3" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
              The Story
            </h2>
            <p className="text-[14px] leading-relaxed" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
              {event.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-1/2 lg:-translate-x-1/2 lg:max-w-[720px] bg-white flex items-center gap-3 px-4 py-3 z-20"
        style={{ borderTop: '1px solid #EEF3FB', boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}>
        <button
          onClick={() => navigate(-1)}
          className="flex-shrink-0 px-6 py-3.5 rounded-full text-[14px] font-semibold"
          style={{ color: '#414750', backgroundColor: '#EEF3FB', fontFamily: "'Roboto', sans-serif" }}
        >
          Back to edit
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 py-3.5 rounded-full text-white text-[14px] font-bold disabled:opacity-60"
          style={{ backgroundColor: '#F59E0B', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em' }}
        >
          {submitting ? 'SUBMITTING...' : 'SUBMIT FOR APPROVAL'}
        </button>
      </div>
    </div>
  )
}
