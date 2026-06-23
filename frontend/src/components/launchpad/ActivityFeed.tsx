import type { NPActivity } from '../../types/nonprofit.types'

interface Props {
  items: NPActivity[]
}

const MOCK_ITEMS: NPActivity[] = [
  { id: '1', activityText: 'New event submitted for approval: Community Walk 2026', activityType: 'info', flagged: false, createdAt: new Date().toISOString() },
  { id: '2', activityText: 'Donation of $100 received from Mark Smith', activityType: 'donation', flagged: false, createdAt: new Date().toISOString() },
]

export function ActivityFeed({ items }: Props) {
  const list = items.length > 0 ? items : MOCK_ITEMS

  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #EEF3FB' }}>
      <p className="text-[11px] font-bold mb-4"
        style={{ color: '#9CA3AF', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em' }}>
        ACTIVITY
      </p>
      <div className="flex flex-col gap-3">
        {list.map(item => (
          <div key={item.id} className="flex items-start gap-3">
            <div
              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: item.flagged ? '#EF4444' : '#1A6EB5' }}
            />
            <p className="text-[13px] leading-relaxed flex-1" style={{ color: item.flagged ? '#EF4444' : '#414750', fontFamily: "'Roboto', sans-serif" }}>
              {item.activityText}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
