export type RecognitionTier = 'Spark' | 'Flame' | 'Torch' | 'Beacon' | 'Legend'

export interface SEProfile {
  id: string
  userId: string
  handle: string
  displayName: string
  bio?: string
  causeCategories: string[]
  isMinor: boolean
  guardianEmail?: string
  guardianConsentGiven: boolean
  avatarPublicId?: string
  avatarUrl?: string
  recognitionTier: RecognitionTier
  totalEventsCreated: number
  totalDonationsRaised: number
  totalParticipants: number
  createdAt: string
  updatedAt: string
}

export interface ProfileState {
  profile: SEProfile | null
  recognition: RecognitionData | null
  dashboardData: DashboardData | null
  loading: boolean
  error: string | null
}

export interface RecognitionData {
  tier: RecognitionTier
  totalPoints: number
  nextTier: string | null
  pointsToNextTier: number
  recentEvents: RecognitionEvent[]
}

export interface RecognitionEvent {
  id: string
  eventType: string
  pointsEarned: number
  metadata: Record<string, unknown>
  createdAt: string
}

export interface DashboardData {
  seProfile: SEProfile
  recentEvents: import('./event.types').Event[]
  recognition: RecognitionData
  lifetimeStats: {
    totalEventsCreated: number
    totalDonationsRaised: number
    totalParticipants: number
  }
  pendingCount: number
}
