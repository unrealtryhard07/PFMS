import { describe, it, expect } from 'vitest'
import { formatCurrency, parseCurrencyInput } from '../currency'

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56')
  })
  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00')
  })
  it('handles negative amounts', () => {
    expect(formatCurrency(-50, 'USD')).toBe('-$50.00')
  })
})

describe('parseCurrencyInput', () => {
  it('parses plain number string', () => {
    expect(parseCurrencyInput('42.5')).toBe(42.5)
  })
  it('strips commas', () => {
    expect(parseCurrencyInput('1,234.56')).toBe(1234.56)
  })
  it('returns 0 for empty string', () => {
    expect(parseCurrencyInput('')).toBe(0)
  })
})
