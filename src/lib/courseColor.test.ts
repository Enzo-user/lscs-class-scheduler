import { describe, expect, it } from 'vitest'
import { courseColorClasses } from './courseColor'

describe('courseColorClasses', () => {
  it('is deterministic for the same course id', () => {
    expect(courseColorClasses('CCPROG3')).toBe(courseColorClasses('CCPROG3'))
  })

  it('returns a full set of background, border and text classes', () => {
    expect(courseColorClasses('CCPROG3')).toMatch(/^bg-\S+ border-\S+ text-\S+$/)
  })

  it('spreads different courses across the palette', () => {
    const ids = ['CCPROG1', 'CCPROG2', 'CCPROG3', 'CCDSTRU', 'CSARCH1', 'GEETHIC', 'STDISCM', 'LBYARCH']
    expect(new Set(ids.map(courseColorClasses)).size).toBeGreaterThan(1)
  })
})
