import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { npSignupThunk, npLoginThunk } from '../../store/npSlice'
import type { AppDispatch, RootState } from '../../store'

const signupSchema = z.object({
  organization_name: z.string().min(2, 'Organization name required'),
  email: z.string().email('Valid work email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
const loginSchema = z.object({
  email: z.string().email('Valid work email required'),
  password: z.string().min(1, 'Password required'),
})

type SignupData = z.infer<typeof signupSchema>
type LoginData = z.infer<typeof loginSchema>

const ChLogo = () => (
  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#005592' }}>
    <svg width="14" height="14" viewBox="0 0 24 23" fill="none">
      <path d="M6 23C5.16667 23 4.45833 22.7083 3.875 22.125C3.29167 21.5417 3 20.8333 3 20C3 19.1667 3.29167 18.4583 3.875 17.875C4.45833 17.2917 5.16667 17 6 17C6.23333 17 6.45 17.025 6.65 17.075C6.85 17.125 7.04167 17.1917 7.225 17.275L8.65 15.5C8.18333 14.9833 7.85833 14.4 7.675 13.75C7.49167 13.1 7.45 12.45 7.55 11.8L5.525 11.125C5.24167 11.5417 4.88333 11.875 4.45 12.125C4.01667 12.375 3.53333 12.5 3 12.5C2.16667 12.5 1.45833 12.2083 0.875 11.625C0.291667 11.0417 0 10.3333 0 9.5C0 8.66667 0.291667 7.95833 0.875 7.375C1.45833 6.79167 2.16667 6.5 3 6.5C3.83333 6.5 4.54167 6.79167 5.125 7.375C5.70833 7.95833 6 8.66667 6 9.5C6 9.53333 6 9.56667 6 9.6C6 9.63333 6 9.66667 6 9.7L8.025 10.4C8.35833 9.8 8.80417 9.29167 9.3625 8.875C9.92083 8.45833 10.55 8.19167 11.25 8.075V5.9C10.6 5.71667 10.0625 5.3625 9.6375 4.8375C9.2125 4.3125 9 3.7 9 3C9 2.16667 9.29167 1.45833 9.875 0.875C10.4583 0.291667 11.1667 0 12 0C12.8333 0 13.5417 0.291667 14.125 0.875C14.7083 1.45833 15 2.16667 15 3C15 3.7 14.7833 4.3125 14.35 4.8375C13.9167 5.3625 13.3833 5.71667 12.75 5.9V8.075C13.45 8.19167 14.0792 8.45833 14.6375 8.875C15.1958 9.29167 15.6417 9.8 15.975 10.4L18 9.7C18 9.66667 18 9.63333 18 9.6C18 9.56667 18 9.53333 18 9.5C18 8.66667 18.2917 7.95833 18.875 7.375C19.4583 6.79167 20.1667 6.5 21 6.5C21.8333 6.5 22.5417 6.79167 23.125 7.375C23.7083 7.95833 24 8.66667 24 9.5C24 10.3333 23.7083 11.0417 23.125 11.625C22.5417 12.2083 21.8333 12.5 21 12.5C20.4667 12.5 19.9792 12.375 19.5375 12.125C19.0958 11.875 18.7417 11.5417 18.475 11.125L16.45 11.8C16.55 12.45 16.5083 13.0958 16.325 13.7375C16.1417 14.3792 15.8167 14.9667 15.35 15.5L16.775 17.25C16.9583 17.1667 17.15 17.1042 17.35 17.0625C17.55 17.0208 17.7667 17 18 17C18.8333 17 19.5417 17.2917 20.125 17.875C20.7083 18.4583 21 19.1667 21 20C21 20.8333 20.7083 21.5417 20.125 22.125C19.5417 22.7083 18.8333 23 18 23C17.1667 23 16.4583 22.7083 15.875 22.125C15.2917 21.5417 15 20.8333 15 20C15 19.6667 15.0542 19.3458 15.1625 19.0375C15.2708 18.7292 15.4167 18.45 15.6 18.2L14.175 16.425C13.4917 16.8083 12.7625 17 11.9875 17C11.2125 17 10.4833 16.8083 9.8 16.425L8.4 18.2C8.58333 18.45 8.72917 18.7292 8.8375 19.0375C8.94583 19.3458 9 19.6667 9 20C9 20.8333 8.70833 21.5417 8.125 22.125C7.54167 22.7083 6.83333 23 6 23Z" fill="white"/>
    </svg>
  </div>
)

function SignupForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((s: RootState) => s.np)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SignupData>({
    resolver: zodResolver(signupSchema) as any,
  })

  const onSubmit = async (data: SignupData) => {
    const result = await dispatch(npSignupThunk({
      org: data.organization_name,
      email: data.email,
      password: data.password,
    }))
    if ((result as any).meta?.requestStatus === 'fulfilled') {
      navigate('/np/org-details')
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F4FA' }}>
      <header className="flex items-center justify-between px-5 py-4 bg-white"
        style={{ borderBottom: '1px solid #EEF3FB' }}>
        <div className="flex items-center gap-2">
          <ChLogo />
          <span style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 13, color: '#005592', letterSpacing: '0.1em' }}>
            CHARITY HUB
          </span>
        </div>
        <Link to="/np/login" style={{ color: '#1A6EB5', fontFamily: "'Roboto', sans-serif", fontSize: 14 }}>
          Sign In
        </Link>
      </header>

      <div className="flex-1 px-5 py-8 max-w-[390px] mx-auto w-full lg:max-w-[440px]">
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{ backgroundColor: '#EBF3FC' }}>
            <Building2 size={26} style={{ color: '#1A6EB5' }} />
          </div>
          <h1 className="text-[28px] font-bold leading-tight mb-2"
            style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
            Register your nonprofit
          </h1>
          <p className="text-[15px] leading-relaxed" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
            Verification keeps every donor protected.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
              Organization Name
            </label>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
              style={{ backgroundColor: '#EEF3FB', border: `1px solid ${errors.organization_name ? '#EF4444' : 'transparent'}` }}>
              <Building2 size={16} style={{ color: '#9CA3AF', flexShrink: 0 }} />
              <input
                {...register('organization_name')}
                placeholder="e.g. Global Giving Foundation"
                className="flex-1 bg-transparent text-[14px] focus:outline-none"
                style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}
              />
            </div>
            {errors.organization_name && (
              <p className="text-[12px]" style={{ color: '#EF4444' }}>{errors.organization_name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
              Work Email
            </label>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
              style={{ backgroundColor: '#EEF3FB', border: `1px solid ${errors.email ? '#EF4444' : 'transparent'}` }}>
              <Mail size={16} style={{ color: '#9CA3AF', flexShrink: 0 }} />
              <input
                {...register('email')}
                type="email"
                placeholder="contact@organization.org"
                className="flex-1 bg-transparent text-[14px] focus:outline-none"
                style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}
              />
            </div>
            {errors.email && (
              <p className="text-[12px]" style={{ color: '#EF4444' }}>{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
              Create Password
            </label>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
              style={{ backgroundColor: '#EEF3FB', border: `1px solid ${errors.password ? '#EF4444' : 'transparent'}` }}>
              <Lock size={16} style={{ color: '#9CA3AF', flexShrink: 0 }} />
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className="flex-1 bg-transparent text-[14px] focus:outline-none"
                style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={16} style={{ color: '#9CA3AF' }} /> : <Eye size={16} style={{ color: '#9CA3AF' }} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[12px]" style={{ color: '#EF4444' }}>{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-[13px]"
              style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontFamily: "'Roboto', sans-serif" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full text-white text-[15px] font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            style={{ backgroundColor: '#F59E0B', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.08em' }}
          >
            {loading ? 'CREATING...' : <>CONTINUE <span className="text-lg">→</span></>}
          </button>
        </form>

        <p className="text-center text-[12px] mt-6 leading-relaxed" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
          By registering, you agree to our{' '}
          <span style={{ color: '#1A6EB5' }}>Terms of Service</span> and{' '}
          <span style={{ color: '#1A6EB5' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}

function LoginForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((s: RootState) => s.np)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema) as any,
  })

  const onSubmit = async (data: LoginData) => {
    const result = await dispatch(npLoginThunk({ email: data.email, password: data.password }))
    if ((result as any).meta?.requestStatus === 'fulfilled') {
      navigate('/np/launchpad')
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F4FA' }}>
      <header className="flex items-center justify-between px-5 py-4 bg-white"
        style={{ borderBottom: '1px solid #EEF3FB' }}>
        <div className="flex items-center gap-2">
          <ChLogo />
          <span style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 13, color: '#005592', letterSpacing: '0.1em' }}>
            CHARITY HUB
          </span>
        </div>
        <Link to="/np/signup" style={{ color: '#1A6EB5', fontFamily: "'Roboto', sans-serif", fontSize: 14 }}>
          Register
        </Link>
      </header>

      <div className="flex-1 px-5 py-8 max-w-[390px] mx-auto w-full lg:max-w-[440px]">
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{ backgroundColor: '#EBF3FC' }}>
            <Building2 size={26} style={{ color: '#1A6EB5' }} />
          </div>
          <h1 className="text-[28px] font-bold leading-tight mb-2"
            style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
            Sign in to your account
          </h1>
          <p className="text-[15px] leading-relaxed" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
            Welcome back to Charity Hub.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
              Work Email
            </label>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
              style={{ backgroundColor: '#EEF3FB', border: `1px solid ${errors.email ? '#EF4444' : 'transparent'}` }}>
              <Mail size={16} style={{ color: '#9CA3AF', flexShrink: 0 }} />
              <input
                {...register('email')}
                type="email"
                placeholder="contact@organization.org"
                className="flex-1 bg-transparent text-[14px] focus:outline-none"
                style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}
              />
            </div>
            {errors.email && (
              <p className="text-[12px]" style={{ color: '#EF4444' }}>{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
              Password
            </label>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
              style={{ backgroundColor: '#EEF3FB', border: `1px solid ${errors.password ? '#EF4444' : 'transparent'}` }}>
              <Lock size={16} style={{ color: '#9CA3AF', flexShrink: 0 }} />
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className="flex-1 bg-transparent text-[14px] focus:outline-none"
                style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={16} style={{ color: '#9CA3AF' }} /> : <Eye size={16} style={{ color: '#9CA3AF' }} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[12px]" style={{ color: '#EF4444' }}>{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-[13px]"
              style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontFamily: "'Roboto', sans-serif" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full text-white text-[15px] font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            style={{ backgroundColor: '#1A6EB5', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.08em' }}
          >
            {loading ? 'SIGNING IN...' : <>SIGN IN <span className="text-lg">→</span></>}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function NPSignup() {
  const location = useLocation()
  return location.pathname === '/np/login' ? <LoginForm /> : <SignupForm />
}
