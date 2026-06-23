import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft } from 'lucide-react'
import { submitOrgDetailsThunk } from '../../store/npSlice'
import type { AppDispatch, RootState } from '../../store'

const schema = z.object({
  ein: z.string().regex(/^\d{2}-\d{7}$/, 'EIN format: XX-XXXXXXX'),
  legal_name: z.string().min(2, 'Legal name required'),
  registered_address: z.string().min(5, 'Address required'),
  official_contact_email: z.string().email('Valid email required'),
  website: z.string().url('Valid URL required').optional().or(z.literal('')),
  np_type: z.enum(['standard', 'church', 'religious_org']).default('standard'),
})
type FormData = z.infer<typeof schema>

function formatEIN(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}-${digits.slice(2)}`
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1
          const isActive = step === current
          const isDone = step < current
          return (
            <div
              key={step}
              style={{
                width: isActive ? 28 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: (isActive || isDone) ? '#1A6EB5' : '#D1D5DB',
                transition: 'width 0.2s',
              }}
            />
          )
        })}
      </div>
      <span className="text-[11px] font-semibold tracking-widest" style={{ color: '#9CA3AF', fontFamily: "'Oswald', sans-serif" }}>
        STEP {current} OF {total}
      </span>
    </div>
  )
}

function Field({ label, error, optional, children }: {
  label: string; error?: string; optional?: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium" style={{ color: '#374151', fontFamily: "'Roboto', sans-serif" }}>
          {label}
        </label>
        {optional && (
          <span className="text-[11px]" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
            Optional
          </span>
        )}
      </div>
      {children}
      {error && <p className="text-[11px]" style={{ color: '#EF4444', fontFamily: "'Roboto', sans-serif" }}>{error}</p>}
    </div>
  )
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: `1px solid ${hasError ? '#EF4444' : '#E5E7EB'}`,
  backgroundColor: '#FFFFFF',
  fontSize: 14,
  color: '#111827',
  fontFamily: "'Roboto', sans-serif",
  outline: 'none',
})

export default function OrganizationDetails() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((s: RootState) => s.np)
  const [showChurchModal, setShowChurchModal] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { np_type: 'standard' },
  })

  const onSubmit = async (data: FormData) => {
    const result = await dispatch(submitOrgDetailsThunk({
      ein: data.ein,
      legal_name: data.legal_name,
      registered_address: data.registered_address,
      official_contact_email: data.official_contact_email,
      website: data.website || undefined,
      np_type: data.np_type,
    }))
    if ((result as any).meta?.requestStatus === 'fulfilled') {
      navigate('/np/verification')
    }
  }

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ backgroundColor: '#F0F4FA' }}>
      {/* Header */}
      <header className="flex items-center px-4 py-3 bg-white sticky top-0 z-10"
        style={{ borderBottom: '1px solid #EEF3FB' }}>
        <button onClick={() => navigate(-1)} className="p-1 mr-auto">
          <ArrowLeft size={20} style={{ color: '#1A6EB5' }} />
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 text-[17px] font-bold"
          style={{ color: '#1A6EB5', fontFamily: "'Roboto', sans-serif" }}>
          Charity Hub
        </span>
      </header>

      {/* Step progress */}
      <StepDots current={2} total={4} />

      {/* Content */}
      <div className="flex-1 px-5 max-w-[390px] mx-auto w-full lg:max-w-[520px]">
        <h1 className="text-[22px] font-bold mb-1.5" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
          Organization Details
        </h1>
        <p className="text-[13px] mb-5 leading-relaxed" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
          Please provide your organization's legal information to proceed with verification.
        </p>

        {/* White card */}
        <div className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <form id="org-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* EIN */}
            <Field label="EIN (Employer Identification Number)" error={errors.ein?.message}>
              <input
                value={watch('ein') ?? ''}
                onChange={e => setValue('ein', formatEIN(e.target.value), { shouldValidate: true })}
                placeholder="XX-XXXXXXX"
                style={inputStyle(!!errors.ein)}
              />
            </Field>

            {/* Legal Name */}
            <Field label="Legal Organization Name" error={errors.legal_name?.message}>
              <input
                {...register('legal_name')}
                placeholder="e.g. Global Giving Foundation"
                style={inputStyle(!!errors.legal_name)}
              />
            </Field>

            {/* Address */}
            <Field label="Registered Address" error={errors.registered_address?.message}>
              <input
                {...register('registered_address')}
                placeholder="123 Charity Lane, Suite 100"
                style={inputStyle(!!errors.registered_address)}
              />
            </Field>

            {/* Contact Email */}
            <Field label="Official Contact Email" error={errors.official_contact_email?.message}>
              <input
                {...register('official_contact_email')}
                type="email"
                placeholder="contact@organization.org"
                style={inputStyle(!!errors.official_contact_email)}
              />
            </Field>

            {/* Website (optional) */}
            <Field label="Website" error={errors.website?.message} optional>
              <input
                {...register('website')}
                type="url"
                placeholder="https://www.organization.org"
                style={inputStyle(!!errors.website)}
              />
            </Field>
          </form>

          {error && (
            <div className="px-4 py-3 rounded-xl text-[13px]"
              style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontFamily: "'Roboto', sans-serif" }}>
              {error}
            </div>
          )}
        </div>

        {/* Church alternative link */}
        <button
          onClick={() => setShowChurchModal(true)}
          className="w-full mt-4 text-[13px] text-center"
          style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
          Church or religious organization?{' '}
          <span style={{ color: '#1A6EB5', textDecoration: 'underline' }}>Use alternative verification</span>
        </button>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-transparent">
        <div className="max-w-[390px] mx-auto lg:max-w-[520px]">
          <button
            type="submit"
            form="org-form"
            disabled={loading}
            className="w-full py-4 rounded-full text-white text-[14px] font-bold tracking-widest disabled:opacity-60"
            style={{ backgroundColor: '#F59E0B', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em' }}
          >
            {loading ? 'SUBMITTING...' : 'SUBMIT FOR VERIFICATION'}
          </button>
        </div>
      </div>

      {/* Church modal */}
      {showChurchModal && (
        <div className="fixed inset-0 flex items-end justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-[390px] bg-white rounded-t-3xl p-6 pb-10">
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: '#D1D5DB' }} />
            <h2 className="text-[20px] font-bold mb-3" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
              Church & Religious Organizations
            </h2>
            <p className="text-[14px] leading-relaxed mb-6" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
              Churches and religious organizations are exempt from standard EIN verification. We'll use your official religious affiliation documentation instead.
            </p>
            <button
              onClick={() => { setValue('np_type', 'church'); setShowChurchModal(false) }}
              className="w-full py-4 rounded-full text-white text-[14px] font-bold mb-3"
              style={{ backgroundColor: '#1A6EB5', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.08em' }}
            >
              CONTINUE AS CHURCH / RELIGIOUS ORG
            </button>
            <button
              onClick={() => setShowChurchModal(false)}
              className="w-full py-3 text-[14px]"
              style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
