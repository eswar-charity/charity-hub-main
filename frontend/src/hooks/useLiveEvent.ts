import { useSelector } from 'react-redux'
import type { RootState } from '../store'

export function useLiveEvent() {
  return useSelector((s: RootState) => s.liveEvent)
}
