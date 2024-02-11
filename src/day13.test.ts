// https://adventofcode.com/2023/day/13

import { expect, test } from 'bun:test'

import { getPatternSummary, getSymmetryLine, type SymmetryLine } from './day13.ts'

const patterns = `#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#`

test('example patterns symmetry lines are correct', () => {
  const [pattern1, pattern2] = patterns.split('\n\n')
  expect(getSymmetryLine(pattern1)).toEqual({ isVertical: true, index: 4 })
  expect(getSymmetryLine(pattern2)).toEqual({ isVertical: false, index: 3 })
})

test('example patterns summary is correct', () => {
  expect(
    getPatternSummary(
      patterns
        .split('\n\n')
        .map((line) => getSymmetryLine(line))
        .filter((item): item is SymmetryLine => !!item),
    ),
  ).toBe(405)
})
test('example patterns summary after flip is correct', () => {
  expect(
    getPatternSummary(
      patterns
        .split('\n\n')
        .map((line) => getSymmetryLine(line, true))
        .filter((item): item is SymmetryLine => !!item),
    ),
  ).toBe(400)
})
