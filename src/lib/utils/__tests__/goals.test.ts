import { describe, it, expect } from 'vitest'
import { getMonthlyAverage, getProjectedCompletion } from '../goals'

describe('getMonthlyAverage', () => {
  it('returns average monthly contribution across distinct months', () => {
    const txs = [
      { amount: -100, date: '2026-04-01' },
      { amount: -200, date: '2026-05-01' },
      { amount: -300, date: '2026-06-01' },
    ]
    expect(getMonthlyAverage(txs)).toBe(200)
  })

  it('sums multiple transactions in the same month', () => {
    const txs = [
      { amount: -100, date: '2026-04-01' },
      { amount: -100, date: '2026-04-15' },
    ]
    expect(getMonthlyAverage(txs)).toBe(200)
  })

  it('returns 0 for empty array', () => {
    expect(getMonthlyAverage([])).toBe(0)
  })
})

describe('getProjectedCompletion', () => {
  it('returns null when monthly average is 0', () => {
    expect(getProjectedCompletion(0, 1000, 0)).toBeNull()
  })

  it('returns null when already at or above target', () => {
    expect(getProjectedCompletion(1000, 1000, 100)).toBeNull()
    expect(getProjectedCompletion(1200, 1000, 100)).toBeNull()
  })

  it('returns a yyyy-MM string for valid positive inputs', () => {
    const result = getProjectedCompletion(0, 600, 100)
    expect(result).toMatch(/^\d{4}-\d{2}$/)
  })

  it('requires exactly 6 months for 0/600 at 100/month', () => {
    const now = new Date()
    const result = getProjectedCompletion(0, 600, 100)
    const expected = new Date(now.getFullYear(), now.getMonth() + 6, 1)
    const yyyy = expected.getFullYear()
    const mm   = String(expected.getMonth() + 1).padStart(2, '0')
    expect(result).toBe(`${yyyy}-${mm}`)
  })
})
