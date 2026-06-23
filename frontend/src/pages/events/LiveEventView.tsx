import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreVertical, Share2, Image, Video, Heart, MessageCircle, Home, Compass, Bell, User, Clapperboard } from 'lucide-react'
import { eventService } from '../../services/event.service'
import { Loader } from '../../components/common/Loader'
import type { Event } from '../../types/event.types'

const SAMPLE_POSTS = [
  {
    id: '1',
    author: 'Sarah Jenkins',
    role: 'Organizer',
    time: '2m ago',
    text: 'We just cleared sector A! The energy here is incredible. Thanks to everyone who showed up early. We have extra gloves at the main tent for latecomers! 🌊🌿',
    likes: 124,
    comments: 12,
    hasImage: true,
    avatarColor: '#1A6EB5',
    showMenu: true,
  },
  {
    id: '2',
    author: 'Mike Chen',
    role: '',
    time: '15m ago',
    text: 'Found some interesting glass pieces while cleaning up near the pier. Making good progress!',
    likes: 45,
    comments: 3,
    hasImage: false,
    avatarColor: '#4B5563',
    showMenu: false,
  },
  {
    id: '3',
    author: 'Emma W.',
    role: '',
    time: '18m ago',
    text: "Keep it up! I'm heading over to that side now.",
    likes: 0,
    comments: 0,
    hasImage: false,
    avatarColor: '#9CA3AF',
    showMenu: false,
  },
]

