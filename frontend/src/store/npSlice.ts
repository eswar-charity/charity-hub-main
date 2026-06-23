import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { NPState, VerificationStage, LaunchpadData } from '../types/nonprofit.types'
import { npService } from '../services/nonprofit.service'
import { TOKEN_KEY } from '../services/api'

const NP_TOKEN_KEY = 'np_access_token'

const initialState: NPState = {
  nonprofit: null,
  launchpadData: null,
  verificationStages: [],
  loading: false,
  npSessionLoading: true,
  error: null,
}

function normalizeNP(raw: Record<string, any>) {
  return {
    id: raw.id,
    userId: raw.user_id,
    organizationName: raw.organization_name,
    email: raw.email,
    ein: raw.ein,
    legalName: raw.legal_name,
    registeredAddress: raw.registered_address,
    officialContactEmail: raw.official_contact_email,
    website: raw.website,
    npType: raw.np_type ?? 'standard',
    verificationStatus: raw.verification_status,
    einCheckPassed: raw.ein_check_passed ?? false,
    stripeOnboardingComplete: raw.stripe_onboarding_complete ?? false,
    totalEventsActive: raw.total_events_active ?? 0,
    totalEventsDraft: raw.total_events_draft ?? 0,
    totalDonationsReceived: Number(raw.total_donations_received ?? 0),
    pendingApprovalsCount: raw.pending_approvals_count ?? 0,
    nextPayoutDate: raw.next_payout_date,
    nextPayoutAmount: Number(raw.next_payout_amount ?? 0),
    createdAt: raw.created_at,
  } as any
}

function normalizeLaunchpad(raw: Record<string, any>): LaunchpadData {
  const np = raw.nonprofit ?? {}
  return {
    nonprofit: {
      id: np.id,
      orgName: np.org_name,
      verificationStatus: np.verification_status,
      stripeOnboardingComplete: np.stripe_onboarding_complete ?? false,
    },
    events: {
      totalActive: raw.events?.total_active ?? 0,
      totalDraft: raw.events?.total_draft ?? 0,
    },
    approvals: {
      pendingCount: raw.approvals?.pending_count ?? 0,
      recent: raw.approvals?.recent ?? [],
    },
    donations: (raw.donations ?? []).map((d: any) => ({
      id: d.id,
      donorDisplayName: d.donor_display_name ?? 'Anonymous',
      donorAvatarInitials: d.donor_avatar_initials ?? '?',
      donorAvatarColor: d.donor_avatar_color ?? '#1A6EB5',
      amount: Number(d.amount),
      donatedAt: d.donated_at,
    })),
    engagement: (raw.engagement ?? []).map((e: any) => ({
      date: e.date,
      participantCount: e.participant_count ?? 0,
      donationCount: e.donation_count ?? 0,
    })),
    nextPayout: {
      date: raw.next_payout?.date ?? '',
      amount: Number(raw.next_payout?.amount ?? 0),
      status: raw.next_payout?.status ?? 'Processing',
    },
    activity: (raw.activity ?? []).map((a: any) => ({
      id: a.id,
      activityText: a.activity_text,
      activityType: a.activity_type ?? 'info',
      flagged: a.flagged ?? false,
      createdAt: a.created_at,
    })),
  }
}

export const npSignupThunk = createAsyncThunk(
  'np/signup',
  async ({ org, email, password }: { org: string; email: string; password: string }) => {
    const res = await npService.signup(org, email, password)
    return res.data
  },
)

export const npLoginThunk = createAsyncThunk(
  'np/login',
  async ({ email, password }: { email: string; password: string }) => {
    const res = await npService.login(email, password)
    const { session, nonprofit } = res.data
    if (session?.access_token) {
      localStorage.setItem(NP_TOKEN_KEY, session.access_token)
      localStorage.setItem(TOKEN_KEY, session.access_token)
    }
    return { nonprofit: normalizeNP(nonprofit) }
  },
)

