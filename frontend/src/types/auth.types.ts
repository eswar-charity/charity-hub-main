export interface AuthUser {
  id: string
  email: string
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface AuthState {
  user: AuthUser | null
  session: Session | null
  seProfile: import('./profile.types').SEProfile | null
  loading: boolean
  sessionLoading: boolean
  error: string | null
}
