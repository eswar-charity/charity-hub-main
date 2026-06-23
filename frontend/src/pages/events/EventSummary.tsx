import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventService } from '../../services/event.service'
import { Loader } from '../../components/common/Loader'
import { Users, Clock, Heart, Package } from 'lucide-react'
import type { Event } from '../../types/event.types'

const SAMPLE_STATS = [
  { icon: Users, value: 124, label: 'Volunteers', color: '#1A6EB5' },
  { icon: Package, value: 450, label: 'Bags Collected', color: '#F59E0B' },
  { icon: Clock, value: 372, label: 'Hours Logged', color: '#F59E0B' },
  { icon: Heart, value: '1.2k', label: 'Supporters', color: '#EF4444' },
]

export default function EventSummary() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(!!id)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    eventService.getEvent(id).then(r => setEvent(r.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-16"><Loader /></div>

  const title = event?.title ?? 'Coastal Cleanup Drive'
  const heroUrl = event?.heroImageUrl

  return (
    <div className="flex flex-col pb-8" style={{ backgroundColor: '#F0F4FA', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="relative w-full h-52">
        {heroUrl
          ? <img src={heroUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #1A6EB5, #0D4A8A)' }} />
        }
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-[12px] font-bold"
          style={{ backgroundColor: '#16A34A', fontFamily: "'Oswald', sans-serif" }}>
          <span>✓</span> Completed
        </div>
        <div className="absolute bottom-3 left-4">
          <h1 className="text-white text-[20px] font-bold leading-snug" style={{ fontFamily: "'Roboto', sans-serif" }}>
            {title}
          </h1>
          <p className="text-white/80 text-[13px] flex items-center gap-1 mt-0.5">
            📅 October 14, 2023
          </p>
        </div>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-5">
        {/* Impact Summary */}
        <div>
          <h2 className="text-[18px] font-bold mb-4" style={{ fontFamily: "'Roboto', sans-serif", color: '#1A6EB5' }}>
            Impact Summary
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {SAMPLE_STATS.map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="bg-white rounded-2xl p-4 flex flex-col items-center shadow-sm">
                <Icon size={22} style={{ color }} className="mb-2" />
                <p className="text-[24px] font-bold" style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
                  {value}
                </p>
                <p className="text-[12px]" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Badge earned */}
        <div className="bg-white rounded-2xl p-6 flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
            style={{ backgroundColor: '#FEF3C7' }}>
            <span className="text-3xl">🏆</span>
          </div>
          <p className="text-[16px] font-bold mb-0.5" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
            Eco-Warrior Elite
          </p>
          <p className="text-[13px]" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
            Badge Earned!
          </p>
        </div>

        {/* Partner quote */}
        <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #1A6EB5, #0D4A8A)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/30">
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>O</div>
            </div>
            <p className="text-white font-semibold text-[15px]" style={{ fontFamily: "'Roboto', sans-serif" }}>
              Ocean Conservancy
            </p>
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: "'Roboto', sans-serif" }}>
            "Your community's effort today removed a record amount of plastics from the shoreline. We are incredibly grateful for your momentum and dedication to a cleaner earth!"
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/events/create')}
          className="w-full py-4 rounded-full text-white text-[14px] font-bold flex items-center justify-center gap-2"
          style={{ backgroundColor: '#F59E0B', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em' }}
        >
          PLAN YOUR NEXT EVENT →
        </button>
      </div>
    </div>
  )
}
