import { supabase } from './api'

export const authService = {
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),

  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  onAuthStateChange: supabase.auth.onAuthStateChange.bind(supabase.auth),
}
