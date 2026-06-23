import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarPlus, Calendar, Star, User, LogOut } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '../../hooks/useAuth'
import { TIER_COLORS } from '../../utils/constants'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/events/create', label: 'Create Event', icon: CalendarPlus },
  { to: '/events', label: 'My Events', icon: Calendar },
  { to: '/recognition', label: 'Recognition', icon: Star },
  { to: '/profile', label: 'Profile', icon: User },
]

export function Navbar() {
  const { seProfile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-100 flex flex-col py-6 px-4 z-40">
      <div className="mb-8 px-2">
        <span className="text-xl font-bold text-[#7C3AED]">CharityHub</span>
      </div>

      {seProfile && (
        <div className="flex items-center gap-3 mb-6 px-2 py-3 bg-gray-50 rounded-xl">
          {seProfile.avatarUrl ? (
            <img src={seProfile.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-sm font-semibold">
              {seProfile.displayName?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{seProfile.displayName}</p>
            <span
              className="text-xs font-medium"
              style={{ color: TIER_COLORS[seProfile.recognitionTier] ?? '#7C3AED' }}
            >
              {seProfile.recognitionTier}
            </span>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#7C3AED] text-white'
                    : 'text-gray-600 hover:bg-gray-100',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <LogOut size={18} />
        Sign out
      </button>
    </nav>
  )
}
