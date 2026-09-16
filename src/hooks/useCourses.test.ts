import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getCourses } from '../api/coursesApi'
import { makeCourse } from '../test/fixtures'
import type { Course } from '../types/course'
import { useCourses } from './useCourses'

vi.mock('../api/coursesApi')
const getCoursesMock = vi.mocked(getCourses)

/** A getCourses stand-in the test resolves by hand, which also rejects if its signal aborts. */
function deferred() {
  let resolve: (courses: Course[]) => void = () => {}
  const promise = new Promise<Course[]>((res) => {
    resolve = res
  })
  const impl = (signal?: AbortSignal) =>
    new Promise<Course[]>((res, rej) => {
      signal?.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError')))
      promise.then(res)
    })
  return { impl, resolve }
}

afterEach(() => {
  getCoursesMock.mockReset()
})

describe('useCourses', () => {
  it('starts loading and moves to success with the fetched data', async () => {
    const courses = [makeCourse({ id: 'CCPROG3' })]
    getCoursesMock.mockResolvedValue(courses)

    const { result } = renderHook(() => useCourses())
    expect(result.current.status).toBe('loading')

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.status === 'success' && result.current.data).toEqual(courses)
  })

  it('exposes the error and recovers on refetch', async () => {
    getCoursesMock.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce([])

    const { result } = renderHook(() => useCourses())
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.status === 'error' && result.current.error.message).toBe('boom')

    act(() => result.current.refetch())
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('success'))
  })

  it('aborts the in-flight request on refetch and ignores its rejection', async () => {
    const first = deferred()
    const second = deferred()
    getCoursesMock.mockImplementationOnce(first.impl).mockImplementationOnce(second.impl)

    const { result } = renderHook(() => useCourses())
    act(() => result.current.refetch())

    const firstSignal = getCoursesMock.mock.calls[0]?.[0]
    expect(firstSignal?.aborted).toBe(true)

    const courses = [makeCourse({ id: 'CCDSTRU' })]
    second.resolve(courses)
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.status === 'success' && result.current.data).toEqual(courses)
  })

  it('aborts the request when unmounted', () => {
    const pending = deferred()
    getCoursesMock.mockImplementationOnce(pending.impl)

    const { unmount } = renderHook(() => useCourses())
    unmount()

    expect(getCoursesMock.mock.calls[0]?.[0]?.aborted).toBe(true)
  })
})
