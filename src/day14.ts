// https://adventofcode.com/2023/day/14

const CellType = {
  Empty: '.',
  RoundRock: 'O',
  SquareRock: '#',
} as const
type Cell = (typeof CellType)[keyof typeof CellType]

const cells = Object.values(CellType)
type Grid = Cell[][]
const isCell = (char: string): char is Cell => cells.includes(char as Cell)

export const getGrid = (input: string): Grid =>
  input
    .trim()
    .split('\n')
    .map((row) => row.split('').map((char) => (isCell(char) ? char : '.')))

const isRoundRock = (char: Cell): boolean => char === 'O'

export const getNorthBeamsLoad = (input: string): number => {
  const grid = getGrid(input)
  return grid.reduce(
    (acc, rowString, rowIndex) => acc + rowString.filter(isRoundRock).length * (grid.length - rowIndex),
    0,
  )
}

const getIsVertical = (direction: Direction): boolean => direction === 'north' || direction === 'south'

const tiltSector = (grid: Grid, sectorIndex: number, direction: Direction) => {
  let lastEmptyIndex = undefined
  const isVertical = getIsVertical(direction)
  const loops = isVertical ? grid[0].length : grid.length
  const isReversed = direction === 'south' || direction === 'east'
  for (
    let index = isReversed ? loops - 1 : 0;
    isReversed ? index >= 0 : index < loops;
    isReversed ? index-- : index++
  ) {
    const currentIndex = isVertical ? index : sectorIndex
    const currentSectorIndex = isVertical ? sectorIndex : index
    switch (grid[currentIndex][currentSectorIndex]) {
      case '.':
        if (lastEmptyIndex === undefined) {
          lastEmptyIndex = index
        }
        break
      case '#':
        lastEmptyIndex = undefined
        break
      case 'O':
        if (lastEmptyIndex !== undefined) {
          grid[isVertical ? lastEmptyIndex : sectorIndex][isVertical ? sectorIndex : lastEmptyIndex] = 'O'
          grid[currentIndex][currentSectorIndex] = '.'
          lastEmptyIndex += isReversed ? -1 : 1
        }
        break
    }
  }
}

export const tiltPlatform = (grid: Grid, direction: Direction = 'north') => {
  const isVertical = getIsVertical(direction)
  const loops = isVertical ? grid.length : grid[0].length
  for (let index = 0; index < loops; index++) {
    tiltSector(grid, index, direction)
  }

  return grid
}

const directions = ['north', 'west', 'south', 'east'] as const

type Direction = (typeof directions)[number]

export const gridToStr = (grid: Grid): string => grid.map((row) => row.join('')).join('\n')

export const doCycles = (input: string, cycles: number): string => {
  const grid = getGrid(input)
  const seenStates = new Map<string, number>()

  for (let index = 0; index < cycles; index++) {
    for (const direction of directions) {
      tiltPlatform(grid, direction)
    }

    const str = gridToStr(grid)
    if (seenStates.has(str)) {
      const firstSeenIndex = seenStates.get(str)!

      const cycleLength = index - firstSeenIndex
      const remainingCycles = cycles - (index + 1)
      const remainingCyclesMod = remainingCycles % cycleLength
      const targetIndex = remainingCyclesMod + firstSeenIndex

      return Array.from(seenStates.keys())[targetIndex]
    } else seenStates.set(str, index)
  }

  return gridToStr(grid)
}

export const numberOfCycles = 1000000000

