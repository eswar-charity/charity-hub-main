import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { useProfile } from '../../hooks/useProfile'
import { CAUSE_CATEGORIES } from '../../utils/constants'

export function ProfileForm() {
  const { profile, updateProfile, loading } = useProfile()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      display_name: '',
      bio: '',
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        display_name: profile.displayName,
        bio: profile.bio ?? '',
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: { display_name: string; bio: string }) => {
    await updateProfile(data as any)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Input
        label="Display Name"
        {...register('display_name', { required: 'Required' })}
        error={errors.display_name?.message}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Handle</label>
        <input
          value={profile?.handle ?? ''}
          readOnly
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400">Handle cannot be changed</p>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Bio</label>
        <textarea
          {...register('bio')}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
          placeholder="Tell your story..."
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Cause Categories</label>
        <div className="flex flex-wrap gap-2">
          {CAUSE_CATEGORIES.map((cat) => (
            <span
              key={cat}
              className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer ${
                profile?.causeCategories?.includes(cat)
                  ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
      <Button type="submit" loading={loading}>Save Changes</Button>
    </form>
  )
}
