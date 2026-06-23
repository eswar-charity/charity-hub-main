import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Calendar, Clock, MapPin, ImagePlus, Bold, Italic, List, Link, X, RefreshCcw, Building2 } from 'lucide-react'
import type { AppDispatch, RootState } from '../../store'
import { createEventThunk, updateEventThunk, submitEventThunk } from '../../store/eventSlice'
import { eventService } from '../../services/event.service'

interface NPOption {
  id: string
  organization_name: string
  ein: string
}

const CAUSE_CATEGORIES = [
  'Education', 'Environment', 'Health', 'Community', 'Arts & Culture',
  'Animal Welfare', 'Food Security', 'Housing', 'Disaster Relief', 'Mental Health',
]

interface HeroImage {
  publicId: string
  url: string
}

export default function CreateEvent() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const loading = useSelector((s: RootState) => s.events.loading)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [causeCategory, setCauseCategory] = useState('')
  const [location, setLocation] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const dateInputRef = useRef<HTMLInputElement>(null)
  const timeInputRef = useRef<HTMLInputElement>(null)
  const [nonprofitId, setNonprofitId] = useState<string>('')
  const [nonprofits, setNonprofits] = useState<NPOption[]>([])
  const [isPrivate, setIsPrivate] = useState(false)
  const [requiresPeerReview, setRequiresPeerReview] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [heroImage, setHeroImage] = useState<HeroImage | null>(null)
  const [heroPreview, setHeroPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    eventService.getActiveNonprofits()
      .then(res => setNonprofits(res.data.nonprofits))
      .catch(() => {})
  }, [])

  const validate = (requireAll = true): boolean => {
    const errs: Record<string, string> = {}
    if (!title.trim()) {
      errs.title = 'Event name is required'
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters'
    }
    if (requireAll) {
      if (!description.trim()) {
        errs.description = 'Description is required'
      } else if (description.trim().length < 20) {
        errs.description = 'Description must be at least 20 characters'
      }
      if (!causeCategory) {
        errs.causeCategory = 'Please select a cause category'
      }
    }
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const buildPayload = () => ({
    title: title.trim(),
    description: description.trim() || ' ',
    causeCategory: causeCategory || 'Community',
    nonprofitId: nonprofitId || undefined,
    location: location.trim() || undefined,
    eventDate: eventDate ? (eventTime ? `${eventDate}T${eventTime}:00` : eventDate) : undefined,
    isPrivate,
    requiresPeerReview,
  })

  const ensureDraft = async (): Promise<string> => {
    const payload = buildPayload()
    if (draftId) {
      await dispatch(updateEventThunk({ id: draftId, data: payload })).unwrap()
      return draftId
    }
    const event = await dispatch(createEventThunk(payload)).unwrap()
    setDraftId(event.id)
    if (heroImage) {
      await eventService.updateHeroImage(event.id, heroImage.publicId, heroImage.url)
    }
    return event.id
  }

  const handleUploadImage = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const sigRes = await eventService.getUploadSignature('events')
      const sig = sigRes.data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', sig.api_key)
      formData.append('timestamp', String(sig.timestamp))
      formData.append('signature', sig.signature)
      formData.append('folder', sig.folder)
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
        { method: 'POST', body: formData }
      )
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error?.message ?? 'Upload failed')
      const hi: HeroImage = { publicId: uploadData.public_id, url: uploadData.secure_url }
      setHeroImage(hi)
      setHeroPreview(uploadData.secure_url)
      if (draftId) {
        await eventService.updateHeroImage(draftId, hi.publicId, hi.url)
      }
    } catch (e: any) {
      setError(e.message ?? 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!validate(false)) return
    setError(null)
    try {
      await ensureDraft()
      navigate('/dashboard')
    } catch (e: any) {
      setError(e.message ?? 'Failed to save draft')
    }
  }

  const handlePreview = async () => {
    if (!validate(false)) return
    setError(null)
    try {
      const id = await ensureDraft()
      navigate(`/events/${id}`)
    } catch (e: any) {
      setError(e.message ?? 'Failed to save event')
    }
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setError(null)
    try {
      const id = await ensureDraft()
      await dispatch(submitEventThunk(id)).unwrap()
      navigate('/events/submission-status')
    } catch (e: any) {
      setError(e.message ?? 'Failed to submit event')
    }
  }

  const clearField = (field: string) => {
    if (fieldErrors[field]) setFieldErrors(p => { const n = { ...p }; delete n[field]; return n })
  }

  return (
    <div className="min-h-screen lg:flex lg:justify-center" style={{ backgroundColor: '#F0F4FA' }}>
      <div className="flex flex-col min-h-screen lg:min-h-0 lg:w-full lg:max-w-[720px]">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-10"
        style={{ borderBottom: '1px solid #EEF3FB' }}
      >
        <button onClick={() => navigate('/dashboard')} className="p-1">
          <ArrowLeft size={20} style={{ color: '#414750' }} />
        </button>
        <h1 className="text-[16px] font-bold" style={{ fontFamily: "'Roboto', sans-serif", color: '#111827' }}>
          Create event
        </h1>
        <button
          onClick={handleSaveDraft}
          disabled={loading}
          className="text-[14px] disabled:opacity-50"
          style={{ color: '#1A6EB5', fontFamily: "'Roboto', sans-serif" }}
        >
          {draftId ? 'Update draft' : 'Save draft'}
        </button>
      </header>

      <div className="flex-1 px-4 py-4 flex flex-col gap-4 pb-28">
        {/* Error banner */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 flex items-start gap-2 text-[13px]"
            style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontFamily: "'Roboto', sans-serif" }}
          >
            <span className="mt-0.5">⚠</span>
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)}><X size={14} /></button>
          </div>
        )}

        {/* Cover image upload */}
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="rounded-2xl overflow-hidden cursor-pointer"
          style={{ border: heroPreview ? 'none' : '2px dashed #93C5FD' }}
        >
          {heroPreview ? (
            <div className="relative">
              <img src={heroPreview} alt="Cover" className="w-full h-48 object-cover rounded-2xl" />
              <button
                onClick={e => { e.stopPropagation(); setHeroImage(null); setHeroPreview(null) }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              >
                <X size={14} color="white" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-2"
              style={{ backgroundColor: '#F4F8FC' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#EBF3FC' }}>
                {uploading
                  ? <div className="w-5 h-5 rounded-full border-2 border-[#1A6EB5] border-t-transparent animate-spin" />
                  : <ImagePlus size={22} style={{ color: '#1A6EB5' }} />
                }
              </div>
              <p className="text-[14px] font-semibold" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
                {uploading ? 'Uploading...' : 'Add cover photo'}
              </p>
              <p className="text-[12px]" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
                High quality media helps your event stand out
              </p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) { handleUploadImage(f); e.target.value = '' } }}
        />

        {/* Event name */}
        <div>
          <input
            value={title}
            onChange={e => { setTitle(e.target.value); clearField('title') }}
            placeholder="Name your event..."
            className="w-full px-4 py-4 text-[18px] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A6EB5]"
            style={{
              backgroundColor: '#EEF3FB',
              fontFamily: "'Roboto', sans-serif",
              color: '#111827',
              border: fieldErrors.title ? '1.5px solid #DC2626' : '1.5px solid transparent',
            }}
          />
          {fieldErrors.title && (
            <p className="text-[12px] mt-1 ml-1" style={{ color: '#DC2626', fontFamily: "'Roboto', sans-serif" }}>
              {fieldErrors.title}
            </p>
          )}
        </div>

        {/* Cause category */}
        <div>
          <p className="text-[11px] font-bold mb-2"
            style={{ color: '#414750', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em' }}>
            CAUSE CATEGORY
          </p>
          <select
            value={causeCategory}
            onChange={e => { setCauseCategory(e.target.value); clearField('causeCategory') }}
            className="w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1A6EB5] appearance-none"
            style={{
              backgroundColor: '#EEF3FB',
              color: causeCategory ? '#111827' : '#9CA3AF',
              fontFamily: "'Roboto', sans-serif",
              border: fieldErrors.causeCategory ? '1.5px solid #DC2626' : '1.5px solid transparent',
            }}
          >
            <option value="">Select a cause...</option>
            {CAUSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {fieldErrors.causeCategory && (
            <p className="text-[12px] mt-1 ml-1" style={{ color: '#DC2626', fontFamily: "'Roboto', sans-serif" }}>
              {fieldErrors.causeCategory}
            </p>
          )}
        </div>

        {/* Nonprofit partner */}
        <div>
          <p className="text-[11px] font-bold mb-2"
            style={{ color: '#414750', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em' }}>
            NONPROFIT PARTNER
          </p>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{ backgroundColor: '#EEF3FB', border: '1px solid #DCE9F5' }}>
            <Building2 size={15} style={{ color: '#1A6EB5', flexShrink: 0 }} />
            <select
              value={nonprofitId}
              onChange={e => setNonprofitId(e.target.value)}
              className="flex-1 text-[13px] bg-transparent focus:outline-none appearance-none"
              style={{ color: nonprofitId ? '#111827' : '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}
            >
              <option value="">No nonprofit (independent event)</option>
              {nonprofits.map(np => (
                <option key={np.id} value={np.id}>{np.organization_name}</option>
              ))}
            </select>
          </div>
          {nonprofitId && (
            <p className="text-[11px] mt-1.5 ml-1" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
              This nonprofit will review and approve your event before it goes live.
            </p>
          )}
        </div>

        {/* Date & Time */}
        <div>
          <p className="text-[11px] font-bold mb-3"
            style={{ color: '#414750', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em' }}>
            WHEN
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] relative"
              style={{
                backgroundColor: eventDate ? '#1A6EB5' : '#EEF3FB',
                color: eventDate ? 'white' : '#414750',
                fontFamily: "'Roboto', sans-serif",
                border: '1px solid #DCE9F5',
              }}
            >
              <Calendar size={14} />
              {eventDate ? new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}
            </button>
            <button
              type="button"
              onClick={() => timeInputRef.current?.showPicker?.() ?? timeInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px]"
              style={{
                backgroundColor: eventTime ? '#1A6EB5' : '#EEF3FB',
                color: eventTime ? 'white' : '#414750',
                fontFamily: "'Roboto', sans-serif",
                border: '1px solid #DCE9F5',
              }}
            >
              <Clock size={14} />
              {eventTime || 'Add Time'}
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px]"
              style={{ backgroundColor: '#EEF3FB', color: '#414750', fontFamily: "'Roboto', sans-serif", border: '1px solid #DCE9F5' }}
            >
              <RefreshCcw size={14} />
              Does not repeat
            </button>
          </div>
          {/* Hidden date/time inputs */}
          <input ref={dateInputRef} type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="sr-only" />
          <input ref={timeInputRef} type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} className="sr-only" />
        </div>

        {/* Location */}
        <div>
          <p className="text-[11px] font-bold mb-2"
            style={{ color: '#414750', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em' }}>
            LOCATION
          </p>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{ backgroundColor: '#EEF3FB', border: '1px solid #DCE9F5' }}>
            <MapPin size={15} style={{ color: '#1A6EB5', flexShrink: 0 }} />
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Add a location or online link..."
              className="flex-1 text-[13px] bg-transparent focus:outline-none"
              style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: fieldErrors.description ? '1.5px solid #DC2626' : '1.5px solid #DCE9F5' }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5"
              style={{ backgroundColor: '#F4F8FC', borderBottom: '1px solid #DCE9F5' }}>
              {[Bold, Italic].map((Icon, i) => (
                <button key={i} className="p-1 rounded hover:bg-gray-200">
                  <Icon size={15} style={{ color: '#414750' }} />
                </button>
              ))}
              <div className="w-px h-4 mx-1" style={{ backgroundColor: '#DCE9F5' }} />
              {[List, Link].map((Icon, i) => (
                <button key={i} className="p-1 rounded hover:bg-gray-200">
                  <Icon size={15} style={{ color: '#414750' }} />
                </button>
              ))}
            </div>
            <textarea
              value={description}
              onChange={e => { setDescription(e.target.value); clearField('description') }}
              placeholder="Tell the story of your event... What will happen? Why should people join?"
              rows={6}
              className="w-full px-4 py-3 text-[14px] resize-none focus:outline-none"
              style={{ fontFamily: "'Roboto', sans-serif", color: '#111827', backgroundColor: 'white' }}
            />
          </div>
          {fieldErrors.description && (
            <p className="text-[12px] mt-1 ml-1" style={{ color: '#DC2626', fontFamily: "'Roboto', sans-serif" }}>
              {fieldErrors.description}
            </p>
          )}
        </div>

        {/* Settings toggles */}
        <div className="rounded-xl px-4 py-4 flex flex-col gap-4" style={{ backgroundColor: '#EEF3FB' }}>
          <p className="text-[11px] font-bold"
            style={{ color: '#414750', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em' }}>
            SETTINGS
          </p>
          <Toggle
            label="Private event"
            description="Only invited people can see this"
            value={isPrivate}
            onChange={setIsPrivate}
          />
          <Toggle
            label="Peer review"
            description="Require community review before going live"
            value={requiresPeerReview}
            onChange={setRequiresPeerReview}
          />
        </div>
      </div>
      </div>

      {/* Bottom action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 lg:left-1/2 lg:-translate-x-1/2 lg:max-w-[720px] bg-white flex items-center gap-3 px-4 py-3 z-20"
        style={{ borderTop: '1px solid #EEF3FB', boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}
      >
        <button
          onClick={handlePreview}
          disabled={loading || uploading}
          className="flex-shrink-0 px-6 py-3.5 rounded-full text-[14px] font-semibold disabled:opacity-50"
          style={{ color: '#414750', backgroundColor: '#EEF3FB', fontFamily: "'Roboto', sans-serif" }}
        >
          Preview
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || uploading}
          className="flex-1 py-3.5 rounded-full text-white text-[14px] font-bold disabled:opacity-60"
          style={{ backgroundColor: '#F59E0B', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em' }}
        >
          {loading ? 'SUBMITTING...' : 'SUBMIT FOR APPROVAL'}
        </button>
      </div>
    </div>
  )
}

function Toggle({ label, description, value, onChange }: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[14px] font-medium" style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
          {label}
        </p>
        <p className="text-[12px]" style={{ color: '#9CA3AF', fontFamily: "'Roboto', sans-serif" }}>
          {description}
        </p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-12 h-6 rounded-full transition-colors relative flex-shrink-0"
        style={{ backgroundColor: value ? '#1A6EB5' : '#D1D5DB' }}
      >
        <div
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
          style={{ left: value ? '26px' : '4px' }}
        />
      </button>
    </div>
  )
}
