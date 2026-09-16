import { initialScheduleState, type ScheduleState } from './scheduleReducer'

/** Bump the suffix if the persisted shape ever changes; old data is then ignored. */
export const SCHEDULE_STORAGE_KEY = 'lscs-class-scheduler:schedule:v1'

/** Reads the persisted schedule, falling back to an empty one on any problem. */
export function loadScheduleState(): ScheduleState {
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY)
    if (raw === null) return initialScheduleState
    const parsed: unknown = JSON.parse(raw)
    return isSelectedMap(parsed) ? { selected: parsed } : initialScheduleState
  } catch {
    return initialScheduleState
  }
}

/** Persists the schedule; storage failures (private mode, quota) are ignored. */
export function saveScheduleState(state: ScheduleState): void {
  try {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(state.selected))
  } catch {
    // Persistence is a convenience; the in-memory state is still correct.
  }
}

function isSelectedMap(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((v) => typeof v === 'string')
  )
}
