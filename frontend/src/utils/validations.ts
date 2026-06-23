import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  display_name: z.string().min(2, 'Full name required'),
  date_of_birth: z.string().min(1, 'Date of birth required'),
  is_minor: z.boolean().default(false),
  guardian_email: z.string().email().optional().or(z.literal('')),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export const createEventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  causeCategory: z.string().min(1, 'Select a cause category'),
  location: z.string().optional(),
  eventDate: z.string().optional(),
  isPrivate: z.boolean().default(false),
  requiresPeerReview: z.boolean().default(false),
})

export type SignupFormData = z.infer<typeof signupSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type CreateEventFormData = z.infer<typeof createEventSchema>
