import { type Event } from '../../types/event.types'
import { formatDate, formatCurrency } from '../../utils/helpers'
import { MapPin, Calendar, Users, DollarSign } from 'lucide-react'

export function EventSummaryCard({ event }: { event: Event }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h2>
      <p className="text-sm text-gray-500 mb-4">{event.causeCategory}</p>
      <p className="text-gray-700 mb-4">{event.description}</p>
      <div className="grid grid-cols-2 gap-3">
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} className="text-[#7C3AED]" /> {event.location}
          </div>
        )}
        {event.eventDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} className="text-[#7C3AED]" /> {formatDate(event.eventDate)}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign size={14} className="text-[#7C3AED]" /> {formatCurrency(event.totalDonations)} raised
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users size={14} className="text-[#7C3AED]" /> {event.totalParticipants} participants
        </div>
      </div>
    </div>
  )
}
