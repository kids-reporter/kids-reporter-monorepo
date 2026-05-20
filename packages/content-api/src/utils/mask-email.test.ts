import { describe, expect, it } from 'vitest'

import { maskEmail } from './mask-email.js'

describe('maskEmail', () => {
  it('masks to 8 chars with 3 visible prefix', () => {
    expect(maskEmail('abcdefg@example.com')).toBe('abc*****')
  })

  it('pads short emails', () => {
    expect(maskEmail('a@b.co')).toBe('a@b*****')
  })

  it('masks empty string', () => {
    expect(maskEmail('')).toBe('********')
  })
})
