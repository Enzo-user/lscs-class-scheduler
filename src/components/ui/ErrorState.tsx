import { Button } from './Button'

export interface ErrorStateProps {
  message: string
  onRetry: () => void
}

/** Shown when the catalogue cannot be loaded; `role="alert"` announces it immediately. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center">
      <p className="font-medium text-red-800">Could not load courses</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      <Button variant="primary" className="mt-4" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
