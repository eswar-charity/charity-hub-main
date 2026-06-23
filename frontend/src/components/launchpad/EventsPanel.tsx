import { Plus } from 'lucide-react'

interface Props {
  totalActive: number
  totalDraft: number
  onCreateEvent: () => void
}

export function EventsPanel({ totalActive, totalDraft, onCreateEvent }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #EEF3FB' }}>
      <p className="text-[11px] font-bold mb-4"
        style={{ color: '#9CA3AF', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em' }}>
        EVENTS
      </p>
      <div className="flex gap-6 mb-5">
        <div>
          <p className="text-[34px] font-bold leading-none" style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
            {totalActive}
          </p>
          <p className="text-[13px] mt-1" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>Active</p>
        </div>
        <div className="w-px" style={{ backgroundColor: '#EEF3FB' }} />
        <div>
          <p className="text-[34px] font-bold leading-none" style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
            {totalDraft}
          </p>
          <p className="text-[13px] mt-1" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>Draft</p>
        </div>
      </div>
      <button
        onClick={onCreateEvent}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold"
        style={{
          border: '1.5px solid #1A6EB5',
          color: '#1A6EB5',
          fontFamily: "'Oswald', sans-serif",
          letterSpacing: '0.06em',
        }}
      >
        <Plus size={14} strokeWidth={2.5} /> CREATE EVENT
      </button>
    </div>
  )
}
