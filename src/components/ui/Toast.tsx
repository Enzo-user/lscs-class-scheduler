import type { ToastMessage } from '../../hooks/useToast'

export interface ToastProps {
  toast: ToastMessage | null
}

/**
 * Feedback for add/remove actions. The live region is always mounted so
 * screen readers pick up changes; the message is keyed by id so repeating
 * the same text is still announced (the node is replaced, not reused).
 */
export function Toast({ toast }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
    >
      {toast && (
        <p
          key={toast.id}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white shadow-lg motion-safe:animate-fade-in"
        >
          {toast.text}
        </p>
      )}
    </div>
  )
}
