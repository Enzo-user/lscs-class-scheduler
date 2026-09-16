import { describe, expect, it } from 'vitest'
import { initialScheduleState, scheduleReducer } from './scheduleReducer'

describe('scheduleReducer', () => {
  it('adds a section under its course', () => {
    const state = scheduleReducer(initialScheduleState, { type: 'ADD_SECTION', courseId: 'CCPROG3', sectionId: 'CCPROG3-S11' })
    expect(state.selected).toEqual({ CCPROG3: 'CCPROG3-S11' })
  })

  it('replaces the section when another one of the same course is added', () => {
    const first = scheduleReducer(initialScheduleState, { type: 'ADD_SECTION', courseId: 'CCPROG3', sectionId: 'CCPROG3-S11' })
    const second = scheduleReducer(first, { type: 'ADD_SECTION', courseId: 'CCPROG3', sectionId: 'CCPROG3-S12' })
    expect(second.selected).toEqual({ CCPROG3: 'CCPROG3-S12' })
  })

  it('keeps other courses when adding or removing', () => {
    let state = scheduleReducer(initialScheduleState, { type: 'ADD_SECTION', courseId: 'A', sectionId: 'A-S11' })
    state = scheduleReducer(state, { type: 'ADD_SECTION', courseId: 'B', sectionId: 'B-S11' })
    state = scheduleReducer(state, { type: 'REMOVE_COURSE', courseId: 'A' })
    expect(state.selected).toEqual({ B: 'B-S11' })
  })

  it('clears everything', () => {
    const state = scheduleReducer({ selected: { A: 'A-S11' } }, { type: 'CLEAR' })
    expect(state.selected).toEqual({})
  })

  it('returns the same state for no-op actions', () => {
    const state = { selected: { A: 'A-S11' } }
    expect(scheduleReducer(state, { type: 'ADD_SECTION', courseId: 'A', sectionId: 'A-S11' })).toBe(state)
    expect(scheduleReducer(state, { type: 'REMOVE_COURSE', courseId: 'B' })).toBe(state)
    expect(scheduleReducer(initialScheduleState, { type: 'CLEAR' })).toBe(initialScheduleState)
  })

  it('does not mutate the previous state', () => {
    const before = { selected: { A: 'A-S11' } }
    scheduleReducer(before, { type: 'REMOVE_COURSE', courseId: 'A' })
    expect(before.selected).toEqual({ A: 'A-S11' })
  })
})
