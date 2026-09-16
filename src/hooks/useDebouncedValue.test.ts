import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './useDebouncedValue'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('useDebouncedValue', () => {
  it('returns the initial value immediately and later values after the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 200), {
      initialProps: { value: 'a' },
    })
    expect(result.current).toBe('a')

    rerender({ value: 'ab' })
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(199))
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('ab')
  })

  it('only emits the last value when changes come faster than the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 200), {
      initialProps: { value: '' },
    })
    rerender({ value: 'p' })
    act(() => vi.advanceTimersByTime(100))
    rerender({ value: 'pr' })
    act(() => vi.advanceTimersByTime(100))
    rerender({ value: 'pro' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('pro')
  })
})
