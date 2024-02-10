// https://adventofcode.com/2023/day/15

import { expect, test } from 'bun:test'

import { getTotalFocusingPower, hash, parseInitSequence, runSequence, stringifyBoxes } from './day15.ts'

const example = `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`

test('hash example is correct', () => {
  expect(hash('HASH')).toBe(52)
})

test('init sequence parsing is correct', () => {
  const parsed = parseInitSequence(example)
  expect(parsed).toEqual([30, 253, 97, 47, 14, 180, 9, 197, 48, 214, 231])
  const sum = parsed.reduce((acc, cur) => acc + cur, 0)
  expect(sum).toBe(1320)
})

test('sequence result is correct', () => {
  expect(stringifyBoxes(runSequence(example))).toBe(`Box 0: [rn 1] [cm 2]\nBox 3: [ot 7] [ab 5] [pc 6]`)
})

test('focusing power is correct', () => {
  expect(getTotalFocusingPower(runSequence(example))).toBe(145)
})
