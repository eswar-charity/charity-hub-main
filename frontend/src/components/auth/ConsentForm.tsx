import { Button } from '../common/Button'

interface Props {
  guardianEmail: string
  onConfirm: () => void
  loading?: boolean
}

export function ConsentForm({ guardianEmail, onConfirm, loading }: Props) {
  return (
    <div className="flex flex-col gap-4 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
      <div>
        <h3 className="font-semibold text-gray-900">Parental Consent Required</h3>
        <p className="mt-1 text-sm text-gray-600">
          A consent email has been sent to <strong>{guardianEmail}</strong>. Your guardian must approve before you can create events.
        </p>
      </div>
      <Button onClick={onConfirm} loading={loading} variant="navy" size="sm">
        I've confirmed with my guardian
      </Button>
    </div>
  )
}
