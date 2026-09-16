import { describe, expect, it } from 'vitest'
import { slot } from '../test/fixtures'
import {
  DAYS,
  abbreviateDay,
  formatSchedule,
  formatTime,
  formatTimeRange,
  isDay,
  isTime,
  parseTime,
} from './time'

describe('parseTime', () => {
  it('converts HH:mm to minutes since midnight', () => {
    expect(parseTime('00:00')).toBe(0)
    expect(parseTime('09:15')).toBe(555)
    expect(parseTime('18:00')).toBe(1080)
  })
})

describe('formatTime', () => {
  it('uses a 12-hour clock without a leading zero', () => {
    expect(formatTime('07:30')).toBe('7:30 AM')
    expect(formatTime('12:45')).toBe('12:45 PM')
    expect(formatTime('14:15')).toBe('2:15 PM')
    expect(formatTime('00:05')).toBe('12:05 AM')
  })
})

describe('formatTimeRange', () => {
  it('shares the suffix when both ends are on the same side of noon', () => {
    expect(formatTimeRange('09:15', '10:45')).toBe('9:15–10:45 AM')
  })

  it('spells out both suffixes when the range crosses noon', () => {
    expect(formatTimeRange('11:00', '12:30')).toBe('11:00 AM–12:30 PM')
  })
})

describe('formatSchedule', () => {
  it('merges days that share a time, in weekday order', () => {
    const schedule = [slot('Thursday', '09:15', '10:45'), slot('Monday', '09:15', '10:45')]
    expect(formatSchedule(schedule)).toBe('Mon/Thu 9:15–10:45 AM')
  })

  it('lists meetings at different times separately', () => {
    const schedule = [slot('Tuesday', '07:30', '09:00'), slot('Friday', '12:45', '14:15')]
    expect(formatSchedule(schedule)).toBe('Tue 7:30–9:00 AM, Fri 12:45–2:15 PM')
  })

  it('reads TBA for an empty schedule', () => {
    expect(formatSchedule([])).toBe('TBA')
  })
})

describe('day helpers', () => {
  it('orders Monday to Saturday', () => {
    expect(DAYS).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
    expect(DAYS.map(abbreviateDay)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
  })

  it('guards Day and time strings', () => {
    expect(isDay('Monday')).toBe(true)
    expect(isDay('Sunday')).toBe(false)
    expect(isDay('toString')).toBe(false)
    expect(isDay('constructor')).toBe(false)
    expect(isDay(1)).toBe(false)
    expect(isTime('07:30')).toBe(true)
    expect(isTime('7:30')).toBe(false)
    expect(isTime('24:00')).toBe(false)
  })
})
