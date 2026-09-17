import { describe, expect, it } from 'vitest'
import { makeCourse, makeSection, slot } from '../test/fixtures'
import type { ScheduleSlot } from '../types/course'
import {
  buildTimetable,
  describeConflicts,
  describeSchedule,
  resolveSelectedSections,
  type SelectedSection,
} from './schedule'

describe('describeConflicts', () => {
  const prog = makeCourse({
    id: 'CCPROG3',
    sections: [
      makeSection({
        id: 'CCPROG3-S11',
        schedule: [slot('Monday', '09:15', '10:45'), slot('Thursday', '09:15', '10:45')],
      }),
    ],
  })
  const [progS11] = prog.sections
  if (!progS11) throw new Error('fixture setup')
  const candidate = { course: prog, section: progS11 }

  /** A selected S11 of another course that meets at the given times. */
  function selected(courseId: string, meetings: ScheduleSlot[]): SelectedSection {
    const section = makeSection({ id: `${courseId}-S11`, schedule: meetings })
    return { course: makeCourse({ id: courseId, sections: [section] }), section }
  }

  it('names a selection whose meeting overlaps any meeting of the candidate', () => {
    const partial = selected('CCDSTRU', [slot('Monday', '10:00', '11:30')])
    const enclosing = selected('CCDSTRU', [slot('Thursday', '09:00', '12:00')])
    expect(describeConflicts(candidate, [partial])).toBe('CCDSTRU S11')
    expect(describeConflicts(candidate, [enclosing])).toBe('CCDSTRU S11')
  })

  it('treats touching intervals as free', () => {
    const before = selected('CCDSTRU', [slot('Monday', '07:45', '09:15')])
    const after = selected('CCDSTRU', [slot('Monday', '10:45', '12:15')])
    expect(describeConflicts(candidate, [before, after])).toBe('')
  })

  it('never conflicts across different days', () => {
    const sameTimeTuesday = selected('CCDSTRU', [slot('Tuesday', '09:15', '10:45')])
    expect(describeConflicts(candidate, [sameTimeTuesday])).toBe('')
  })

  it('lists every clashing selection as "CODE SECTION" pairs, in schedule order', () => {
    const entries = [
      selected('CCDSTRU', [slot('Monday', '10:00', '11:30')]),
      selected('GEMATMW', [slot('Monday', '13:00', '14:30')]),
      selected('CSARCH1', [slot('Thursday', '10:00', '11:30')]),
    ]
    expect(describeConflicts(candidate, entries)).toBe('CCDSTRU S11, CSARCH1 S11')
  })

  it('ignores sections of the same course because they would be replaced', () => {
    const overlapping = makeSection({
      id: 'CCPROG3-S13',
      schedule: [slot('Monday', '09:15', '10:45')],
    })
    expect(describeConflicts({ course: prog, section: overlapping }, [candidate])).toBe('')
  })

  it('returns nothing when the schedule is empty', () => {
    expect(describeConflicts(candidate, [])).toBe('')
  })
})

describe('describeSchedule', () => {
  it('pluralises courses and units independently', () => {
    const lab = {
      course: makeCourse({ id: 'LBYARCH', units: 1 }),
      section: makeSection({ id: 'LBYARCH-S11' }),
    }
    const lecture = {
      course: makeCourse({ id: 'CCPROG3', units: 3 }),
      section: makeSection({ id: 'CCPROG3-S11' }),
    }
    expect(describeSchedule([])).toBe('0 courses · 0 units')
    expect(describeSchedule([lab])).toBe('1 course · 1 unit')
    expect(describeSchedule([lab, lecture])).toBe('2 courses · 4 units')
  })
})

describe('resolveSelectedSections', () => {
  const courses = [makeCourse({ id: 'A' }), makeCourse({ id: 'B' })]

  it('pairs each selected course with its section', () => {
    const result = resolveSelectedSections(courses, { A: 'A-S11', B: 'B-S11' })
    expect(result.map((e) => [e.course.id, e.section.id])).toEqual([
      ['A', 'A-S11'],
      ['B', 'B-S11'],
    ])
  })

  it('drops entries that no longer exist in the catalogue', () => {
    const result = resolveSelectedSections(courses, { A: 'A-S99', GONE: 'GONE-S11' })
    expect(result).toEqual([])
  })
})

describe('buildTimetable', () => {
  const course = makeCourse({
    id: 'A',
    sections: [
      makeSection({
        id: 'A-S11',
        schedule: [slot('Monday', '09:15', '10:45'), slot('Thursday', '09:15', '10:45')],
      }),
    ],
  })
  const [section] = course.sections
  if (!section) throw new Error('fixture setup')

  it('positions blocks in 15-minute rows relative to the window start', () => {
    const layout = buildTimetable([{ course, section }], { startTime: '07:00', endTime: '21:30' })
    expect(layout.rowCount).toBe(58)
    expect(layout.blocks).toHaveLength(2)
    expect(layout.blocks[0]).toMatchObject({
      key: 'A-S11-Monday',
      dayIndex: 0,
      startRow: 10,
      endRow: 16,
    })
    expect(layout.blocks[1]).toMatchObject({
      key: 'A-S11-Thursday',
      dayIndex: 3,
      startRow: 10,
      endRow: 16,
    })
  })

  it('labels every full hour in the window', () => {
    const layout = buildTimetable([], { startTime: '07:00', endTime: '10:00' })
    expect(layout.hourLabels).toEqual([
      { row: 1, label: '7:00 AM' },
      { row: 5, label: '8:00 AM' },
      { row: 9, label: '9:00 AM' },
    ])
  })

  it('clamps meetings outside the window to its edges', () => {
    const early = makeSection({ id: 'A-S12', schedule: [slot('Monday', '06:00', '07:30')] })
    const layout = buildTimetable([{ course, section: early }], {
      startTime: '07:00',
      endTime: '09:00',
    })
    expect(layout.blocks[0]).toMatchObject({ startRow: 1, endRow: 3 })
  })
})
