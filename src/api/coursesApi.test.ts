import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeCourse } from '../test/fixtures'
import { ApiError, getCourses } from './coursesApi'

const fetchMock = vi.fn<typeof fetch>()

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Waits for `promise` while advancing fake timers past the simulated latency. */
async function settle<T>(promise: Promise<T>): Promise<T> {
  const [result] = await Promise.all([promise, vi.advanceTimersByTimeAsync(1000)])
  return result
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('fetch', fetchMock)
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

describe('getCourses', () => {
  it('fetches the catalogue from the data base URL and returns the courses', async () => {
    const courses = [makeCourse({ id: 'CCPROG3' })]
    fetchMock.mockResolvedValue(jsonResponse({ courses }))

    await expect(settle(getCourses())).resolves.toEqual(courses)
    expect(fetchMock).toHaveBeenCalledWith('/data/courses.json', expect.objectContaining({}))
  })

  it('throws an ApiError carrying the HTTP status for non-2xx responses', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'nope' }, 503))

    const promise = settle(getCourses())
    await expect(promise).rejects.toBeInstanceOf(ApiError)
    await expect(promise).rejects.toMatchObject({ status: 503 })
  })

  it('rejects payloads that do not match the expected shape', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ courses: [{ id: 'X', sections: 'oops' }] }))

    await expect(settle(getCourses())).rejects.toThrow(/Unexpected response shape/)
  })

  it('fails on purpose when the page URL has ?mockError=1', async () => {
    window.history.replaceState(null, '', '/?mockError=1')

    await expect(settle(getCourses())).rejects.toMatchObject({ name: 'ApiError', status: 500 })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects with an AbortError and skips fetch when aborted during the delay', async () => {
    const controller = new AbortController()
    const promise = getCourses(controller.signal)
    controller.abort()

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
