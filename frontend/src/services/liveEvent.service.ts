import api from './api'

export const liveEventService = {
  getLiveEvent: (id: string) => api.get(`/events/${id}`),
}
