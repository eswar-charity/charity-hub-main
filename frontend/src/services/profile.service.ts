import api from './api'
import type { SEProfile } from '../types/profile.types'

export const profileService = {
  getOwnProfile: () => api.get<SEProfile>('/se/profile'),
  updateProfile: (data: Partial<SEProfile>) => api.put<SEProfile>('/se/profile', data),
  updateAvatar: (publicId: string, url: string) =>
    api.post('/se/profile/avatar', null, { params: { public_id: publicId, url } }),
  getPublicProfile: (handle: string) => api.get<SEProfile>(`/se/profile/${handle}`),
  getDashboard: () => api.get('/dashboard/se'),
}
