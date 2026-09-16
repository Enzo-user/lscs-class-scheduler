import type { Course, ScheduleSlot, Section } from '../types/course'
import { DAYS, formatTime, parseTime } from './time'

/** A section the student has put on their schedule, resolved to its course. */
export interface SelectedSection {
  course: Course
  section: Section
}

/**
 * True when two meetings share a day and their time ranges overlap.
 * Touching ranges (09:00 end, 09:00 start) do not overlap.
 */
export function slotsOverlap(a: ScheduleSlot, b: ScheduleSlot): boolean {
  if (a.day !== b.day) return false
  return parseTime(a.startTime) < parseTime(b.endTime) && parseTime(b.startTime) < parseTime(a.endTime)
}

/** True when any meeting of `a` overlaps any meeting of `b`. */
export function sectionsConflict(a: Section, b: Section): boolean {
  return a.schedule.some((slotA) => b.schedule.some((slotB) => slotsOverlap(slotA, slotB)))
}

/**
 * Returns the selected sections that clash with `candidate`. Sections of the
 * candidate's own course are skipped because picking the candidate would
 * replace them rather than sit alongside them.
 */
export function findConflicts(
  candidate: SelectedSection,
  selected: SelectedSection[],
): SelectedSection[] {
  return selected.filter(
    (entry) =>
      entry.course.id !== candidate.course.id && sectionsConflict(entry.section, candidate.section),
  )
}

/** Sum of the units of the given courses. */
export function totalUnits(courses: Course[]): number {
  return courses.reduce((sum, course) => sum + course.units, 0)
}

/**
 * Looks up the `selected` map (courseId → sectionId) against the catalogue.
 * Entries whose course or section no longer exists are dropped silently, so a
 * stale persisted selection cannot break rendering.
 */
export function resolveSelectedSections(
  courses: Course[],
  selected: Record<string, string>,
): SelectedSection[] {
  const result: SelectedSection[] = []
  for (const [courseId, sectionId] of Object.entries(selected)) {
    const course = courses.find((c) => c.id === courseId)
    const section = course?.sections.find((s) => s.id === sectionId)
    if (course && section) result.push({ course, section })
  }
  return result
}

/** Height of one CSS grid row in the timetable, in minutes. */
export const TIMETABLE_STEP_MINUTES = 15

/** Default visible window; classes run 07:30–19:30 so this leaves a margin either side. */
export const DEFAULT_TIMETABLE_RANGE = { startTime: '07:00', endTime: '21:30' }

export interface TimetableBlock {
  /** Unique per rendered block (a section meeting twice a week yields two blocks). */
  key: string
  course: Course
  section: Section
  slot: ScheduleSlot
  /** 0-based column, in DAYS order (Monday = 0). */
  dayIndex: number
  /** 1-based CSS grid row where the block starts. */
  startRow: number
  /** Exclusive end row, i.e. `grid-row: startRow / endRow`. */
  endRow: number
}

export interface TimetableLayout {
  /** Number of CSS grid rows covering the whole time window. */
  rowCount: number
  /** One label per full hour in the window, e.g. { row: 1, label: "7:00 AM" }. */
  hourLabels: { row: number; label: string }[]
  blocks: TimetableBlock[]
}

/**
 * Maps selected sections to positioned timetable blocks so the Timetable
 * component only has to place `grid-column`/`grid-row` values. Meetings that
 * fall outside the window are clamped to its edges.
 */
export function buildTimetable(
  entries: SelectedSection[],
  range = DEFAULT_TIMETABLE_RANGE,
): TimetableLayout {
  const startMinutes = parseTime(range.startTime)
  const endMinutes = parseTime(range.endTime)
  const rowCount = Math.ceil((endMinutes - startMinutes) / TIMETABLE_STEP_MINUTES)

  const toRow = (minutes: number) => {
    const clamped = Math.min(Math.max(minutes, startMinutes), endMinutes)
    return Math.floor((clamped - startMinutes) / TIMETABLE_STEP_MINUTES) + 1
  }

  const hourLabels: TimetableLayout['hourLabels'] = []
  for (let minutes = Math.ceil(startMinutes / 60) * 60; minutes < endMinutes; minutes += 60) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0')
    hourLabels.push({ row: toRow(minutes), label: formatTime(`${hours}:00`) })
  }

  const blocks: TimetableBlock[] = entries.flatMap(({ course, section }) =>
    section.schedule.map((slot) => ({
      key: `${section.id}-${slot.day}`,
      course,
      section,
      slot,
      dayIndex: DAYS.indexOf(slot.day),
      startRow: toRow(parseTime(slot.startTime)),
      endRow: toRow(parseTime(slot.endTime)),
    })),
  )

  return { rowCount, hourLabels, blocks }
}
