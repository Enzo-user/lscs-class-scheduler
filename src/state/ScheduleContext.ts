import { createContext, useContext } from 'react'

export interface ScheduleContextValue {
  /** courseId → sectionId of everything on the schedule. */
  selected: Record<string, string>
  /** Adds a section, replacing any other section of the same course. */
  addSection: (courseId: string, sectionId: string) => void
  /** Removes whichever section of the course is on the schedule. */
  removeCourse: (courseId: string) => void
  /** Empties the schedule. */
  clear: () => void
}

// Kept in a .ts file (no components) so React Fast Refresh keeps working.
export const ScheduleContext = createContext<ScheduleContextValue | null>(null)

/** Reads the schedule; must be rendered inside a ScheduleProvider. */
export function useSchedule(): ScheduleContextValue {
  const value = useContext(ScheduleContext)
  if (value === null) {
    throw new Error('useSchedule must be used within a ScheduleProvider')
  }
  return value
}
