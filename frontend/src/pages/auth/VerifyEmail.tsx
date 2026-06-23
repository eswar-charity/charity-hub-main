import { Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const maskedEmail = user?.email
    ? user.email.replace(/^(.{3})(.*)(@.*)$/, (_, a, b, c) => a + b.replace(/./g, '*') + c)
    : 'your email'

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F0F4FA' }}>
      <div className="w-full max-w-[390px]">
        <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-sm">
          {/* Email icon */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: '#E8F0FB' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#1A6EB5' }}>
              <Mail size={26} color="white" />
            </div>
          </div>

          <h1 className="text-[22px] font-bold text-center mb-3" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
            Check your inbox
          </h1>
          <p className="text-[14px] text-center mb-8 leading-relaxed" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
            We've sent a verification link to<br />
            <span style={{ color: '#111827', fontWeight: 500 }}>{maskedEmail}</span>
          </p>

          <button
            onClick={() => window.open('mailto:', '_blank')}
            className="w-full py-4 rounded-full text-white text-[14px] font-bold flex items-center justify-center gap-2 mb-4"
            style={{ backgroundColor: '#0D4A8A', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em' }}
          >
            Open Email App <span className="text-base">↗</span>
          </button>

          <p className="text-[14px]" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
            Didn't receive the email?{' '}
            <button className="font-semibold" style={{ color: '#1A6EB5' }}>Resend</button>
          </p>
        </div>

        <p className="text-center mt-8 text-[13px]" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em' }}>
          CHARITY HUB
        </p>
      </div>
    </div>
  )
}
