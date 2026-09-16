import { describe, expect, it } from 'vitest'
import { pluralize } from './pluralize'

describe('pluralize', () => {
  it('adds an s except for exactly one', () => {
    expect(pluralize(0, 'course')).toBe('0 courses')
    expect(pluralize(1, 'unit')).toBe('1 unit')
    expect(pluralize(3, 'unit')).toBe('3 units')
  })
})
