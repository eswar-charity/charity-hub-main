import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { AuthState } from '../types/auth.types'
import { supabase, TOKEN_KEY } from '../services/api'
import api from '../services/api'

const initialState: AuthState = {
  user: null,
  session: null,
  seProfile: null,
  loading: false,
  sessionLoading: true,  // true until loadSessionThunk completes (avoids AuthGuard flash-redirect)
  error: null,
}

export const loginThunk = createAsyncThunk('auth/login', async ({ email, password }: { email: string; password: string }) => {
  const res = await api.post('/auth/login', { email, password })
  const { user, session } = res.data
  localStorage.setItem(TOKEN_KEY, session.access_token)
  try {
    const meRes = await api.get('/auth/me')
    return { user, session, seProfile: meRes.data.se_profile }
  } catch {
    return { user, session, seProfile: null }
  }
})

export const signupThunk = createAsyncThunk('auth/signup', async (payload: {
  email: string; password: string; handle: string; display_name: string; is_minor: boolean
  guardian_email?: string; date_of_birth?: string
}) => {
  // date_of_birth is client-side only — strip before sending to backend
  const { date_of_birth: _dob, ...body } = payload
  const res = await api.post('/auth/signup', body)
  return res.data
})

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem(TOKEN_KEY)
  await supabase.auth.signOut()
})

export const loadSessionThunk = createAsyncThunk('auth/loadSession', async () => {
  // Restore session from localStorage token (backend-issued)
  const stored = localStorage.getItem(TOKEN_KEY)
  if (stored) {
    try {
      const profileRes = await api.get('/auth/me')
      const { user, se_profile } = profileRes.data
      return { user, session: { access_token: stored }, seProfile: se_profile }
    } catch {
      localStorage.removeItem(TOKEN_KEY)
    }
  }
  // Fall back to Supabase session
  const { data } = await supabase.auth.getSession()
  if (!data.session) return null
  // Use /auth/me (excluded from 401 redirect) to safely restore session
  try {
    const meRes = await api.get('/auth/me')
    return { user: data.session.user, session: data.session, seProfile: meRes.data.se_profile }
  } catch {
    // Token invalid — sign out silently and return null so app stays on /login
    await supabase.auth.signOut()
    return null
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
    setSeProfile: (state, action) => { state.seProfile = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user as any
        state.session = action.payload.session as any
        state.seProfile = action.payload.seProfile
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false; state.error = action.error.message || 'Login failed'
      })
      .addCase(signupThunk.pending, (state) => { state.loading = true; state.error = null })
      .addCase(signupThunk.fulfilled, (state) => { state.loading = false })
      .addCase(signupThunk.rejected, (state, action) => {
        state.loading = false; state.error = action.error.message || 'Signup failed'
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null; state.session = null; state.seProfile = null
      })
      .addCase(loadSessionThunk.pending, (state) => { state.sessionLoading = true })
      .addCase(loadSessionThunk.fulfilled, (state, action) => {
        state.sessionLoading = false
        if (action.payload) {
          state.user = action.payload.user as any
          state.session = action.payload.session as any
          state.seProfile = action.payload.seProfile
        }
      })
      .addCase(loadSessionThunk.rejected, (state) => { state.sessionLoading = false })
  },
})

export const { clearError, setSeProfile } = authSlice.actions
export default authSlice.reducer
