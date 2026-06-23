import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, CheckCircle, Circle, Loader } from 'lucide-react'
import { fetchVerificationStatusThunk } from '../../store/npSlice'
import { npService } from '../../services/nonprofit.service'
import type { AppDispatch, RootState } from '../../store'
import type { VerificationStage } from '../../types/nonprofit.types'

function StageDot({ status }: { status: VerificationStage['status'] }) {
  if (status === 'complete') {
    return (
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#1A6EB5' }}>
        <CheckCircle size={14} color="white" strokeWidth={2.5} />
      </div>
    )
  }
  if (status === 'active') {
    return (
      <div className="relative w-6 h-6 flex-shrink-0">
        <div className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ backgroundColor: '#F59E0B' }} />
        <div className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#F59E0B' }}>
          <Loader size={12} color="white" className="animate-spin" />
        </div>
      </div>
    )
  }
  return (
    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
      style={{ borderColor: '#D1D5DB', backgroundColor: 'white' }}>
      <Circle size={10} style={{ color: '#D1D5DB' }} />
    </div>
  )
}

const FALLBACK_STAGES: VerificationStage[] = [
  { key: 'submitted',       label: 'Submitted',       description: 'Application received successfully',                          status: 'complete' },
  { key: 'verifying',       label: 'Verifying',       description: 'Checking ProPublica & IRS records. Usually takes 2–4 hours.', status: 'active'   },
  { key: 'verified',        label: 'Verified',        description: 'EIN confirmed with IRS records',                             status: 'pending'  },
  { key: 'settlement_setup',label: 'Settlement Setup','description': 'Connect your bank account to receive donations',            status: 'pending'  },
  { key: 'active',          label: 'Active',          description: 'Your organization is live on Charity Hub',                   status: 'pending'  },
]

