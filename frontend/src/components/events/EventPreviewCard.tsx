import { type Event } from '../../types/event.types'
import { formatDate, formatCurrency } from '../../utils/helpers'
import { STATUS_LABELS } from '../../utils/constants'
import { clsx } from 'clsx'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending_approval: 'bg-yellow-100 text-yellow-700',
  live: 'bg-green-100 text-green-700',
  wrap_up: 'bg-blue-100 text-blue-700',
  memorial: 'bg-purple-100 text-purple-700',
  archived: 'bg-gray-100 text-gray-500',
  rejected: 'bg-red-100 text-red-700',
}

export function EventPreviewCard({ event, onClick }: { event: Event; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={clsx('bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow', onClick && 'cursor-pointer')}
    >
      {event.heroImageUrl && (
        <img src={event.heroImageUrl} alt="" className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap', STATUS_COLORS[event.status] ?? 'bg-gray-100 text-gray-600')}>
            {STATUS_LABELS[event.status] ?? event.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{event.description}</p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>{formatDate(event.eventDate)}</span>
          <span>{formatCurrency(event.totalDonations)} raised</span>
          <span>{event.totalParticipants} participants</span>
        </div>
      </div>
    </div>
  )
}
