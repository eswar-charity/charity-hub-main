import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { router } from './router'
import { loadSessionThunk } from '../store/authSlice'
import { loadNPSessionThunk } from '../store/npSlice'
import type { AppDispatch } from '../store'

export default function App() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(loadSessionThunk())
    dispatch(loadNPSessionThunk())
  }, [dispatch])

  return <RouterProvider router={router} />
}
