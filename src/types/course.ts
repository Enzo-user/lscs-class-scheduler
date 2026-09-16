/**
 * Domain types for the course catalogue. They mirror the JSON served by the
 * API (public/data/courses.json today, a real backend later) field for field,
 * so this file is the single source of truth for the data shape.
 */

/** Days on which classes can be held (DLSU has no Sunday classes). */
export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'

/** One meeting of a section. Times are 24-hour "HH:mm" strings. */
export interface ScheduleSlot {
  day: Day
  startTime: string
  endTime: string
}

/** A concrete offering of a course that a student can enrol in. */
export interface Section {
  /** Globally unique, e.g. "CCPROG3-S11". */
  id: string
  /** Section code as printed on the enrolment system, e.g. "S11". */
  section: string
  instructor: string
  room: string
  schedule: ScheduleSlot[]
}

/** A course in the catalogue together with all its offered sections. */
export interface Course {
  /** Globally unique; equals the course code today. */
  id: string
  code: string
  title: string
  units: number
  sections: Section[]
}

/** Top-level shape of the courses endpoint response. */
export interface CoursesResponse {
  courses: Course[]
}
