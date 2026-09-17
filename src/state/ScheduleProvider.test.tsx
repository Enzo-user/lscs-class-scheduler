import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeCourse } from '../test/fixtures'
import { ScheduleProvider } from './ScheduleProvider'
import { useSchedule } from './ScheduleContext'
import { loadScheduleState, saveScheduleState } from './scheduleStorage'
import { useSelectedSections } from './useSelectedSections'

const wrapper = ScheduleProvider

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ScheduleProvider', () => {
  it('throws when useSchedule is used outside the provider', () => {
    expect(() => renderHook(() => useSchedule())).toThrow(/within a ScheduleProvider/)
  })

  it('starts empty and updates through the exposed actions', () => {
    const { result } = renderHook(() => useSchedule(), { wrapper })
    expect(result.current.selected).toEqual({})

    act(() => result.current.addSection('CCPROG3', 'CCPROG3-S11'))
    act(() => result.current.addSection('CCPROG3', 'CCPROG3-S12'))
    act(() => result.current.addSection('CCDSTRU', 'CCDSTRU-S11'))
    expect(result.current.selected).toEqual({ CCPROG3: 'CCPROG3-S12', CCDSTRU: 'CCDSTRU-S11' })

    act(() => result.current.removeCourse('CCPROG3'))
    expect(result.current.selected).toEqual({ CCDSTRU: 'CCDSTRU-S11' })

    act(() => result.current.clear())
    expect(result.current.selected).toEqual({})
  })

  it('persists every change to localStorage', () => {
    const { result } = renderHook(() => useSchedule(), { wrapper })
    act(() => result.current.addSection('CCPROG3', 'CCPROG3-S11'))
    expect(loadScheduleState()).toEqual({ selected: { CCPROG3: 'CCPROG3-S11' } })
    expect(localStorage.length).toBe(1)
  })

  it('restores a persisted selection on mount', () => {
    saveScheduleState({ selected: { CCPROG3: 'CCPROG3-S11' } })
    const { result } = renderHook(() => useSchedule(), { wrapper })
    expect(result.current.selected).toEqual({ CCPROG3: 'CCPROG3-S11' })
  })

  it('ignores corrupt or wrongly shaped persisted data', () => {
    // Whatever key the module uses, garbage stored under it must not break the provider.
    const getItem = vi.spyOn(Storage.prototype, 'getItem')

    getItem.mockReturnValue('{not json')
    expect(renderHook(() => useSchedule(), { wrapper }).result.current.selected).toEqual({})

    getItem.mockReturnValue(JSON.stringify(['CCPROG3-S11']))
    expect(renderHook(() => useSchedule(), { wrapper }).result.current.selected).toEqual({})
  })

  it('keeps the context value referentially stable across unrelated re-renders', () => {
    const { result, rerender } = renderHook(() => useSchedule(), { wrapper })
    const before = result.current
    rerender()
    expect(result.current).toBe(before)
  })
})

describe('useSelectedSections', () => {
  it('resolves the selection against the catalogue and memoises the result', () => {
    const courses = [makeCourse({ id: 'CCPROG3' }), makeCourse({ id: 'CCDSTRU' })]
    const { result, rerender } = renderHook(
      () => ({ schedule: useSchedule(), entries: useSelectedSections(courses) }),
      { wrapper },
    )
    expect(result.current.entries).toEqual([])

    act(() => result.current.schedule.addSection('CCDSTRU', 'CCDSTRU-S11'))
    expect(result.current.entries.map((e) => e.section.id)).toEqual(['CCDSTRU-S11'])

    const entries = result.current.entries
    rerender()
    expect(result.current.entries).toBe(entries)
  })
})
