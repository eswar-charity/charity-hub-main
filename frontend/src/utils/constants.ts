export const CAUSE_CATEGORIES = [
  'Education',
  'Environment',
  'Health',
  'Hunger',
  'Animal Welfare',
  'Arts & Culture',
  'Community',
  'Disaster Relief',
  'Human Rights',
  'Youth Development',
]

export const RECOGNITION_TIERS = ['Spark', 'Flame', 'Torch', 'Beacon', 'Legend'] as const

export const TIER_COLORS: Record<string, string> = {
  Spark: '#F59E0B',
  Flame: '#F97316',
  Torch: '#EF4444',
  Beacon: '#8B5CF6',
  Legend: '#06B6D4',
}

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  live: 'Live',
  wrap_up: 'Wrap Up',
  memorial: 'Memorial',
  archived: 'Archived',
  rejected: 'Rejected',
}
