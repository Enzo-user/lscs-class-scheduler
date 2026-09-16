import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { ScheduleContext, type ScheduleContextValue } from './ScheduleContext'
import { scheduleReducer } from './scheduleReducer'
import { loadScheduleState, saveScheduleState } from './scheduleStorage'

/** Owns the schedule state, restores it from localStorage and persists every change. */
export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scheduleReducer, undefined, loadScheduleState)

  useEffect(() => {
    saveScheduleState(state)
  }, [state])

  // Memoised so consumers only re-render when the selection actually changes;
  // `dispatch` is stable, so the callbacks are too.
  const value = useMemo<ScheduleContextValue>(
    () => ({
      selected: state.selected,
      addSection: (courseId, sectionId) => dispatch({ type: 'ADD_SECTION', courseId, sectionId }),
      removeCourse: (courseId) => dispatch({ type: 'REMOVE_COURSE', courseId }),
      clear: () => dispatch({ type: 'CLEAR' }),
    }),
    [state.selected],
  )

  return <ScheduleContext value={value}>{children}</ScheduleContext>
}
