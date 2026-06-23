import { type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'navy' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-bold rounded-full transition-all focus:outline-none tracking-wide',
        {
          'bg-[#F59E0B] text-white hover:bg-[#E08E00] active:bg-[#CC8200]': variant === 'primary',
          'bg-[#0D4A8A] text-white hover:bg-[#0A3F78] active:bg-[#093570]': variant === 'navy',
          'bg-transparent text-[#1A6EB5] hover:bg-blue-50': variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          'px-4 py-2 text-sm': size === 'sm',
          'px-6 py-3 text-sm': size === 'md',
          'px-6 py-4 text-sm': size === 'lg',
          'opacity-60 cursor-not-allowed': disabled || loading,
        },
        className,
      )}
      style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: '0.05em', ...props.style }}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
