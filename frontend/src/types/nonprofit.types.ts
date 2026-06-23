export type NPVerificationStatus =
  | 'submitted' | 'verifying' | 'verified'
  | 'settlement_setup' | 'active' | 'rejected' | 'manual_review'

export type NPType = 'standard' | 'church' | 'religious_org'

export interface Nonprofit {
  id: string
  userId: string
  organizationName: string
  email: string
  ein?: string
  legalName?: string
  registeredAddress?: string
  officialContactEmail?: string
  website?: string
  npType: NPType
  verificationStatus: NPVerificationStatus
  einCheckPassed: boolean
  stripeOnboardingComplete: boolean
  totalEventsActive: number
  totalEventsDraft: number
  totalDonationsReceived: number
  pendingApprovalsCount: number
  nextPayoutDate?: string
  nextPayoutAmount: number
  createdAt: string
}

export interface VerificationStage {
  key: string
  label: string
  description: string
  status: 'complete' | 'active' | 'pending'
}

export interface NPDonation {
  id: string
  donorDisplayName: string
  donorAvatarInitials: string
  donorAvatarColor: string
  amount: number
  donatedAt: string
}

export interface NPActivity {
  id: string
  activityText: string
  activityType: string
  flagged: boolean
  createdAt: string
}

export interface EngagementDay {
  date: string
  participantCount: number
  donationCount: number
}

export interface LaunchpadData {
  nonprofit: { id: string; orgName: string; verificationStatus: NPVerificationStatus; stripeOnboardingComplete: boolean }
  events: { totalActive: number; totalDraft: number }
  approvals: { pendingCount: number; recent: any[] }
  donations: NPDonation[]
  engagement: EngagementDay[]
  nextPayout: { date: string; amount: number; status: string }
  activity: NPActivity[]
}

export interface NPState {
  nonprofit: Nonprofit | null
  launchpadData: LaunchpadData | null
  verificationStages: VerificationStage[]
  loading: boolean
  npSessionLoading: boolean
  error: string | null
}
