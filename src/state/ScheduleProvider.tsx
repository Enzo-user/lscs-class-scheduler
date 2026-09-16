import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { ScheduleContext, type ScheduleContextValue } from './ScheduleContext'
import { scheduleReducer } from './scheduleReducer'
import { loadScheduleState, saveScheduleState } from './scheduleStorage'

/** Owns the schedule state, restores it from localStorage and persists every change. */
export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scheduleReducer, undefined, loadScheduleState)

  useEffect(() => {
    saveScheduleState(state)
  }, [state])

  // `dispatch` never changes, so these callbacks keep one identity for the
  // life of the provider. That lets memoised list items (SectionItem) skip
  // re-rendering when an unrelated course is added or removed.
  const addSection = useCallback(
    (courseId: string, sectionId: string) => dispatch({ type: 'ADD_SECTION', courseId, sectionId }),
    [],
  )
  const removeCourse = useCallback(
    (courseId: string) => dispatch({ type: 'REMOVE_COURSE', courseId }),
    [],
  )
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), [])

  // Memoised so consumers only re-render when the selection actually changes.
  const value = useMemo<ScheduleContextValue>(
    () => ({ selected: state.selected, addSection, removeCourse, clear }),
    [state.selected, addSection, removeCourse, clear],
  )

  return <ScheduleContext value={value}>{children}</ScheduleContext>
}
