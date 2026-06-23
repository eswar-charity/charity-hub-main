import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { signupSchema, type SignupFormData } from '../../utils/validations'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'

function generateHandle(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  const suffix = Math.floor(Math.random() * 9000 + 1000)
  return `${base || 'user'}_${suffix}`
}

function calcIsMinor(dob: string): boolean {
  const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  return age < 18
}

export function SignupForm() {
  const { signup, loading, error } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema) as any,
    defaultValues: { is_minor: false },
  })

  const onSubmit = async (data: SignupFormData) => {
    const handle = generateHandle(data.display_name)
    const is_minor = calcIsMinor(data.date_of_birth)
    const result = await signup({ ...data, handle, is_minor })
    if ((result as any).meta?.requestStatus === 'fulfilled') {
      navigate('/login')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
      <Input label="Full Name" placeholder="Jane Doe" {...register('display_name')} error={errors.display_name?.message} />
      <Input label="Email" type="email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
      <Input label="Password" type="password" placeholder="Min 8 characters" {...register('password')} error={errors.password?.message} />
      <Input label="Date of birth" type="date" {...register('date_of_birth')} error={errors.date_of_birth?.message} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
        Create Account
      </Button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-[#1A6EB5] font-medium hover:underline">Sign in</Link>
      </p>
    </form>
  )
}
