import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, Props>(({ label, error, icon, rightIcon, className, ...props }, ref) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && (
      <label className="text-[13px] font-normal pl-1" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
        {label}
      </label>
    )}
    <div className="relative flex items-center">
      {icon && (
        <span className="absolute left-4 flex items-center justify-center" style={{ color: '#71778E' }}>
          {icon}
        </span>
      )}
      <input
        ref={ref}
        {...props}
        className={clsx(
          'w-full py-4 text-[15px] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A6EB5]',
          icon ? 'pl-12 pr-4' : 'px-4',
          rightIcon ? 'pr-12' : '',
          error ? 'bg-red-50 ring-1 ring-red-400' : 'bg-[#F4F8FC]',
          className,
        )}
        style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}
        placeholder={props.placeholder}
      />
      {rightIcon && (
        <span className="absolute right-4 flex items-center justify-center" style={{ color: '#71778E' }}>
          {rightIcon}
        </span>
      )}
    </div>
    {error && <p className="text-xs text-red-600 pl-1">{error}</p>}
  </div>
))
Input.displayName = 'Input'