export const submitOrgDetailsThunk = createAsyncThunk(
  'np/submitOrgDetails',
  async (details: {
    ein: string
    legal_name: string
    registered_address: string
    official_contact_email: string
    website?: string
    np_type: string
  }) => {
    const res = await npService.submitOrgDetails(details)
    return { nonprofit: normalizeNP(res.data.nonprofit) }
  },
)

export const fetchVerificationStatusThunk = createAsyncThunk(
  'np/fetchVerificationStatus',
  async () => {
    const res = await npService.getVerificationStatus()
    return res.data as { verification_status: string; stages: VerificationStage[] }
  },
)

export const fetchLaunchpadThunk = createAsyncThunk(
  'np/fetchLaunchpad',
  async () => {
    const res = await npService.getLaunchpad()
    return normalizeLaunchpad(res.data)
  },
)

export const loadNPSessionThunk = createAsyncThunk('np/loadSession', async () => {
  const stored = localStorage.getItem(NP_TOKEN_KEY)
  if (!stored) return null
  try {
    const res = await npService.me()
    const { nonprofit } = res.data
    if (!nonprofit) return null
    return normalizeNP(nonprofit)
  } catch {
    localStorage.removeItem(NP_TOKEN_KEY)
    return null
  }
})

const npSlice = createSlice({
  name: 'np',
  initialState,
  reducers: {
    clearNPError: (state) => { state.error = null },
    logoutNP: (state) => {
      state.nonprofit = null
      state.launchpadData = null
      state.verificationStages = []
      localStorage.removeItem(NP_TOKEN_KEY)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(npSignupThunk.pending, (state) => { state.loading = true; state.error = null })
      .addCase(npSignupThunk.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.nonprofit) {
          state.nonprofit = normalizeNP(action.payload.nonprofit)
        }
      })
      .addCase(npSignupThunk.rejected, (state, action) => {
        state.loading = false; state.error = action.error.message || 'Signup failed'
      })

      .addCase(npLoginThunk.pending, (state) => { state.loading = true; state.error = null })
      .addCase(npLoginThunk.fulfilled, (state, action) => {
        state.loading = false
        state.nonprofit = action.payload.nonprofit
      })
      .addCase(npLoginThunk.rejected, (state, action) => {
        state.loading = false; state.error = action.error.message || 'Login failed'
      })

      .addCase(submitOrgDetailsThunk.pending, (state) => { state.loading = true; state.error = null })
      .addCase(submitOrgDetailsThunk.fulfilled, (state, action) => {
        state.loading = false
        state.nonprofit = action.payload.nonprofit
      })
      .addCase(submitOrgDetailsThunk.rejected, (state, action) => {
        state.loading = false; state.error = action.error.message || 'Submission failed'
      })

      .addCase(fetchVerificationStatusThunk.fulfilled, (state, action) => {
        state.verificationStages = action.payload.stages
        if (state.nonprofit) {
          state.nonprofit.verificationStatus = action.payload.verification_status as any
        }
      })

      .addCase(fetchLaunchpadThunk.pending, (state) => { state.loading = true })
      .addCase(fetchLaunchpadThunk.fulfilled, (state, action) => {
        state.loading = false
        state.launchpadData = action.payload
      })
      .addCase(fetchLaunchpadThunk.rejected, (state) => { state.loading = false })

      .addCase(loadNPSessionThunk.pending, (state) => { state.npSessionLoading = true })
      .addCase(loadNPSessionThunk.fulfilled, (state, action) => {
        state.npSessionLoading = false
        if (action.payload) state.nonprofit = action.payload
      })
      .addCase(loadNPSessionThunk.rejected, (state) => { state.npSessionLoading = false })
  },
})

export const { clearNPError, logoutNP } = npSlice.actions
export { NP_TOKEN_KEY }
export default npSlice.reducer
