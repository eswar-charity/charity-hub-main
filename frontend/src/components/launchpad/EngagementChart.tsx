import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { EngagementDay } from '../../types/nonprofit.types'

interface Props {
  data: EngagementDay[]
  flaggedCount?: number
}

const MOCK_DATA: EngagementDay[] = Array.from({ length: 14 }, (_, i) => ({
  date: `Day ${i + 1}`,
  participantCount: Math.floor(Math.random() * 40) + 5,
  donationCount: Math.floor(Math.random() * 15) + 1,
}))

export function EngagementChart({ data, flaggedCount = 0 }: Props) {
  const chartData = (data.length > 0 ? data : MOCK_DATA).map(d => ({
    name: d.date.length > 5 ? d.date.slice(5) : d.date,
    participants: d.participantCount,
    donations: d.donationCount,
  }))

  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #EEF3FB' }}>
      <p className="text-[11px] font-bold mb-4"
        style={{ color: '#9CA3AF', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em' }}>
        ENGAGEMENT
      </p>
      <div style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, border: '1px solid #EEF3FB', borderRadius: 8 }}
              labelStyle={{ color: '#111827' }}
            />
            <Line
              type="monotone"
              dataKey="participants"
              stroke="#1A6EB5"
              strokeWidth={2}
              dot={false}
              name="Participants"
            />
            <Line
              type="monotone"
              dataKey="donations"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
              name="Donations"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {flaggedCount > 0 && (
        <p className="text-[12px] mt-3 font-medium" style={{ color: '#EF4444', fontFamily: "'Roboto', sans-serif" }}>
          ⚑ {flaggedCount} flagged {flaggedCount === 1 ? 'item requires' : 'items require'} review
        </p>
      )}
    </div>
  )
}
