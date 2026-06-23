interface Props {
  date: string
  amount: number
  status: string
}

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  Processing: { color: '#1A6EB5', bg: '#EBF3FC' },
  Paid:       { color: '#16A34A', bg: '#DCFCE7' },
  Scheduled:  { color: '#D97706', bg: '#FEF3C7' },
}

function formatPayoutDate(dateStr: string): string {
  if (!dateStr) return 'TBD'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

export function PayoutsPanel({ date, amount, status }: Props) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Processing

  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #EEF3FB' }}>
      <p className="text-[11px] font-bold mb-4"
        style={{ color: '#9CA3AF', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em' }}>
        PAYOUTS
      </p>
      <p className="text-[13px] mb-1" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
        Next payout scheduled for
      </p>
      <p className="text-[28px] font-bold mb-2" style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
        {formatPayoutDate(date)}
      </p>
      {amount > 0 && (
        <p className="text-[15px] font-semibold mb-3" style={{ color: '#1A6EB5', fontFamily: "'Roboto', sans-serif" }}>
          ${amount.toFixed(2)}
        </p>
      )}
      <span
        className="inline-block text-[11px] font-bold px-3 py-1 rounded-full"
        style={{ color: style.color, backgroundColor: style.bg, fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em' }}
      >
        {status.toUpperCase()}
      </span>
    </div>
  )
}