if (Bun.env.NODE_ENV !== 'test') {
  const inputStr =
    `...OO..##.......O..O....O..O#...O.OO#.#..O...O....OOO##..O##O#...#..O....#........#O.##O#..OO#..OO.O\n...#.#.#.O#...OO.#........O#.#............#...O...#...OOOO#...#..#..#.O...#..#....O.#O###..O#..OOO.O\n..##..##.O...#..OO.O.#.#O#.O.OO..#.....#.....#O##O.#..###.O.........OOOO#...O.#.........##O..O.#O.O.\n.....#.##O##.#.#O#....#.#O.....OO.#.#OO##OOOO..#O..#.#.#.O..........O.#......O...OO.........#.OO....\n.#.O#O...#...#...O#O....O.......O#.O..OOO...#.##OO.#.O..O.#.O...O..O.#.#.#...#..O...OO..OO.....O.#.O\n....#..#...#.##................O..OO.....##.........#...#..........#.OOO...O#..##.##.......#O..O.##.\n.............OO#...O.#....O....O...##...OOO....O.O..O...#......O..O#.O#.#..........#.#....#O...#O..O\nO.....O.O...O...OO..#...#.OO........#..##O...O.O.#.#..#O..##O.##..O......#.....O......#....O.....OO.\n.#..O....O.O..O.#..#.......#OOO...#.O..O..O#...OO.#...##O.O..O.OO...O....#O.O.....O#....O....O.#....\n...#....#OO...O....#.##.O#####..O...#...#...#..O..#.##.##OO...O#.........O..OO......#..OO.#...##O...\n...OO...........O....O.##..#.O##.....O..#.......O#..#....#O.#...#.#.O..O#..#..O..O##..O...#..O##.O..\n.....#OO#.O......#.O..O..O.....#.#.OOOOO..#......O.OO.OO.....#...#O....OO.O.#....##O..O..O......#...\n.O#O.#.#O.....O.#..O..#O..#O.O..O.......O....O.....#...#........#.#....O#..#......#O....OO#.....O.##\n.O..###.....O..##O...O..O..O.#....#.......#..##......O#O.#OOO...OOO...O..O#..#.#...OOO#..........O..\n#..O#OO..#O.O..OOO...#.#...O..O.O.......#..#...#..O...O.O#.O....#...#..O.O....O.#.#...#.....OO...#.#\n...O..#O............#.......#..##OO..##....#OO.OO..##..#OO.#.O..O.O........O........O.##...O.O.O...#\n.O...O.....#....OO#.O#.###.O....#.O...O#....#....O....O..OO.O....O#OO#.#O#......OO..OOO...O.#.O.....\n.O..O................OO##O..#....O..#.O..#.#............#.##.........#..O.O.O..O#...O.#OOO#..#.#...#\nO..O.........O##...#......#..#O....#O#....O.O.O.O...#......O#O..#...O..##.#..O.O.#O.......OO...O#O##\nOOOO.#O.O#.....#..#...#..O...#O....#.#.O.#..O.##.O....#.##.O.O....OO...O.......#..#......#...O###..O\n..#.......#...O..O..OO.O#...OO.OO..O#.O....#OO....#.#O........##O.#.....###....OO#..O.O.O.......O#.#\n#.O.......#OO#...#O#O#..OO.O.OOO#O#....OO..O#.O.#.O...##.#.O..#...O.O.....O..#.OO#.O...O.#....O.O..#\n.OO#.OO###....O........#..O..##.O...OOO.#...O......O#....#.O#.O......O.......O.#..#O..O...#..#...#..\n....##O....O.##......##.O.##......#....OOOOO#......#.#.....#O...#...#..OO##.##.....##.O...O.O##.#..O\n.#...O.#OO........O..OO...##O.O..O.....O..#OOO....#..#O#.#O......O.O.##.....O......O.O.#..#.#..OO...\nO...O....#...O##.....#......O.O..O..O..#...O..OO#..O#.#.....#....O...##.#.#O.O........#.O#O#OO.#..#.\n#..#...#OO...O#..#.#.#O#O..........O..O...O.O#O...OOO..O...O.O#.O##....O.......O..O..#...OO..OOO....\n.#.OOO#....O#.....#.OOO.........O.........O.......#O#O......O#O.O.#O#.#..O.....#.....#..O.##O.O#...#\n...#....O.O##.O...O.O..OOOO##.............OO....O.O....O..O....#OO..O....OO.OO.O..#.#......O.O#.....\n#....O...OO.#.....O...OO.#O.#O....#....##.O..#O..O.O...#...O#.#OOOOOO......#.O.##......##..###.O.O..\n.#.O..O.##O.#.........O.O.#O....#......O.#....O...#O.#.OO.OOO..#..O.O.##..#.....#..O.....O#..O#....O\n#.OO.#...O...O##O.O.O......#....O..O.O.......O.....#...OOO....O.O#.#..O.O..OO#.OOO..O...#..O..O.OO.#\n.#..#........##O.O.....OO.....O...OO#O..#..O.....O...O....O.#.#.......OO.....O..O.O..O....#.#O.....#\n...O.O.OO.O##OO..O.OO.......#O#O#..O#...O.#O.....#.....#.OO.#..#....O..OO.O.....O....O..#.OO.......O\nO#..........O.#..OO...#OOO.O..O.##..#O##O.O.#O#.OO.O.O#...O#...OOO#.O.OO.O.#O..#O.#.......##O..O...O\n.#.O.....#..O#....O.###.....##...O.....................O....OO#..O#.#.#...O....##...O.#...O..#.O##.#\n..O...#...O#.#.O.O.O...O.......OO#.#........O...##.O...#..##..OO.#..O.#.#.O..OO....O.O..#...#O.O#.#.\n....OOO#.O#...#...O#.O.OOO...##.....O...OO...O..OOO.O.O.O..##.#O#.#O.O...#O..O..#.#..OOOO..O.#.O#...\n.O............#....#..OO...#..OO.OO....O..O.OOO......O....O#OO....#............#.OO#.O##.O#O..OOO.#O\n.O......O.#.#.#..O.......O.........#O.O...#O#...#.OO...#...#.O..O..O.O.#.O.O.....#.#......##.O.O...O\n...O..O.........#O..O.O..O###O#..#..#OO#OO..#O.#.....##..OO...OOO#...#O.........OOO.OO.##..#O.O..O.O\n.#.##.#.#OOO#.OO.O.O#OO#O....O..#...O.......O.#.....##...#O..O.O...#..##O......OO.OOO..O...#.#.O#O..\n.#.O##O#...#.O.#O..OO##....##O................#..#..#..#.O....#....#.#.#..#O..#...O.#O..#...O...OO..\n.....O.......O##......OO..#...O...#.O..O..O#.O..##..#.O..#....#.O.#O....O..OO.#OO.#..#...#.O...OO.O.\n..#O.###...O..###O..#..#....OO...O.O....O.#O#.#O..O..O..#..#..#....#..O.OOO...O.#O.....O..O....O.OO.\n.O#....O.##O..........O.#OO..O...O...#..##.OO...#.#..OO.O.....##O..OO...O...OOO..#.#....OO..#OO.O...\nO....O.#O#O....OO.......O..O.O.....O...#.O..#.OO..OO.....#....O...OO.##...O.....#O..O...O##.O.#O...#\nO...#..O....#.O.O..O#.....O..#.OO#O#OO##O##...O.O.....O...#...O...OOO...O#O...O.#OO.##..O..##O.O#...\n.#O..#O#..#.#........O..O#.......#...O.....O....O...O#..#.#..#...#.....#...#.#.....OO...O.##O.......\nO#........O#...O.O.##...O.OOO.........##..........#O#............O...O.#O.O#.#.#.#.O..#....#........\n.........#.#......##OOO....O.#O....OO..O....O.##....#......O.O........#O..#.O....##.........#.O.#...\n#.#.O..O....OO#......#.O#....#O..OO..O.....O..#.#O#.O.##O....O......#O......OOO....#O.#OO....O.O..##\nOO.O.##O.....O#....O.O#....O..###.O.O...O..#...O..#O....O..#OO...O...##.....O.#OO.....O...#O.O..#..O\n.OOO#...O..#O..O......OOO..O..O...#.O.O#...OO.......O.O.O##...#O..O.......##....O#.OO###.....O...O.O\n.O..O...#O.#....##.O.O.O.#......O.O.#.O#.O###....O...O..#..O#......O.........OO...OOO..#.O.....O....\n.O...##...O#.........O..O.O....O...#..#.....O.#..O.#O..O.#.O....#..O..#....#.#.OOO...O#...#O#.#O..#.\n#.#........O#.#.O.O.#.#.OOO.#.#.#O.#....#O.#.O..#..........#O..O#.##..O#O#.O.OOO..##..O....O.#.OO...\nO..O..O.........#OO.#....#....O..O#O..O#....O..O.O.........O............OOOO..OO#.O#......O..#.#..#.\n#..O.....#........O.....O....O#O##..O.O...##..#O.#.OO..#......#.#..O.......#....O..O.....#..O.....O.\n..O.#.##...O..##O.....#..........O........#.#.#O..O.OO..OO.....O.....O..OO..OOO.#.#.O#.....#.#..O#.#\n.................O...O.#.....#...O#....OO..#O...O....OO.OOO.##..##..O........#O#O..#....#.....#....#\n..#.#..O....##.#O.....#.OOO.O.O....O#..O....OO......O.#.O#...#.#.O...O....#.......#O.O.#O.O.##.##.#O\n..O..O.....#O........#O....#.#.........O.#....O..O.#.O...O#.O.#......O...O..#.......#O....##...##...\n....OO.#......O...O#...#....##.#.O..#.O#.O#..O#....##.O#...O..O.....#.#..#O.#.....##O#.O#..O.O....#.\n#..O..#..........#..O##O....#.#..O#...O..O.##.....OO..#...##O..####....O.......#........O.O....O.O..\n.#.OO#.O.O...#OO.O#.O.#.#....O..#...OO..O.....#O.....#..##...O..###OO..O....#..O#..#O...O..O..#O...#\n#..#OO#..O#.....#O..O.O.O...#.O..OO.O.O#..#....#O..O.OO........##..O......O#...OO#...#.....OO..#.#..\n.#.##.O.O..O.....OOO..OOO..#..OO#...##.O.O.#..#..O.....O#...O.#...O.......O#.#.#O#...O..#...##...O..\n.#..O..#.O.##O..O#.O.O....#.##....#.OO#.....##..OO#.#O.#.#...O#....OOOOO...O#.....##......O.........\n.....###......#O...OO..O#.O.....O.#O.....#O##.#.##..#..#O..OO##..O...OO..O####O....O...O..O.#.O#.#..\n.O#..O.O.O...#O..#..#....###..##...O.OOO.....O.#..O#.O.OO.O..O#...#.O...#.O#.O#.....#.OO..OO#..OO.O.\n#....O#...#.......O........#....O##.O#......O........O#.O...OO...O#.#.O...OO..O............OO...OO.#\n#.##...#O..OO...#.....#.O..O.O....O..O.....#O.OO.O...O.O.OO.##.O......#O.#.#O.#.O....O.OOO...O#O..O.\n..#.#OOO.O...#..O.O#O.O...#.#..........#.O.##.O.##.O....###.#.#...#.O........#...#.O......O..#.OO...\nOOO......##.....#....O......O.....#O#O...O......OOO.O.O....OO##O#.OOO#..O..O.#.#...O....#.O.O..O..##\n.....O.#....#.##O.OOO.O.....O.#O..#O...#....OO.#..#.O..OO.O.##...O#...O.O##.O......O.#..O#O.OOO....O\n#O..#...#..O...O.O.O...#..OOO..O.O..#...#.#..O.O#...O.......OO...O.##O...O#.....O.O....O..O.O.#.#O..\n..O...#...O#......O....OO...#.#..#.O...#...O.O...O.O.......O....O...O..#....O...O.....##..O.#...#.#.\n.#....#O#OO...O....##.#.O.O...O#........##.O.#...OO...O#.....O.......O.O.O##....#..OOO..........#...\n...#..O....O#......O...##O.#.O.O.OO.O.#......##.O..O......O..O.#..O....O.....#O##...#.#O.OO.#O#.###.\n#...#...#O.....#...O###......O#O..O.O.....O....O....#O....O#..#.O..OO###....O...O#......O.#O#....O..\n#.....#OOO##.....O...#.O.##O..##.O......#OO.O..#.........O#.O.#.O....O#OO.O.OO..O##O#.......O.....O.\n.#..#..#O.OOO.#...###.O...#..OO#.OOO#................O...O.O.........O.....#...#O.OO...O...#O.#..O.#\n.O#O..#.#O....O..O.#.....O....#.O#O.O...#.OO..O.#........#...O...O.O....O#O......OOO.O.....O#.#O..O.\n#.#.O#..O...#O..#....O.........O....##...#.#..#.O.#OO...O...O.#...#.....O#..O#.O#.O..OOO.O....O..O..\nO..O.......#O#O.O......O.O....O#OOO.....##O....#.##..#.OOOO....#..O....#...#.O...#O.....#O#O..O..#..\n..#...O.#.O#.O.O#.O....#.#....#.#...O.#O.##..O.#.....O...#...#....O.#..O#..#.#OOO#..OO.#.#O.#..O#..#\n.OO.O..#.#..#.#..#O.O....#O..#O.......#.#.O.#.#.#.##..#.#O.#.O..#.O...O.#..#...O..O......##.......O.\n...O.O..O.O.O.#.O#.O......O.O#.O#....OO......#O.#.O......O.OO.#O....O#........#..#..O.O#.#O#O..#...#\n...#..O....#OO.OO#.OO.#.....OOO.OO##OO#......O....O......#O#.#.O..O....O..O.O..#O...#......#........\n......#.....O#.O..#..O......O##.#.O........##.##...OOOO..#...#.O...#..OO.O.#.#.O.#...#.#OO#O....##..\n.OO....#...O.#....O......#.O....O.....#.O..O.#.O....O.O#OO.O.O.#............#.#O#..##O..O.#..#.O##..\n#.O#..#.#O..OO#O.O##..O...#.#O.....O..O.##....#.#...O.O....O.#...O..O#.#.OO..OOO..O..O.O.#..OO#...#.\n....#.O..OO..O.##.O.#O..O.O.O..#..#.O.O....###O..#OO#....#.........O.###.O...O#.O...O#.#.O#O.O#OO.O.\nO.#......O...OO.#.#.O..#.O............O#.O#O........#..O.#O#.#.#..O.OO..#.OO#.O.#.#O###..##..##.....\n..O#O....O...#....................O#..#.O.#....O.#OOO...O.OOO.#..#..O##.O...O.....O.#.OO.....O..#..#\n#.O....##O..##...#.#.OO...#.......#.#........#####.O.O......##.....#...........O#OO.O..#....O...O#..\n..........#.O.#.#.#OOO.O..O.O.O.#O...#..O#....O..O##.O..#O...OO#O..OOO..OO#O#.O.....O..O##.O...#....\nO###...O#.O......##O#..O#.........OO...O#O#O..#O#O..#O#O.#..#OO.#...##..##..#.#...#O.O....O...O....#\n.#.....O#OO.O#.#.OOO#.#.#.#...O.#..##.##...O.OO.O.....O..##..O.......O..#...O....##OO#..O#.OOO.#.##.\n`.trim()
  console.log('Part 1 result:', getNorthBeamsLoad(gridToStr(tiltPlatform(getGrid(inputStr)))))
  console.log('Part 2 result:', getNorthBeamsLoad(doCycles(inputStr, numberOfCycles)))
}
