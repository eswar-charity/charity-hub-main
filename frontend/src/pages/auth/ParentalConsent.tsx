import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Mail, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Input } from '../../components/common/Input'

const STATUS_EXAMPLES = [
  {
    email: 'jane.doe@example.com',
    status: 'Pending',
    icon: <Clock size={16} style={{ color: '#9CA3AF' }} />,
    statusColor: '#6B7280',
    statusBg: '#F3F4F6',
    border: '',
  },
  {
    email: 'john.smith@example.com',
    status: 'Approved',
    icon: <CheckCircle size={16} style={{ color: '#1A6EB5' }} />,
    statusColor: '#1A6EB5',
    statusBg: '#EBF3FC',
    border: '',
  },
  {
    email: 'robert.jones@example.com',
    status: 'Not Approved',
    icon: <XCircle size={16} style={{ color: '#EF4444' }} />,
    statusColor: '#EF4444',
    statusBg: '#FEE2E2',
    border: '1px solid #FECACA',
    subtext: 'Needs to verify identity first.',
  },
]

export default function ParentalConsent() {
  const navigate = useNavigate()
  const [guardianEmail, setGuardianEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (guardianEmail) setSent(true)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0F4FA' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-white" style={{ borderBottom: '1px solid #EEF3FB' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#1A6EB5' }}>
            <svg width="12" height="12" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="4" fill="white" />
              <circle cx="16" cy="5" r="2.5" fill="white" />
              <circle cx="16" cy="27" r="2.5" fill="white" />
              <circle cx="5" cy="16" r="2.5" fill="white" />
              <circle cx="27" cy="16" r="2.5" fill="white" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 13, color: '#1A6EB5', letterSpacing: '0.1em' }}>
            CHARITY HUB
          </span>
        </div>
        <button onClick={() => navigate('/signup')} className="p-1 rounded-full hover:bg-gray-100">
          <X size={20} style={{ color: '#414750' }} />
        </button>
      </header>

      <div className="flex flex-col items-center px-4 py-8 max-w-[390px] mx-auto">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{ backgroundColor: '#E8F0FB' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="7" r="3" fill="#1A6EB5" />
            <circle cx="15" cy="7" r="2.5" fill="#1A6EB5" opacity="0.7" />
            <path d="M3 19c0-3.314 2.686-6 6-6h2c3.314 0 6 2.686 6 6" stroke="#1A6EB5" strokeWidth="2" strokeLinecap="round" />
            <path d="M15 13c2.761 0 5 2.239 5 5" stroke="#1A6EB5" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          </svg>
        </div>

        <h1 className="text-[22px] font-bold text-center mb-2" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
          Parent/Guardian Consent
        </h1>
        <p className="text-[14px] text-center mb-8 leading-relaxed" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
          Because you're under 18, a parent or guardian needs to approve your account.
        </p>

        <div className="w-full mb-5">
          <Input
            label="Guardian Email"
            type="email"
            placeholder="guardian@example.com"
            icon={<Mail size={16} />}
            value={guardianEmail}
            onChange={e => setGuardianEmail(e.target.value)}
          />
        </div>

        <button
          onClick={handleSend}
          className="w-full py-4 rounded-full text-white text-[14px] font-bold flex items-center justify-center gap-2 mb-8"
          style={{ backgroundColor: '#F59E0B', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.08em' }}
        >
          {sent ? 'INVITATION SENT ✓' : <>SEND INVITATION <span>▶</span></>}
        </button>

        <div className="w-full">
          <div className="border-t mb-5" style={{ borderColor: '#E5E7EB' }} />
          <p className="text-[13px] font-medium mb-3" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
            Status Examples:
          </p>
          <div className="flex flex-col gap-2">
            {STATUS_EXAMPLES.map(({ email, status, icon, statusColor, statusBg, border, subtext }) => (
              <div key={email} className="rounded-xl px-4 py-3 bg-white"
                style={{ border: border || '1px solid transparent' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-[13px]" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>{email}</span>
                  </div>
                  <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ color: statusColor, backgroundColor: statusBg }}>
                    {status}
                  </span>
                </div>
                {subtext && (
                  <p className="text-[12px] mt-1.5 pl-6" style={{ color: '#EF4444', fontFamily: "'Roboto', sans-serif" }}>
                    {subtext}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
