import type { Course, ScheduleSlot, Section } from '../types/course'

/** Builds a section with sensible defaults; override only what a test cares about. */
export function makeSection(overrides: Partial<Section> & { id: string }): Section {
  return {
    section: overrides.id.split('-')[1] ?? 'S11',
    instructor: 'Juan Dela Cruz',
    room: 'G301',
    schedule: [slot('Monday', '09:15', '10:45'), slot('Thursday', '09:15', '10:45')],
    ...overrides,
  }
}

/** Builds a course whose id and code are the same, like the real catalogue. */
export function makeCourse(overrides: Partial<Course> & { id: string }): Course {
  return {
    code: overrides.id,
    title: `${overrides.id} title`,
    units: 3,
    sections: [makeSection({ id: `${overrides.id}-S11` })],
    ...overrides,
  }
}

export function slot(day: ScheduleSlot['day'], startTime: string, endTime: string): ScheduleSlot {
  return { day, startTime, endTime }
}
