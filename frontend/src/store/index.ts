import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import profileReducer from './profileSlice'
import eventReducer from './eventSlice'
import liveEventReducer from './liveEventSlice'
import npReducer from './npSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    events: eventReducer,
    liveEvent: liveEventReducer,
    np: npReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
