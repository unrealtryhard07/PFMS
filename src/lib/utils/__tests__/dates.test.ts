import { describe, it, expect } from 'vitest'
import { formatDate, getMonthRange, getLastNMonths } from '../dates'

describe('formatDate', () => {
  it('formats ISO date string', () => {
    expect(formatDate('2026-06-25')).toBe('Jun 25, 2026')
  })
})

describe('getMonthRange', () => {
  it('returns first and last day of month', () => {
    const { from, to } = getMonthRange(new Date('2026-06-15'))
    expect(from).toBe('2026-06-01')
    expect(to).toBe('2026-06-30')
  })
})

describe('getLastNMonths', () => {
  it('returns N entries with month and label', () => {
    const result = getLastNMonths(3)
    expect(result).toHaveLength(3)
    expect(result[0]).toHaveProperty('month')
    expect(result[0]).toHaveProperty('label')
  })
})