export default function VerificationStatus() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const { verificationStages, nonprofit } = useSelector((s: RootState) => s.np)
  const stages = verificationStages.length > 0 ? verificationStages : FALLBACK_STAGES
  const currentStatus = nonprofit?.verificationStatus ?? 'verifying'
  const [stripeLoading, setStripeLoading] = useState(false)
  const [stripeError, setStripeError] = useState<string | null>(null)

  const poll = useCallback(() => {
    dispatch(fetchVerificationStatusThunk())
  }, [dispatch])

  useEffect(() => {
    poll()
    const terminal = ['active', 'rejected', 'settlement_setup', 'manual_review']
    if (terminal.includes(currentStatus)) return
    const id = setInterval(poll, 10000)
    return () => clearInterval(id)
  }, [poll, currentStatus])

  // Re-poll immediately when Stripe redirects back with ?stripe=complete
  useEffect(() => {
    if (location.search.includes('stripe=complete')) poll()
  }, [location.search, poll])

  const handleStripeConnect = async () => {
    setStripeLoading(true)
    setStripeError(null)
    try {
      const res = await npService.setupStripeConnect()
      window.location.href = res.data.onboarding_url
    } catch (err: any) {
      setStripeError(err?.response?.data?.detail ?? 'Failed to start Stripe onboarding')
      setStripeLoading(false)
    }
  }

  const renderInfoBox = () => {
    if (currentStatus === 'manual_review') {
      return (
        <div className="px-4 py-4 rounded-xl mb-8 flex items-start gap-3"
          style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
          <span className="text-lg mt-0.5">🔍</span>
          <div>
            <p className="text-[13px] font-semibold mb-1" style={{ color: '#1E40AF', fontFamily: "'Roboto', sans-serif" }}>
              Manual Review in Progress
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: '#1E40AF', fontFamily: "'Roboto', sans-serif" }}>
              Our team is reviewing your application. This usually takes 1–2 business days.
              We'll email you once complete.
            </p>
          </div>
        </div>
      )
    }
    if (currentStatus === 'verifying' || currentStatus === 'submitted') {
      return (
        <div className="px-4 py-4 rounded-xl mb-8 flex items-start gap-3"
          style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
          <span className="text-lg mt-0.5">⏱</span>
          <div>
            <p className="text-[13px] font-semibold mb-1" style={{ color: '#92400E', fontFamily: "'Roboto', sans-serif" }}>
              EIN Verification in Progress
            </p>
            <p className="text-[13px]" style={{ color: '#92400E', fontFamily: "'Roboto', sans-serif" }}>
              We're checking your EIN against ProPublica & IRS records. Usually takes 2–4 hours.
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F4FA' }}>
      <header className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-10"
        style={{ borderBottom: '1px solid #EEF3FB' }}>
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={20} style={{ color: '#1A6EB5' }} />
        </button>
        <span style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 13, color: '#005592', letterSpacing: '0.1em' }}>
          CHARITY HUB
        </span>
        <div className="w-8" />
      </header>

      <div className="flex-1 px-5 py-8 max-w-[390px] mx-auto w-full lg:max-w-[520px]">
        <h1 className="text-[24px] font-bold mb-2" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
          Verification Status
        </h1>
        <p className="text-[14px] mb-6 leading-relaxed" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
          We're reviewing your organization details.
        </p>

        {renderInfoBox()}

        {/* Stage timeline */}
        <div className="flex flex-col gap-0">
          {stages.map((stage, i) => (
            <div key={stage.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <StageDot status={stage.status} />
                {i < stages.length - 1 && (
                  <div className="w-0.5 flex-1 my-1 min-h-[32px]"
                    style={{ backgroundColor: stage.status === 'complete' ? '#1A6EB5' : '#E5E7EB' }} />
                )}
              </div>
              <div className={`pb-7 ${i === stages.length - 1 ? 'pb-0' : ''}`}>
                <p className="text-[15px] font-semibold leading-snug"
                  style={{ fontFamily: "'Roboto', sans-serif", color: stage.status === 'pending' ? '#9CA3AF' : '#111827' }}>
                  {stage.label}
                </p>
                {stage.description && stage.status !== 'pending' && (
                  <p className="text-[13px] mt-1 leading-relaxed"
                    style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
                    {stage.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* settlement_setup → Stripe Connect */}
        {currentStatus === 'settlement_setup' && (
          <div className="mt-8 p-5 rounded-2xl" style={{ backgroundColor: 'white', border: '1px solid #EEF3FB' }}>
            <p className="text-[15px] font-semibold mb-1" style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
              Connect your bank account
            </p>
            <p className="text-[13px] mb-4" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
              Set up Stripe Express to receive donations and payouts. Takes about 5 minutes.
            </p>
            {stripeError && (
              <p className="text-[12px] mb-3" style={{ color: '#EF4444', fontFamily: "'Roboto', sans-serif" }}>
                {stripeError}
              </p>
            )}
            <button
              onClick={handleStripeConnect}
              disabled={stripeLoading}
              className="w-full py-3.5 rounded-full text-white text-[14px] font-bold disabled:opacity-60"
              style={{ backgroundColor: '#F59E0B', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.08em' }}
            >
              {stripeLoading ? 'REDIRECTING...' : 'CONNECT BANK ACCOUNT →'}
            </button>
          </div>
        )}

        {/* active → launchpad */}
        {currentStatus === 'active' && (
          <button
            onClick={() => navigate('/np/launchpad')}
            className="w-full mt-8 py-4 rounded-full text-white text-[14px] font-bold"
            style={{ backgroundColor: '#1A6EB5', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.08em' }}
          >
            GO TO LAUNCHPAD →
          </button>
        )}

        {/* rejected state */}
        {currentStatus === 'rejected' && (
          <div className="mt-8 p-5 rounded-2xl" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }}>
            <p className="text-[14px] font-semibold mb-1" style={{ color: '#DC2626', fontFamily: "'Roboto', sans-serif" }}>
              Verification Failed
            </p>
            <p className="text-[13px] mb-4" style={{ color: '#991B1B', fontFamily: "'Roboto', sans-serif" }}>
              Your application did not meet our verification requirements. Please contact support or resubmit with correct information.
            </p>
            <button
              onClick={() => navigate('/np/org-details')}
              className="w-full py-3 rounded-full text-white text-[13px] font-bold"
              style={{ backgroundColor: '#DC2626', fontFamily: "'Oswald', sans-serif" }}
            >
              RESUBMIT APPLICATION
            </button>
          </div>
        )}

        <p className="text-center text-[13px] mt-10" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
          Questions?{' '}
          <button style={{ color: '#1A6EB5' }}>Contact support</button>
        </p>
      </div>
    </div>
  )
}
