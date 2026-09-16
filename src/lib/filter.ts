import type { Course, Day, Section } from '../types/course'

/**
 * A course with its searchable text precomputed once (lowercased) so that
 * filtering on every keystroke is a plain `includes` over short strings
 * instead of re-normalising the catalogue each time.
 */
export interface IndexedCourse {
  course: Course
  /** "code title", lowercased. */
  courseText: string
  /** Parallel to `course.sections`: "section instructor", lowercased. */
  sectionTexts: string[]
}

/** The search box, day chips and units dropdown, as one value. */
export interface FilterState {
  /** Free-text query; whitespace-separated tokens must all match (AND). */
  query: string
  /** Keep sections that meet on at least one of these days; empty means any day. */
  days: Day[]
  /** Keep courses worth exactly this many units; null means any. */
  units: number | null
}

/** A course together with only the sections that passed the filters. */
export interface FilteredCourse {
  course: Course
  sections: Section[]
}

/** Lowercases and collapses whitespace so comparisons are case- and spacing-insensitive. */
export function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ')
}

/** Splits a query into normalised, non-empty tokens. */
export function tokenize(query: string): string[] {
  return normalize(query).split(' ').filter(Boolean)
}

/** Builds the search index for a catalogue. Call once per fetched course list. */
export function buildSearchIndex(courses: Course[]): IndexedCourse[] {
  return courses.map((course) => ({
    course,
    courseText: normalize(`${course.code} ${course.title}`),
    sectionTexts: course.sections.map((section) =>
      normalize(`${section.section} ${section.instructor}`),
    ),
  }))
}

/**
 * Applies query, day and unit filters. A course stays visible when at least
 * one of its sections matches; the returned `sections` are only the matching
 * ones. Each query token may match the course text or the section text.
 */
export function filterCourses(index: IndexedCourse[], filters: FilterState): FilteredCourse[] {
  const tokens = tokenize(filters.query)
  const result: FilteredCourse[] = []

  for (const { course, courseText, sectionTexts } of index) {
    if (filters.units !== null && course.units !== filters.units) continue

    const sections = course.sections.filter((section, i) => {
      const text = `${courseText} ${sectionTexts[i] ?? ''}`
      return tokens.every((token) => text.includes(token)) && meetsOnAnyDay(section, filters.days)
    })

    if (sections.length > 0) result.push({ course, sections })
  }

  return result
}

function meetsOnAnyDay(section: Section, days: Day[]): boolean {
  if (days.length === 0) return true
  return section.schedule.some((slot) => days.includes(slot.day))
}
