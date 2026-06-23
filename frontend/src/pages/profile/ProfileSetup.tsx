import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Link, Share2, Globe } from 'lucide-react'
import { Input } from '../../components/common/Input'
import { useProfile } from '../../hooks/useProfile'

export default function ProfileSetup() {
  const navigate = useNavigate()
  const { updateProfile, loading } = useProfile()
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')

  const handleFinish = async () => {
    await updateProfile({ displayName, bio })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F0F4FA' }}>
      <div className="w-full max-w-[390px]">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h1 className="text-[22px] font-bold text-center mb-2" style={{ fontFamily: "'Roboto', sans-serif", color: '#1A6EB5' }}>
            Set up your profile
          </h1>
          <p className="text-[14px] text-center mb-8" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
            Let the community know who you are.
          </p>

          {/* Avatar upload */}
          <div className="flex justify-center mb-8">
            <button className="w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1"
              style={{ border: '2px dashed #93C5FD', backgroundColor: '#F4F8FC' }}>
              <Camera size={22} style={{ color: '#9CA3AF' }} />
              <span className="text-[11px]" style={{ color: '#9CA3AF' }}>+</span>
            </button>
          </div>

          <div className="flex flex-col gap-5 mb-6">
            <Input
              label="Display Name"
              placeholder="E.g. Alex Creator"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px]" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
                One-line Bio
              </label>
              <textarea
                placeholder="What drives you to create?"
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={2}
                className="w-full px-4 py-3.5 text-[15px] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#1A6EB5]"
                style={{ backgroundColor: '#F4F8FC', fontFamily: "'Roboto', sans-serif", color: '#111827' }}
              />
            </div>

            <div>
              <p className="text-[14px] text-center mb-3" style={{ color: '#414750', fontFamily: "'Roboto', sans-serif" }}>
                Connect Socials
              </p>
              <div className="flex justify-center gap-4">
                {[Link, Share2, Globe].map((Icon, i) => (
                  <button key={i} className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#EBF3FC' }}>
                    <Icon size={18} style={{ color: '#1A6EB5' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleFinish}
            disabled={loading}
            className="w-full py-4 rounded-full text-white text-[14px] font-bold flex items-center justify-center mb-3 disabled:opacity-60"
            style={{ backgroundColor: '#F59E0B', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.08em' }}
          >
            {loading ? 'SAVING...' : 'FINISH SETUP'}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full text-center text-[14px] py-2"
            style={{ color: '#1A6EB5', fontFamily: "'Roboto', sans-serif" }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
