import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { ProfileState } from '../types/profile.types'
import { profileService } from '../services/profile.service'

const initialState: ProfileState = {
  profile: null,
  recognition: null,
  dashboardData: null,
  loading: false,
  error: null,
}

export const fetchDashboardThunk = createAsyncThunk('profile/fetchDashboard', async () => {
  const res = await profileService.getDashboard()
  return res.data
})

export const updateProfileThunk = createAsyncThunk('profile/update', async (data: Parameters<typeof profileService.updateProfile>[0]) => {
  const res = await profileService.updateProfile(data)
  return res.data
})

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardThunk.pending, (state) => { state.loading = true })
      .addCase(fetchDashboardThunk.fulfilled, (state, action) => {
        state.loading = false
        state.dashboardData = action.payload
        state.profile = action.payload?.se_profile
        state.recognition = action.payload?.recognition
      })
      .addCase(fetchDashboardThunk.rejected, (state, action) => {
        state.loading = false; state.error = action.error.message || 'Failed to load dashboard'
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.profile = action.payload
      })
  },
})

export default profileSlice.reducer
