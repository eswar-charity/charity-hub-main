import { useRef } from 'react'

interface Props {
  length?: number
  onChange: (value: string) => void
}

export function OTPInput({ length = 6, onChange }: Props) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (i: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const all = inputs.current.map((el) => el?.value ?? '')
    all[i] = value
    onChange(all.join(''))
    if (value && i < length - 1) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !inputs.current[i]?.value && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el }}
          maxLength={1}
          inputMode="numeric"
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-xl focus:border-[#7C3AED] focus:outline-none"
        />
      ))}
    </div>
  )
}
