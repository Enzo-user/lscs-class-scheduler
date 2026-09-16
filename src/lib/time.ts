import type { Day, ScheduleSlot } from '../types/course'

/** Days in timetable column order. */
export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const satisfies readonly Day[]

const DAY_ABBREVIATIONS: Record<Day, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

/**
 * Type guard for the Day union, used when validating API responses.
 * `Object.hasOwn` rather than `in`, so inherited keys such as "toString" are rejected.
 */
export function isDay(value: unknown): value is Day {
  return typeof value === 'string' && Object.hasOwn(DAY_ABBREVIATIONS, value)
}

/** True for a well-formed 24-hour "HH:mm" string such as "09:15". */
export function isTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_PATTERN.test(value)
}

/** Three-letter abbreviation of a day, e.g. "Monday" → "Mon". */
export function abbreviateDay(day: Day): string {
  return DAY_ABBREVIATIONS[day]
}

/** Converts "HH:mm" to minutes since midnight, e.g. "09:15" → 555. */
export function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours ?? 0) * 60 + (minutes ?? 0)
}

/** Formats "HH:mm" on a 12-hour clock, e.g. "07:30" → "7:30 AM", "14:15" → "2:15 PM". */
export function formatTime(time: string): string {
  return `${formatClock(time)} ${meridiem(time)}`
}

/** Formats a range, sharing the AM/PM suffix when both ends agree: "9:15–10:45 AM", "11:00 AM–12:30 PM". */
export function formatTimeRange(startTime: string, endTime: string): string {
  if (meridiem(startTime) === meridiem(endTime)) {
    return `${formatClock(startTime)}–${formatTime(endTime)}`
  }
  return `${formatTime(startTime)}–${formatTime(endTime)}`
}

/**
 * Formats a whole schedule compactly, merging days that share the same time:
 * Monday + Thursday 09:15–10:45 → "Mon/Thu 9:15–10:45 AM". Meetings at
 * different times are joined with ", ". An empty schedule reads "TBA".
 */
export function formatSchedule(schedule: ScheduleSlot[]): string {
  if (schedule.length === 0) return 'TBA'

  const daysByTime = new Map<string, Day[]>()
  for (const slot of schedule) {
    const key = `${slot.startTime}-${slot.endTime}`
    daysByTime.set(key, [...(daysByTime.get(key) ?? []), slot.day])
  }

  return [...daysByTime.entries()]
    .map(([key, days]) => {
      const [startTime = '', endTime = ''] = key.split('-')
      const sortedDays = [...days].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b))
      return `${sortedDays.map(abbreviateDay).join('/')} ${formatTimeRange(startTime, endTime)}`
    })
    .join(', ')
}

function formatClock(time: string): string {
  const minutes = parseTime(time)
  const hours12 = Math.floor(minutes / 60) % 12 || 12
  const remainder = minutes % 60
  return `${hours12}:${String(remainder).padStart(2, '0')}`
}

function meridiem(time: string): 'AM' | 'PM' {
  return parseTime(time) < 12 * 60 ? 'AM' : 'PM'
}
