import api from './api'
import type { Event, CreateEventPayload } from '../types/event.types'

function toSnakePayload(data: CreateEventPayload) {
  return {
    title: data.title,
    description: data.description,
    cause_category: data.causeCategory,
    nonprofit_id: data.nonprofitId ?? null,
    location: data.location ?? null,
    event_date: data.eventDate ?? null,
    is_private: data.isPrivate,
    requires_peer_review: data.requiresPeerReview,
  }
}

function toSnakePartial(data: Partial<CreateEventPayload>) {
  const p: Record<string, unknown> = {}
  if (data.title !== undefined) p.title = data.title
  if (data.description !== undefined) p.description = data.description
  if (data.causeCategory !== undefined) p.cause_category = data.causeCategory
  if (data.nonprofitId !== undefined) p.nonprofit_id = data.nonprofitId
  if (data.location !== undefined) p.location = data.location
  if (data.eventDate !== undefined) p.event_date = data.eventDate
  if (data.isPrivate !== undefined) p.is_private = data.isPrivate
  if (data.requiresPeerReview !== undefined) p.requires_peer_review = data.requiresPeerReview
  return p
}

function normalizeEvent(raw: Record<string, any>): Event {
  return {
    id: raw.id,
    seProfileId: raw.se_profile_id,
    nonprofitId: raw.nonprofit_id ?? undefined,
    title: raw.title,
    description: raw.description,
    causeCategory: raw.cause_category,
    location: raw.location ?? undefined,
    eventDate: raw.event_date ?? undefined,
    status: raw.status,
    heroImagePublicId: raw.hero_image_public_id ?? undefined,
    heroImageUrl: raw.hero_image_url ?? undefined,
    promoVideoPublicId: raw.promo_video_public_id ?? undefined,
    promoVideoUrl: raw.promo_video_url ?? undefined,
    isPrivate: raw.is_private ?? false,
    requiresPeerReview: raw.requires_peer_review ?? false,
    totalDonations: raw.total_donations ?? 0,
    totalParticipants: raw.total_participants ?? 0,
    rejectionReason: raw.rejection_reason ?? undefined,
    submittedAt: raw.submitted_at ?? undefined,
    approvedAt: raw.approved_at ?? undefined,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

export const eventService = {
  getMyEvents: async (status?: string) => {
    const res = await api.get<any[]>('/events/my', { params: status ? { status } : {} })
    return { ...res, data: res.data.map(normalizeEvent) }
  },

  getEvent: async (id: string) => {
    const res = await api.get<any>(`/events/${id}`)
    return { ...res, data: normalizeEvent(res.data) }
  },

  createEvent: async (data: CreateEventPayload) => {
    const res = await api.post<any>('/events', toSnakePayload(data))
    return { ...res, data: normalizeEvent(res.data) }
  },

  updateEvent: async (id: string, data: Partial<CreateEventPayload>) => {
    const res = await api.put<any>(`/events/${id}`, toSnakePartial(data))
    return { ...res, data: normalizeEvent(res.data) }
  },

  deleteEvent: (id: string) => api.delete(`/events/${id}`),

  submitEvent: (id: string) => api.post(`/events/${id}/submit`),

  updateHeroImage: (id: string, publicId: string, url: string) =>
    api.post(`/events/${id}/hero-image`, null, { params: { public_id: publicId, url } }),

  updatePromoVideo: (id: string, publicId: string, url: string) =>
    api.post(`/events/${id}/promo-video`, null, { params: { public_id: publicId, url } }),

  getActiveNonprofits: () =>
    api.get<{ nonprofits: { id: string; organization_name: string; ein: string; website?: string }[] }>(
      '/np/directory'
    ),

  getUploadSignature: (folder: string, resourceType = 'image') =>
    api.get<{ timestamp: number; signature: string; api_key: string; cloud_name: string; folder: string }>(
      '/media/sign', { params: { folder, resource_type: resourceType } }
    ),
}
