import { describe, it, expect } from 'vitest'
import { getNextDueDate } from '../recurring'

describe('getNextDueDate', () => {
  it('advances monthly by one month', () => {
    expect(getNextDueDate('2026-01-15', 'monthly')).toBe('2026-02-15')
  })
  it('advances weekly by 7 days', () => {
    expect(getNextDueDate('2026-01-01', 'weekly')).toBe('2026-01-08')
  })
  it('advances daily by 1 day', () => {
    expect(getNextDueDate('2026-06-25', 'daily')).toBe('2026-06-26')
  })
  it('advances yearly by one year', () => {
    expect(getNextDueDate('2026-01-01', 'yearly')).toBe('2027-01-01')
  })
})
