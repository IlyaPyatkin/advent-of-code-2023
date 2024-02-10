import { expect, test } from 'bun:test'

import { doCycles, getNorthBeamsLoad, getGrid, numberOfCycles, tiltPlatform, gridToStr } from './day14.ts'

const test1State = `O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....`.trim()
const test1StateAfterTilt = `OOOO.#.O..
OO..#....#
OO..O##..O
O..#.OO...
........#.
..#....#.#
..O..#.O.O
..O.......
#....###..
#....#....`.trim()

const after1CycleResult = `.....#....
....#...O#
...OO##...
.OO#......
.....OOO#.
.O#...O#.#
....O#....
......OOOO
#...O###..
#..OO#....`

const after2CyclesResult = `.....#....
....#...O#
.....##...
..O#......
.....OOO#.
.O#...O#.#
....O#...O
.......OOO
#..OO###..
#.OOO#...O`

const after3CyclesResult = `.....#....
....#...O#
.....##...
..O#......
.....OOO#.
.O#...O#.#
....O#...O
.......OOO
#...O###.O
#.OOO#...O`

test('tilting works correctly', () => {
  expect(gridToStr(tiltPlatform(getGrid(test1State)))).toBe(test1StateAfterTilt)
})
test('calculating north beams load is correct', () => {
  expect(getNorthBeamsLoad(test1StateAfterTilt)).toBe(136)
})

const after1Cycles = doCycles(test1State, 1)
test('state after 1 cycle is correct', () => {
  expect(after1Cycles).toBe(after1CycleResult)
})
const after2Cycles = doCycles(after1Cycles, 1)
test('state after 2 cycles is correct', () => {
  expect(doCycles(test1State, 2)).toBe(after2CyclesResult)
  expect(after2Cycles).toBe(after2CyclesResult)
})
test('state after 3 cycles is correct', () => {
  expect(doCycles(test1State, 3)).toBe(after3CyclesResult)
  expect(doCycles(after2Cycles, 1)).toBe(after3CyclesResult)
})
test(`north beams load after ${numberOfCycles} cycles is correct`, () => {
  expect(getNorthBeamsLoad(doCycles(test1State, numberOfCycles))).toBe(64)
})
