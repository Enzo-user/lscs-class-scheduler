import { describe, expect, it } from 'vitest'
import { makeCourse, makeSection, slot } from '../test/fixtures'
import { buildSearchIndex, filterCourses, normalize, tokenize, type FilterState } from './filter'

const EMPTY_FILTERS: FilterState = { query: '', days: [], units: null }

const catalogue = [
  makeCourse({
    id: 'CCPROG3',
    title: 'Object-Oriented Programming',
    sections: [
      makeSection({
        id: 'CCPROG3-S11',
        instructor: 'Maria Santos',
        schedule: [slot('Monday', '09:15', '10:45'), slot('Thursday', '09:15', '10:45')],
      }),
      makeSection({
        id: 'CCPROG3-S12',
        instructor: 'Jose Reyes',
        schedule: [slot('Tuesday', '11:00', '12:30'), slot('Friday', '11:00', '12:30')],
      }),
    ],
  }),
  makeCourse({
    id: 'CCDSTRU',
    title: 'Discrete Structures',
    sections: [
      makeSection({
        id: 'CCDSTRU-S11',
        instructor: 'Ana Santos',
        schedule: [slot('Wednesday', '07:30', '09:00')],
      }),
    ],
  }),
  makeCourse({
    id: 'LBYARCH',
    title: 'Architecture Laboratory',
    units: 1,
    sections: [
      makeSection({
        id: 'LBYARCH-S11',
        instructor: 'Paolo Cruz',
        schedule: [slot('Saturday', '11:00', '14:00')],
      }),
    ],
  }),
]
const index = buildSearchIndex(catalogue)

const ids = (result: ReturnType<typeof filterCourses>) =>
  result.map((r) => `${r.course.id}:${r.sections.map((s) => s.section).join(',')}`)

describe('normalize and tokenize', () => {
  it('lowercases and collapses whitespace', () => {
    expect(normalize('  Object   Oriented ')).toBe('object oriented')
    expect(tokenize('  CCPROG3   santos ')).toEqual(['ccprog3', 'santos'])
    expect(tokenize('')).toEqual([])
  })
})

describe('filterCourses', () => {
  it('returns everything when no filter is set', () => {
    expect(ids(filterCourses(index, EMPTY_FILTERS))).toEqual([
      'CCPROG3:S11,S12',
      'CCDSTRU:S11',
      'LBYARCH:S11',
    ])
  })

  it('matches code, title, instructor and section code, case-insensitively', () => {
    expect(ids(filterCourses(index, { ...EMPTY_FILTERS, query: 'ccprog' }))).toEqual([
      'CCPROG3:S11,S12',
    ])
    expect(ids(filterCourses(index, { ...EMPTY_FILTERS, query: 'DISCRETE' }))).toEqual([
      'CCDSTRU:S11',
    ])
    expect(ids(filterCourses(index, { ...EMPTY_FILTERS, query: 'santos' }))).toEqual([
      'CCPROG3:S11',
      'CCDSTRU:S11',
    ])
    expect(ids(filterCourses(index, { ...EMPTY_FILTERS, query: 's12' }))).toEqual(['CCPROG3:S12'])
  })

  it('requires every token to match (AND), across course and section text', () => {
    expect(ids(filterCourses(index, { ...EMPTY_FILTERS, query: 'prog santos' }))).toEqual([
      'CCPROG3:S11',
    ])
    expect(ids(filterCourses(index, { ...EMPTY_FILTERS, query: 'prog nobody' }))).toEqual([])
  })

  it('keeps sections meeting on any of the chosen days', () => {
    expect(ids(filterCourses(index, { ...EMPTY_FILTERS, days: ['Monday'] }))).toEqual([
      'CCPROG3:S11',
    ])
    expect(ids(filterCourses(index, { ...EMPTY_FILTERS, days: ['Friday', 'Saturday'] }))).toEqual([
      'CCPROG3:S12',
      'LBYARCH:S11',
    ])
  })

  it('filters by exact units', () => {
    expect(ids(filterCourses(index, { ...EMPTY_FILTERS, units: 1 }))).toEqual(['LBYARCH:S11'])
  })

  it('returns the original sections array when every section matches', () => {
    const [prog] = filterCourses(index, { ...EMPTY_FILTERS, query: 'prog' })
    expect(prog?.sections).toBe(catalogue[0]?.sections)
    const [progSantos] = filterCourses(index, { ...EMPTY_FILTERS, query: 'prog santos' })
    expect(progSantos?.sections).not.toBe(catalogue[0]?.sections)
  })

  it('combines all filters', () => {
    expect(ids(filterCourses(index, { query: 'santos', days: ['Wednesday'], units: 3 }))).toEqual([
      'CCDSTRU:S11',
    ])
  })
})
