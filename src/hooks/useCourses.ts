import { useCallback, useEffect, useState } from 'react'
import { getCourses } from '../api/coursesApi'
import type { Course } from '../types/course'

/** Loading state of the catalogue as a discriminated union, so `data` only exists on success. */
export type CoursesState =
  | { status: 'loading' }
  | { status: 'success'; data: Course[] }
  | { status: 'error'; error: Error }

export type UseCoursesResult = CoursesState & { refetch: () => void }

/**
 * Loads the course catalogue once on mount and exposes `refetch()` for the
 * error state's retry button.
 *
 * A data-fetching library such as TanStack Query would add caching,
 * deduplication and background refresh that this app cannot use: it has one
 * read-only resource that is fetched exactly once per page load. The
 * AbortController below already covers the one real hazard (a stale response
 * landing after unmount or after a retry), so a small hook is the whole story.
 */
export function useCourses(): UseCoursesResult {
  const [state, setState] = useState<CoursesState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getCourses(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ status: 'error', error: toError(error) })
      })

    return () => controller.abort()
  }, [attempt])

  const refetch = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  return { ...state, refetch }
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value))
}
