import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { fetchDashboardThunk, updateProfileThunk } from '../store/profileSlice'

export function useProfile() {
  const dispatch = useDispatch<AppDispatch>()
  const { profile, recognition, dashboardData, loading, error } = useSelector((s: RootState) => s.profile)

  return {
    profile,
    recognition,
    dashboardData,
    loading,
    error,
    fetchDashboard: () => dispatch(fetchDashboardThunk()),
    updateProfile: (data: Parameters<typeof updateProfileThunk>[0]) => dispatch(updateProfileThunk(data)),
  }
}
