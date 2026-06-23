export type EventStatus = 'draft' | 'pending_approval' | 'live' | 'wrap_up' | 'memorial' | 'archived' | 'rejected'

export interface Event {
  id: string
  seProfileId: string
  nonprofitId?: string
  title: string
  description: string
  causeCategory: string
  location?: string
  eventDate?: string
  status: EventStatus
  heroImagePublicId?: string
  heroImageUrl?: string
  promoVideoPublicId?: string
  promoVideoUrl?: string
  isPrivate: boolean
  requiresPeerReview: boolean
  totalDonations: number
  totalParticipants: number
  rejectionReason?: string
  submittedAt?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface EventState {
  myEvents: Event[]
  currentEvent: Event | null
  loading: boolean
  error: string | null
}

export interface CreateEventPayload {
  title: string
  description: string
  causeCategory: string
  nonprofitId?: string
  location?: string
  eventDate?: string
  isPrivate: boolean
  requiresPeerReview: boolean
}
