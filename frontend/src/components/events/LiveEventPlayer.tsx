import { type Event } from '../../types/event.types'

export function LiveEventPlayer({ event }: { event: Event }) {
  if (!event.promoVideoUrl) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-2xl flex items-center justify-center">
        <span className="text-gray-400">No video available</span>
      </div>
    )
  }
  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-900">
      <video
        src={event.promoVideoUrl}
        controls
        className="w-full h-full object-cover"
        poster={event.heroImageUrl}
      />
    </div>
  )
}
