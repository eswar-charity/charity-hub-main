import type { NPDonation } from '../../types/nonprofit.types'

interface Props {
  donations: NPDonation[]
}

const AVATAR_COLORS = ['#1A6EB5', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#06B6D4']

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name: string): string {
  if (!name || name === 'Anonymous') return 'AN'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const MOCK_DONATIONS: NPDonation[] = [
  { id: '1', donorDisplayName: 'Anonymous', donorAvatarInitials: 'AN', donorAvatarColor: '#9CA3AF', amount: 50, donatedAt: new Date().toISOString() },
  { id: '2', donorDisplayName: 'Jane Doe', donorAvatarInitials: 'JD', donorAvatarColor: '#1A6EB5', amount: 25, donatedAt: new Date().toISOString() },
  { id: '3', donorDisplayName: 'Mark Smith', donorAvatarInitials: 'MS', donorAvatarColor: '#F59E0B', amount: 100, donatedAt: new Date().toISOString() },
]

export function DonationsPanel({ donations }: Props) {
  const list = donations.length > 0 ? donations : MOCK_DONATIONS

  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #EEF3FB' }}>
      <p className="text-[11px] font-bold mb-4"
        style={{ color: '#9CA3AF', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em' }}>
        RECENT DONATIONS
      </p>
      <div className="flex flex-col gap-3">
        {list.map(d => {
          const color = d.donorAvatarColor || getAvatarColor(d.donorDisplayName)
          const initials = d.donorAvatarInitials || getInitials(d.donorDisplayName)
          return (
            <div key={d.id} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold text-white"
                style={{ backgroundColor: color, fontFamily: "'Roboto', sans-serif" }}
              >
                {initials}
              </div>
              <p className="flex-1 text-[14px]" style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
                {d.donorDisplayName}
              </p>
              <p className="text-[14px] font-semibold" style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
                ${Number(d.amount).toFixed(2)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