export default function LiveEventView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [postText, setPostText] = useState('')

  useEffect(() => {
    if (!id) return
    eventService.getEvent(id).then(r => setEvent(r.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-16"><Loader /></div>

  const eventTitle = event?.title ?? 'Community Beach Cleanup Drive'
  const eventLocation = event?.location ?? 'Central Beach, CA'

  return (
    <div className="flex flex-col pb-28" style={{ backgroundColor: '#F0F4FA', minHeight: '100vh' }}>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-10"
        style={{ borderBottom: '1px solid #EEF3FB' }}>
        <button onClick={() => navigate(-1)} className="p-1 rounded-full"
          style={{ color: '#414750' }}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#1A6EB5' }}>
            <svg width="10" height="10" viewBox="0 0 24 23" fill="none">
              <path d="M6 23C5.16667 23 4.45833 22.7083 3.875 22.125C3.29167 21.5417 3 20.8333 3 20C3 19.1667 3.29167 18.4583 3.875 17.875C4.45833 17.2917 5.16667 17 6 17C6.23333 17 6.45 17.025 6.65 17.075C6.85 17.125 7.04167 17.1917 7.225 17.275L8.65 15.5C8.18333 14.9833 7.85833 14.4 7.675 13.75C7.49167 13.1 7.45 12.45 7.55 11.8L5.525 11.125C5.24167 11.5417 4.88333 11.875 4.45 12.125C4.01667 12.375 3.53333 12.5 3 12.5C2.16667 12.5 1.45833 12.2083 0.875 11.625C0.291667 11.0417 0 10.3333 0 9.5C0 8.66667 0.291667 7.95833 0.875 7.375C1.45833 6.79167 2.16667 6.5 3 6.5C3.83333 6.5 4.54167 6.79167 5.125 7.375C5.70833 7.95833 6 8.66667 6 9.5C6 9.53333 6 9.56667 6 9.6C6 9.63333 6 9.66667 6 9.7L8.025 10.4C8.35833 9.8 8.80417 9.29167 9.3625 8.875C9.92083 8.45833 10.55 8.19167 11.25 8.075V5.9C10.6 5.71667 10.0625 5.3625 9.6375 4.8375C9.2125 4.3125 9 3.7 9 3C9 2.16667 9.29167 1.45833 9.875 0.875C10.4583 0.291667 11.1667 0 12 0C12.8333 0 13.5417 0.291667 14.125 0.875C14.7083 1.45833 15 2.16667 15 3C15 3.7 14.7833 4.3125 14.35 4.8375C13.9167 5.3625 13.3833 5.71667 12.75 5.9V8.075C13.45 8.19167 14.0792 8.45833 14.6375 8.875C15.1958 9.29167 15.6417 9.8 15.975 10.4L18 9.7C18 9.66667 18 9.63333 18 9.6C18 9.56667 18 9.53333 18 9.5C18 8.66667 18.2917 7.95833 18.875 7.375C19.4583 6.79167 20.1667 6.5 21 6.5C21.8333 6.5 22.5417 6.79167 23.125 7.375C23.7083 7.95833 24 8.66667 24 9.5C24 10.3333 23.7083 11.0417 23.125 11.625C22.5417 12.2083 21.8333 12.5 21 12.5C20.4667 12.5 19.9792 12.375 19.5375 12.125C19.0958 11.875 18.7417 11.5417 18.475 11.125L16.45 11.8C16.55 12.45 16.5083 13.0958 16.325 13.7375C16.1417 14.3792 15.8167 14.9667 15.35 15.5L16.775 17.25C16.9583 17.1667 17.15 17.1042 17.35 17.0625C17.55 17.0208 17.7667 17 18 17C18.8333 17 19.5417 17.2917 20.125 17.875C20.7083 18.4583 21 19.1667 21 20C21 20.8333 20.7083 21.5417 20.125 22.125C19.5417 22.7083 18.8333 23 18 23C17.1667 23 16.4583 22.7083 15.875 22.125C15.2917 21.5417 15 20.8333 15 20C15 19.6667 15.0542 19.3458 15.1625 19.0375C15.2708 18.7292 15.4167 18.45 15.6 18.2L14.175 16.425C13.4917 16.8083 12.7625 17 11.9875 17C11.2125 17 10.4833 16.8083 9.8 16.425L8.4 18.2C8.58333 18.45 8.72917 18.7292 8.8375 19.0375C8.94583 19.3458 9 19.6667 9 20C9 20.8333 8.70833 21.5417 8.125 22.125C7.54167 22.7083 6.83333 23 6 23Z"
                fill="white" />
            </svg>
          </div>
          <span style={{
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: '#1A6EB5',
            letterSpacing: '0.12em',
          }}>
            CHARITY HUB
          </span>
        </div>
        <button className="p-1" style={{ color: '#414750' }}>
          <MoreVertical size={20} />
        </button>
      </header>

      {/* Hero image */}
      <div className="relative w-full" style={{ height: 210 }}>
        {event?.heroImageUrl
          ? <img src={event.heroImageUrl} alt="" className="w-full h-full object-cover" />
          : (
            <div className="w-full h-full" style={{
              background: 'linear-gradient(180deg, #1a2a4a 0%, #2d4a6e 60%, #1a3a5c 100%)',
            }}>
              {/* silhouette audience placeholder */}
              <div className="absolute bottom-0 left-0 right-0 h-20 flex items-end justify-center gap-1 px-6 pb-2 opacity-30">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="rounded-t-full flex-1"
                    style={{ height: `${40 + Math.sin(i * 1.2) * 16}px`, backgroundColor: '#000', maxWidth: 28 }} />
                ))}
              </div>
            </div>
          )
        }
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 100%)' }} />

        {/* LIVE badge */}
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-[11px] font-bold"
            style={{ backgroundColor: '#EF4444', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em' }}>
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE NOW
          </span>
        </div>

        {/* Title + location */}
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-white font-bold leading-snug mb-0.5"
            style={{ fontFamily: "'Roboto', sans-serif", fontSize: 18, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {eventTitle}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: "'Roboto', sans-serif" }}>
            {eventLocation}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="bg-white flex items-center" style={{ borderBottom: '1px solid #EEF3FB' }}>
        {[
          { value: event?.totalParticipants ?? 142, label: 'Joined' },
          { value: '3,204', label: 'Reactions' },
          { value: '89', label: 'Posts' },
        ].map(({ value, label }, i) => (
          <div key={label} className="flex-1 flex flex-col items-center py-3.5"
            style={{ borderRight: i < 2 ? '1px solid #EEF3FB' : 'none' }}>
            <p className="text-[20px] font-bold leading-tight"
              style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
              {value}
            </p>
            <p className="text-[12px] mt-0.5"
              style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Contribution activity row */}
      <div className="bg-white flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid #EEF3FB' }}>
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-2">
            {['#1A6EB5', '#F59E0B', '#10B981'].map((c, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white"
                style={{ backgroundColor: c }} />
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
            Contribution activity · 87 supporters
          </p>
        </div>
        <button className="flex items-center gap-1.5"
          style={{ fontSize: 13, color: '#1A6EB5', fontFamily: "'Roboto', sans-serif", fontWeight: 500 }}>
          <Share2 size={14} />
          Share event
        </button>
      </div>

      {/* Post composer */}
      <div className="bg-white px-4 pt-4 pb-3 mt-2" style={{ borderBottom: '1px solid #EEF3FB' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex-shrink-0"
            style={{ backgroundColor: '#D1D5DB' }} />
          <input
            value={postText}
            onChange={e => setPostText(e.target.value)}
            placeholder="Post a live update..."
            className="flex-1 text-[14px] focus:outline-none"
            style={{ color: '#111827', fontFamily: "'Roboto', sans-serif", backgroundColor: 'transparent' }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center" style={{ color: '#9CA3AF' }}>
              <Image size={22} />
            </button>
            <button className="flex items-center justify-center" style={{ color: '#9CA3AF' }}>
              <Video size={22} />
            </button>
          </div>
          <button
            className="px-6 py-2 rounded-full text-white text-[14px] font-bold"
            style={{ backgroundColor: '#F59E0B', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em' }}
          >
            Post
          </button>
        </div>
      </div>

      {/* Feed posts */}
      <div className="flex flex-col mt-2" style={{ gap: 2 }}>
        {SAMPLE_POSTS.map(post => (
          <div key={post.id} className="bg-white px-4 py-4">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[13px] font-bold"
                style={{ backgroundColor: post.avatarColor }}>
                {post.author[0]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Author row */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[14px] font-bold"
                    style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
                    {post.author}
                  </span>
                  {post.role && (
                    <span className="text-[12px]"
                      style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
                      · {post.role}
                    </span>
                  )}
                  <span className="text-[12px] ml-auto"
                    style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
                    {post.time}
                  </span>
                  {post.showMenu && (
                    <button style={{ color: '#9CA3AF', marginLeft: 4 }}>
                      <MoreVertical size={15} />
                    </button>
                  )}
                </div>

                {/* Text */}
                <p className="text-[14px] leading-relaxed mb-3"
                  style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
                  {post.text}
                </p>

                {/* Image block */}
                {post.hasImage && (
                  <div className="w-full rounded-xl mb-3 overflow-hidden"
                    style={{ height: 160, backgroundColor: '#80CBC4' }}>
                    <div className="w-full h-full"
                      style={{ background: 'linear-gradient(135deg, #4DB6AC 0%, #80CBC4 50%, #B2DFDB 100%)' }} />
                  </div>
                )}

                {/* Actions */}
                {(post.likes > 0 || post.comments > 0) && (
                  <div className="flex items-center gap-4 mt-1">
                    <button className="flex items-center gap-1.5">
                      <Heart size={16} fill="#EF4444" style={{ color: '#EF4444' }} />
                      <span style={{ fontSize: 13, color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
                        {post.likes}
                      </span>
                    </button>
                    <button className="flex items-center gap-1.5">
                      <MessageCircle size={16} style={{ color: '#9CA3AF' }} />
                      <span style={{ fontSize: 13, color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
                        {post.comments}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom navigation — fixed */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white z-20"
        style={{ borderTop: '1px solid #EEF3FB', boxShadow: '0 -2px 16px rgba(0,0,0,0.07)' }}>
        <div className="flex items-center justify-around max-w-[480px] mx-auto px-4 pt-2 pb-4">
          <button className="flex flex-col items-center" style={{ color: '#9CA3AF' }}>
            <Home size={22} />
          </button>
          <button className="flex flex-col items-center" style={{ color: '#9CA3AF' }}>
            <Compass size={22} />
          </button>
          {/* Center amber action button */}
          <button
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            style={{
              backgroundColor: '#F59E0B',
              marginTop: -24,
              boxShadow: '0 4px 20px rgba(245,158,11,0.45)',
            }}
          >
            <Clapperboard size={22} color="white" />
          </button>
          <button className="flex flex-col items-center" style={{ color: '#9CA3AF' }}>
            <Bell size={22} />
          </button>
          <button className="flex flex-col items-center" style={{ color: '#9CA3AF' }}>
            <User size={22} />
          </button>
        </div>
      </nav>
    </div>
  )
}
