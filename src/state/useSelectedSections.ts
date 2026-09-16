import { useMemo } from 'react'
import { resolveSelectedSections, type SelectedSection } from '../lib/schedule'
import type { Course } from '../types/course'
import { useSchedule } from './ScheduleContext'

/** The schedule as {course, section} pairs, recomputed only when the catalogue or selection changes. */
export function useSelectedSections(courses: Course[]): SelectedSection[] {
  const { selected } = useSchedule()
  return useMemo(() => resolveSelectedSections(courses, selected), [courses, selected])
}
