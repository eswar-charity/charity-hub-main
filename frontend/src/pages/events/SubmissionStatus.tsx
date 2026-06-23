import { useNavigate } from 'react-router-dom'
import { CheckCircle, Clock, ExternalLink } from 'lucide-react'

const PROGRESS_STEPS = [
  { label: 'Submitted', detail: 'Oct 24, 10:00 AM', done: true, active: false },
  { label: 'Nonprofit Review', detail: 'Green Earth Alliance', done: false, active: true },
  { label: 'Approved', detail: '', done: false, active: false },
  { label: 'Live', detail: '', done: false, active: false },
]

const SAMPLE_CAMPAIGNS = [
  {
    status: 'In Review',
    statusColor: '#1A6EB5',
    statusBg: '#EBF3FC',
    borderColor: '#1A6EB5',
    title: 'Clean Water Initiative Fundraiser',
    body: 'Your campaign is currently being reviewed by Green Earth Alliance. This usually takes 1-2 business days.',
    icon: <Clock size={13} style={{ color: '#1A6EB5' }} />,
    action: null,
  },
  {
    status: 'Changes Requested',
    statusColor: '#D97706',
    statusBg: '#FEF3C7',
    borderColor: '#F59E0B',
    title: 'Urban Garden Expansion',
    body: null,
    icon: null,
    comment: {
      avatar: 'G',
      name: 'Green Earth Alliance',
      time: '2h ago',
      text: '"We love the energy here! Could you please update the funding breakdown to be a bit more specific regarding the soil costs?"',
    },
    action: { label: 'REVISE SUBMISSION →', bg: '#F59E0B' },
  },
  {
    status: 'Approved & Live',
    statusColor: '#16A34A',
    statusBg: '#DCFCE7',
    borderColor: '#1A6EB5',
    title: 'Community Tech Drive',
    body: 'Congratulations! Your campaign has been approved and is now live for donations.',
    icon: <CheckCircle size={13} style={{ color: '#16A34A' }} />,
    action: { label: 'VIEW LIVE ↗', bg: '#0D4A8A' },
    emoji: '🎉',
  },
]

export default function SubmissionStatus() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col" style={{ backgroundColor: '#F0F4FA', minHeight: '100vh' }}>
      <div className="px-5 py-5">
        <h1 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
          Campaign Status
        </h1>
        <p className="text-[14px] mb-5" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
          Track the progress of your recent submissions.
        </p>

        {/* Progress tracker */}
        <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
          <p className="text-[15px] font-bold mb-4" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
            Progress
          </p>
          <div className="flex flex-col gap-0">
            {PROGRESS_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.done ? 'bg-[#0D4A8A]' : step.active ? 'border-2 border-[#1A6EB5]' : 'border-2 border-gray-200'
                  }`}>
                    {step.done
                      ? <CheckCircle size={16} color="white" />
                      : step.active
                        ? <div className="w-3 h-3 rounded-full bg-[#1A6EB5]" />
                        : null
                    }
                  </div>
                  {i < PROGRESS_STEPS.length - 1 && (
                    <div className="w-0.5 h-8 mt-1" style={{ backgroundColor: step.done ? '#0D4A8A' : '#E5E7EB' }} />
                  )}
                </div>
                <div className="pt-1 pb-6">
                  <p className="text-[14px] font-semibold" style={{
                    color: step.active ? '#1A6EB5' : step.done ? '#111827' : '#9CA3AF',
                    fontFamily: "'Roboto', sans-serif"
                  }}>
                    {step.label}
                  </p>
                  {step.detail && (
                    <p className="text-[12px] mt-0.5" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign cards */}
        <div className="flex flex-col gap-4">
          {SAMPLE_CAMPAIGNS.map(c => (
            <div key={c.title} className="bg-white rounded-2xl p-5 shadow-sm"
              style={{ borderLeft: `4px solid ${c.borderColor}` }}>
              <div className="flex items-center gap-2 mb-2">
                {c.icon}
                <span className="text-[12px] font-bold px-2.5 py-1 rounded-full"
                  style={{ color: c.statusColor, backgroundColor: c.statusBg, fontFamily: "'Oswald', sans-serif" }}>
                  {c.status}
                </span>
                {c.emoji && <span>{c.emoji}</span>}
              </div>
              <h3 className="text-[16px] font-bold mb-2" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
                {c.title}
              </h3>
              {c.body && (
                <p className="text-[13px] mb-3 leading-relaxed" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
                  {c.body}
                </p>
              )}
              {c.comment && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[12px] font-bold"
                      style={{ backgroundColor: '#1A6EB5' }}>
                      {c.comment.avatar}
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
                      {c.comment.name}
                    </span>
                    <span className="text-[12px]" style={{ color: '#9CA3AF' }}>{c.comment.time}</span>
                  </div>
                  <p className="text-[13px] italic leading-relaxed" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
                    {c.comment.text}
                  </p>
                </div>
              )}
              {c.action && (
                <button
                  className="w-full py-3.5 rounded-full text-white text-[13px] font-bold mt-1 flex items-center justify-center gap-2"
                  style={{ backgroundColor: c.action.bg, fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em' }}
                  onClick={() => navigate('/events/create')}
                >
                  {c.action.label}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
