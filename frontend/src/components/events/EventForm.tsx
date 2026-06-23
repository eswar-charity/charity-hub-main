import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { createEventSchema, type CreateEventFormData } from '../../utils/validations'
import { CAUSE_CATEGORIES } from '../../utils/constants'

interface Props {
  defaultValues?: Partial<CreateEventFormData>
  onSubmit: (data: CreateEventFormData) => void
  loading?: boolean
  submitLabel?: string
}

export function EventForm({ defaultValues, onSubmit, loading, submitLabel = 'Save' }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateEventFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createEventSchema) as any,
    defaultValues: { isPrivate: false, requiresPeerReview: false, ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Input label="Event Title" placeholder="My Charity Event" {...register('title')} error={errors.title?.message} />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Describe your event..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
        />
        {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Cause Category</label>
        <select
          {...register('causeCategory')}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
        >
          <option value="">Select a category</option>
          {CAUSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.causeCategory && <p className="text-xs text-red-600">{errors.causeCategory.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Location" placeholder="City, Country" {...register('location')} />
        <Input label="Event Date" type="date" {...register('eventDate')} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('isPrivate')} className="w-4 h-4 accent-[#7C3AED]" />
          <span className="text-sm text-gray-700">Private event</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('requiresPeerReview')} className="w-4 h-4 accent-[#7C3AED]" />
          <span className="text-sm text-gray-700">Requires peer review</span>
        </label>
      </div>

      <Button type="submit" loading={loading} size="lg">{submitLabel}</Button>
    </form>
  )
}
