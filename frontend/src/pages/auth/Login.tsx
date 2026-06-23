import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { loginSchema, type LoginFormData } from '../../utils/validations'
import { Input } from '../../components/common/Input'

export default function Login() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data.email, data.password)
    if ((result as any).meta?.requestStatus === 'fulfilled') {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#DCE9F5' }}>
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-80 blur-3xl -translate-x-1/3 -translate-y-1/3"
        style={{ backgroundColor: '#1A6EB5' }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-60 blur-3xl translate-x-1/4 translate-y-1/4"
        style={{ backgroundColor: '#FFDDB4' }} />

      <div className="relative z-10 w-full max-w-[390px] lg:max-w-[440px] px-4 py-8 flex flex-col items-center">
        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
            style={{ backgroundColor: '#005592' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="4" fill="white" />
              <circle cx="16" cy="5" r="2.5" fill="white" />
              <circle cx="16" cy="27" r="2.5" fill="white" />
              <circle cx="5" cy="16" r="2.5" fill="white" />
              <circle cx="27" cy="16" r="2.5" fill="white" />
              <line x1="16" y1="7.5" x2="16" y2="12" stroke="white" strokeWidth="2" />
              <line x1="16" y1="20" x2="16" y2="24.5" stroke="white" strokeWidth="2" />
              <line x1="7.5" y1="16" x2="12" y2="16" stroke="white" strokeWidth="2" />
              <line x1="20" y1="16" x2="24.5" y2="16" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 14, color: '#005592', letterSpacing: '0.12em' }}>
            CHARITY HUB
          </span>
        </div>

        <h1 className="text-[24px] font-bold text-center mb-1" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
          Welcome back
        </h1>
        <p className="text-[15px] text-center mb-8" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
          Sign in to continue making an impact.
        </p>

        <div className="w-full bg-white rounded-2xl p-6 shadow-md">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              placeholder="jane@example.com"
              icon={<Mail size={18} />}
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock size={16} />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register('password')}
              error={errors.password?.message}
            />

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full text-white text-[14px] font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              style={{ backgroundColor: '#F59E0B', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.08em' }}
            >
              {loading ? 'SIGNING IN...' : <>SIGN IN <span className="text-lg">→</span></>}
            </button>
          </form>
        </div>

        <p className="mt-6 text-[14px]" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#1A6EB5', fontWeight: 500 }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
