import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { EventState, CreateEventPayload } from '../types/event.types'
import { eventService } from '../services/event.service'

const initialState: EventState = {
  myEvents: [],
  currentEvent: null,
  loading: false,
  error: null,
}

export const fetchMyEventsThunk = createAsyncThunk('events/fetchMy', async (status?: string) => {
  const res = await eventService.getMyEvents(status)
  return res.data
})

export const createEventThunk = createAsyncThunk('events/create', async (data: CreateEventPayload) => {
  const res = await eventService.createEvent(data)
  return res.data
})

export const updateEventThunk = createAsyncThunk('events/update', async ({ id, data }: { id: string; data: Partial<CreateEventPayload> }) => {
  const res = await eventService.updateEvent(id, data)
  return res.data
})

export const submitEventThunk = createAsyncThunk('events/submit', async (id: string) => {
  await eventService.submitEvent(id)
  return id
})

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setCurrentEvent: (state, action) => { state.currentEvent = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyEventsThunk.pending, (state) => { state.loading = true })
      .addCase(fetchMyEventsThunk.fulfilled, (state, action) => {
        state.loading = false; state.myEvents = action.payload
      })
      .addCase(fetchMyEventsThunk.rejected, (state, action) => {
        state.loading = false; state.error = action.error.message || 'Failed to load events'
      })
      .addCase(createEventThunk.fulfilled, (state, action) => {
        state.myEvents.unshift(action.payload)
        state.currentEvent = action.payload
      })
      .addCase(updateEventThunk.fulfilled, (state, action) => {
        const idx = state.myEvents.findIndex(e => e.id === action.payload.id)
        if (idx >= 0) state.myEvents[idx] = action.payload
        state.currentEvent = action.payload
      })
      .addCase(submitEventThunk.fulfilled, (state, action) => {
        const idx = state.myEvents.findIndex(e => e.id === action.payload)
        if (idx >= 0) state.myEvents[idx].status = 'pending_approval'
      })
  },
})

export const { setCurrentEvent } = eventSlice.actions
export default eventSlice.reducer
