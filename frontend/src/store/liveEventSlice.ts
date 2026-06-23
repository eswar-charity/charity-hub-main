import { createSlice } from '@reduxjs/toolkit'
import type { LiveEventState } from '../types/liveEvent.types'

const initialState: LiveEventState = {
  currentEventId: null,
  isLive: false,
  viewerCount: 0,
}

const liveEventSlice = createSlice({
  name: 'liveEvent',
  initialState,
  reducers: {
    setLiveEvent: (state, action) => {
      state.currentEventId = action.payload
      state.isLive = true
    },
    clearLiveEvent: (state) => {
      state.currentEventId = null
      state.isLive = false
      state.viewerCount = 0
    },
  },
})

export const { setLiveEvent, clearLiveEvent } = liveEventSlice.actions
export default liveEventSlice.reducer
