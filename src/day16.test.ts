// https://adventofcode.com/2023/day/16

import { expect, test } from 'bun:test'

import { energyGridToStr, getEnergizedCellNum, getEnergyGrid, getMostEnergizedBeam, parseGrid } from './day16'

const example = `.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`

const exampleDirectionGrid = `>|<<<\\....
|v-.\\^....
.v...|->>>
.v...v^.|.
.v...v^...
.v...v^..\\
.v../2\\\\..
<->-/vv|..
.|<<<2-|.\\
.v//.|.v..`
const exampleEnergizedGrid = `######....
.#...#....
.#...#####
.#...##...
.#...##...
.#...##...
.#..####..
########..
.#######..
.#...#.#..`

test('beam simulation is correct', () => {
  const grid = parseGrid(example)
  const energyGrid = getEnergyGrid(grid)
  expect(energyGridToStr(energyGrid, grid)).toBe(exampleDirectionGrid)
  expect(energyGridToStr(energyGrid)).toBe(exampleEnergizedGrid)
  expect(getEnergizedCellNum(energyGrid)).toBe(46)
})

test('most energized beam search is correct', () => {
  const grid = parseGrid(example)
  const { beam, energizedCellNum } = getMostEnergizedBeam(grid)
  expect(beam).toEqual({ position: { x: 3, y: 0 }, direction: 'down' })
  expect(energizedCellNum).toBe(51)
})
