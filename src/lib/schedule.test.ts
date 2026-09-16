import { describe, expect, it } from 'vitest'
import { makeCourse, makeSection, slot } from '../test/fixtures'
import {
  buildTimetable,
  describeConflicts,
  describeSchedule,
  findConflicts,
  resolveSelectedSections,
  sectionsConflict,
  slotsOverlap,
  totalUnits,
} from './schedule'

describe('slotsOverlap', () => {
  it('detects partial and full overlaps on the same day', () => {
    expect(slotsOverlap(slot('Monday', '09:15', '10:45'), slot('Monday', '10:00', '11:30'))).toBe(true)
    expect(slotsOverlap(slot('Monday', '09:00', '12:00'), slot('Monday', '10:00', '10:30'))).toBe(true)
  })

  it('treats touching intervals as free', () => {
    expect(slotsOverlap(slot('Monday', '07:30', '09:00'), slot('Monday', '09:00', '10:30'))).toBe(false)
  })

  it('never overlaps across different days', () => {
    expect(slotsOverlap(slot('Monday', '09:15', '10:45'), slot('Tuesday', '09:15', '10:45'))).toBe(false)
  })
})

describe('sectionsConflict', () => {
  it('conflicts when any meeting overlaps', () => {
    const a = makeSection({ id: 'A-S11', schedule: [slot('Monday', '09:15', '10:45'), slot('Thursday', '09:15', '10:45')] })
    const b = makeSection({ id: 'B-S11', schedule: [slot('Thursday', '10:00', '11:30')] })
    expect(sectionsConflict(a, b)).toBe(true)
  })

  it('does not conflict when all meetings are apart', () => {
    const a = makeSection({ id: 'A-S11', schedule: [slot('Monday', '09:15', '10:45')] })
    const b = makeSection({ id: 'B-S11', schedule: [slot('Monday', '11:00', '12:30')] })
    expect(sectionsConflict(a, b)).toBe(false)
  })
})

describe('findConflicts', () => {
  const prog = makeCourse({
    id: 'CCPROG3',
    sections: [
      makeSection({ id: 'CCPROG3-S11', schedule: [slot('Monday', '09:15', '10:45')] }),
      makeSection({ id: 'CCPROG3-S12', schedule: [slot('Monday', '11:00', '12:30')] }),
    ],
  })
  const dstru = makeCourse({
    id: 'CCDSTRU',
    sections: [makeSection({ id: 'CCDSTRU-S11', schedule: [slot('Monday', '10:00', '11:30')] })],
  })
  const [progS11, progS12] = prog.sections
  const [dstruS11] = dstru.sections
  if (!progS11 || !progS12 || !dstruS11) throw new Error('fixture setup')

  it('returns the selected sections of other courses that overlap', () => {
    const selected = [{ course: dstru, section: dstruS11 }]
    expect(findConflicts({ course: prog, section: progS11 }, selected)).toEqual(selected)
    expect(findConflicts({ course: prog, section: progS12 }, selected)).toEqual(selected)
  })

  it('ignores sections of the same course because they would be replaced', () => {
    const selected = [{ course: prog, section: progS11 }]
    const overlapping = makeSection({ id: 'CCPROG3-S13', schedule: [slot('Monday', '09:15', '10:45')] })
    expect(findConflicts({ course: prog, section: overlapping }, selected)).toEqual([])
  })

  it('returns nothing when the schedule is empty', () => {
    expect(findConflicts({ course: prog, section: progS11 }, [])).toEqual([])
  })

  it('describes the clashing selections as "CODE SECTION" pairs', () => {
    const selected = [{ course: dstru, section: dstruS11 }]
    expect(describeConflicts({ course: prog, section: progS11 }, selected)).toBe('CCDSTRU S11')
    expect(describeConflicts({ course: prog, section: progS11 }, [])).toBe('')
  })
})

describe('totalUnits', () => {
  it('sums course units', () => {
    expect(totalUnits([makeCourse({ id: 'A', units: 3 }), makeCourse({ id: 'B', units: 1 })])).toBe(4)
    expect(totalUnits([])).toBe(0)
  })
})

describe('describeSchedule', () => {
  it('pluralises courses and units independently', () => {
    const lab = { course: makeCourse({ id: 'LBYARCH', units: 1 }), section: makeSection({ id: 'LBYARCH-S11' }) }
    const lecture = { course: makeCourse({ id: 'CCPROG3', units: 3 }), section: makeSection({ id: 'CCPROG3-S11' }) }
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
    sections: [makeSection({ id: 'A-S11', schedule: [slot('Monday', '09:15', '10:45'), slot('Thursday', '09:15', '10:45')] })],
  })
  const [section] = course.sections
  if (!section) throw new Error('fixture setup')

  it('positions blocks in 15-minute rows relative to the window start', () => {
    const layout = buildTimetable([{ course, section }], { startTime: '07:00', endTime: '21:30' })
    expect(layout.rowCount).toBe(58)
    expect(layout.blocks).toHaveLength(2)
    expect(layout.blocks[0]).toMatchObject({ key: 'A-S11-Monday', dayIndex: 0, startRow: 10, endRow: 16 })
    expect(layout.blocks[1]).toMatchObject({ key: 'A-S11-Thursday', dayIndex: 3, startRow: 10, endRow: 16 })
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
    const layout = buildTimetable([{ course, section: early }], { startTime: '07:00', endTime: '09:00' })
    expect(layout.blocks[0]).toMatchObject({ startRow: 1, endRow: 3 })
  })
})
