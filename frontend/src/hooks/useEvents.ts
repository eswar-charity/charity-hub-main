import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { fetchMyEventsThunk, createEventThunk, updateEventThunk, submitEventThunk } from '../store/eventSlice'
import type { CreateEventPayload } from '../types/event.types'

export function useEvents() {
  const dispatch = useDispatch<AppDispatch>()
  const { myEvents, currentEvent, loading, error } = useSelector((s: RootState) => s.events)

  return {
    myEvents,
    currentEvent,
    loading,
    error,
    fetchMyEvents: (status?: string) => dispatch(fetchMyEventsThunk(status)),
    createEvent: (data: CreateEventPayload) => dispatch(createEventThunk(data)),
    updateEvent: (id: string, data: Partial<CreateEventPayload>) => dispatch(updateEventThunk({ id, data })),
    submitEvent: (id: string) => dispatch(submitEventThunk(id)),
  }
}
