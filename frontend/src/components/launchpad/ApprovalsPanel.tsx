interface Props {
  pendingCount: number
  onReviewAll: () => void
}

export function ApprovalsPanel({ pendingCount, onReviewAll }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #EEF3FB' }}>
      <p className="text-[11px] font-bold mb-4"
        style={{ color: '#9CA3AF', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.1em' }}>
        APPROVALS
      </p>
      <div className="flex items-start justify-between">
        <div className="relative inline-block">
          <p className="text-[48px] font-bold leading-none" style={{ color: '#111827', fontFamily: "'Roboto', sans-serif" }}>
            {pendingCount}
          </p>
          {pendingCount > 0 && (
            <span
              className="absolute -top-1 -right-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: '#EF4444', fontFamily: "'Roboto', sans-serif" }}
            >
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </div>
        <button
          onClick={onReviewAll}
          className="text-[13px] font-semibold pt-3"
          style={{ color: '#1A6EB5', fontFamily: "'Roboto', sans-serif" }}
        >
          REVIEW ALL →
        </button>
      </div>
      <p className="text-[13px] mt-1" style={{ color: '#6B7280', fontFamily: "'Roboto', sans-serif" }}>
        pending actions
      </p>
    </div>
  )
}
