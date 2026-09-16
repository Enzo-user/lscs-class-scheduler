/**
 * The student's schedule is a map of courseId → sectionId. Keying by course
 * enforces "one section per course": adding a different section of a course
 * that is already on the schedule replaces the earlier pick, which is how
 * changing a section works.
 */
export interface ScheduleState {
  selected: Record<string, string>
}

export type ScheduleAction =
  | { type: 'ADD_SECTION'; courseId: string; sectionId: string }
  | { type: 'REMOVE_COURSE'; courseId: string }
  | { type: 'CLEAR' }

export const initialScheduleState: ScheduleState = { selected: {} }

/** Pure reducer; returns the same state object when an action changes nothing. */
export function scheduleReducer(state: ScheduleState, action: ScheduleAction): ScheduleState {
  switch (action.type) {
    case 'ADD_SECTION': {
      if (state.selected[action.courseId] === action.sectionId) return state
      return { selected: { ...state.selected, [action.courseId]: action.sectionId } }
    }
    case 'REMOVE_COURSE': {
      if (!(action.courseId in state.selected)) return state
      const selected = { ...state.selected }
      delete selected[action.courseId]
      return { selected }
    }
    case 'CLEAR': {
      if (Object.keys(state.selected).length === 0) return state
      return initialScheduleState
    }
  }
}
