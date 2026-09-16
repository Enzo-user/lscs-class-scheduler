import { useCallback, useEffect, useRef, useState } from 'react'

export interface ToastMessage {
  /** Increments per message so identical texts still re-render. */
  id: number
  text: string
}

const DEFAULT_DURATION_MS = 3000

/** Holds the single current toast and clears it automatically after `durationMs`. */
export function useToast(durationMs = DEFAULT_DURATION_MS) {
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const nextId = useRef(0)

  const showToast = useCallback(
    (text: string) => {
      clearTimeout(timer.current)
      nextId.current += 1
      setToast({ id: nextId.current, text })
      timer.current = setTimeout(() => setToast(null), durationMs)
    },
    [durationMs],
  )

  // Do not leave a timer running after the component that owns the toast unmounts.
  useEffect(() => () => clearTimeout(timer.current), [])

  return { toast, showToast }
}
