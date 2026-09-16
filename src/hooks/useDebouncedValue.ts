import { useEffect, useState } from 'react'

/**
 * Returns `value` once it has stopped changing for `delayMs`. The search box
 * stays instantly responsive (it is bound to the raw value) while filtering
 * runs on the debounced one, so fast typing does not filter on every key.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
