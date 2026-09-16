import { isDay, isTime } from '../lib/time'
import type { Course, CoursesResponse, ScheduleSlot, Section } from '../types/course'

/**
 * Where the catalogue lives. Today it is the static file public/data/courses.json;
 * pointing VITE_API_BASE_URL at a real backend that serves the same JSON shape
 * is the only change needed to go live.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/data'
const COURSES_PATH = '/courses.json'

/**
 * Artificial delay so loading states are visible with a local static file.
 * Remove when a real API exists.
 */
const SIMULATED_LATENCY_MS = 500

/**
 * Append `?mockError=1` to the page URL to make every request fail. This
 * exists only to demonstrate the error state; remove alongside the mock data.
 */
const MOCK_ERROR_PARAM = 'mockError'

/** Thrown for non-2xx responses and malformed payloads; `status` is the HTTP status. */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Fetches the full course catalogue. Pass an AbortSignal to cancel. */
export async function getCourses(signal?: AbortSignal): Promise<Course[]> {
  await delay(SIMULATED_LATENCY_MS, signal)

  if (new URLSearchParams(window.location.search).has(MOCK_ERROR_PARAM)) {
    throw new ApiError('Simulated server error (mockError is set in the URL)', 500)
  }

  const response = await fetch(`${API_BASE_URL}${COURSES_PATH}`, { signal })
  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status)
  }

  const body: unknown = await response.json()
  if (!isCoursesResponse(body)) {
    throw new ApiError('Unexpected response shape from courses endpoint', response.status)
  }
  return body.courses
}

/** Resolves after `ms`, or rejects the way fetch does if the signal aborts first. */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError())
      return
    }
    const onAbort = () => {
      clearTimeout(timer)
      reject(abortError())
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function abortError(): DOMException {
  return new DOMException('The request was aborted', 'AbortError')
}

// ---- Runtime validation ----------------------------------------------------
// The JSON is typed on the way in so a malformed payload fails loudly here
// instead of as an undefined property deep inside a component.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isScheduleSlot(value: unknown): value is ScheduleSlot {
  return isRecord(value) && isDay(value.day) && isTime(value.startTime) && isTime(value.endTime)
}

function isSection(value: unknown): value is Section {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.section === 'string' &&
    typeof value.instructor === 'string' &&
    typeof value.room === 'string' &&
    Array.isArray(value.schedule) &&
    value.schedule.every(isScheduleSlot)
  )
}

function isCourse(value: unknown): value is Course {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.code === 'string' &&
    typeof value.title === 'string' &&
    typeof value.units === 'number' &&
    Array.isArray(value.sections) &&
    value.sections.every(isSection)
  )
}

function isCoursesResponse(value: unknown): value is CoursesResponse {
  return isRecord(value) && Array.isArray(value.courses) && value.courses.every(isCourse)
}
