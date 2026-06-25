import { describe, it, expectTypeOf } from 'vitest'
import type { ActionResult } from '@/types'

describe('ActionResult', () => {
  it('has data on success', () => {
    const r: ActionResult<string> = { data: 'ok', error: null }
    if (r.error === null) expectTypeOf(r.data).toEqualTypeOf<string>()
  })
  it('has error on failure', () => {
    const r: ActionResult<string> = { data: null, error: 'oops' }
    if (r.data === null) expectTypeOf(r.error).toEqualTypeOf<string>()
  })
})
