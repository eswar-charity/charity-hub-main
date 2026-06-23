import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { loginThunk, signupThunk, logoutThunk } from '../store/authSlice'

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>()
  const { user, session, seProfile, loading, sessionLoading, error } = useSelector((s: RootState) => s.auth)

  return {
    user,
    session,
    seProfile,
    loading,
    sessionLoading,
    error,
    isAuthenticated: !!session,
    login: (email: string, password: string) => dispatch(loginThunk({ email, password })),
    signup: (payload: Parameters<typeof signupThunk>[0]) => dispatch(signupThunk(payload)),
    logout: () => dispatch(logoutThunk()),
  }
}
