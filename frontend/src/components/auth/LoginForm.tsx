import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { loginSchema, type LoginFormData } from '../../utils/validations'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'

export function LoginForm() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
      <Input label="Email" type="email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
      <Input label="Password" type="password" placeholder="Your password" {...register('password')} error={errors.password?.message} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
        Sign In
      </Button>

      <p className="text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link to="/signup" className="text-[#7C3AED] font-medium hover:underline">Sign up</Link>
      </p>
    </form>
  )
}
