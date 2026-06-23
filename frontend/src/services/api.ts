/// <reference types="vite/client" />
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'placeholder',
)

export const TOKEN_KEY = 'ch_access_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
})

api.interceptors.request.use(async (config) => {
  // Prefer locally stored token (backend login), fall back to Supabase session
  const stored = localStorage.getItem(TOKEN_KEY)
  if (stored) {
    config.headers.Authorization = `Bearer ${stored}`
    return config
  }
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const url: string = err.config?.url ?? ''
      const isAuthCall = url.includes('/auth/me') || url.includes('/auth/login') || url.includes('/auth/signup')
      if (!isAuthCall) {
        localStorage.removeItem(TOKEN_KEY)
        // Clear Supabase session so it doesn't re-trigger 401 on next page load
        await supabase.auth.signOut()
        // Only navigate if not already on login to prevent reload loop
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  },
)

export default api
