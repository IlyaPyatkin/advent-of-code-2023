import cliProgress from 'cli-progress'

export const getGrid = (input: string): string[][] =>
    input
        .trim()
        .split('\n')
        .map(row => row.split(''))

const isRoundRock = (char: string): boolean => char === 'O'

export const getNorthBeamsLoad = (input: string): number => {
    const grid = getGrid(input)
    return grid
        .reduce(
            (acc, rowString, rowIndex) =>
                acc + rowString
                    .filter(isRoundRock).length * (grid.length - rowIndex),
            0);
}

const getIsVertical = (direction: Direction): boolean => direction === 'north' || direction === 'south'

const tiltSector = (grid: string[][], sectorIndex: number, direction: Direction) => {
    let lastEmptyIndex = undefined;
    const isVertical = getIsVertical(direction)
    const loops = isVertical ? grid[0].length : grid.length;
    const isReversed = direction === 'south' || direction === 'east';
    for (let index = isReversed ? loops - 1 : 0; isReversed ? index >= 0 :  index < loops; isReversed ? index-- : index++) {
        const currentIndex = isVertical ? index : sectorIndex
        const currentSectorIndex = isVertical ? sectorIndex : index
        switch (grid[currentIndex][currentSectorIndex]) {
            case '.':
                if (lastEmptyIndex === undefined) {
                    lastEmptyIndex = index;
                }
                break;
            case '#':
                lastEmptyIndex = undefined;
                break;
            case 'O':
                if (lastEmptyIndex !== undefined) {
                    grid[isVertical ? lastEmptyIndex : sectorIndex][isVertical ? sectorIndex : lastEmptyIndex] = 'O';
                    grid[currentIndex][currentSectorIndex] = '.';
                    lastEmptyIndex += isReversed ? -1 : 1;
                }
                break;
        }
    }
}


export const tiltPlatform = (grid: string[][], direction: Direction = 'north') => {
    const isVertical = getIsVertical(direction)
    const loops = isVertical ? grid.length : grid[0].length;
    for (let index = 0; index < loops; index++) {
        tiltSector(grid, index, direction);
    }

    return grid
}

const directions = ['north', 'west', 'south', 'east'] as const;

type Direction = typeof directions[number];

export const gridToPlatformString = (grid: string[][]): string => grid.map(row => row.join('')).join('\n');

export const doCycles = (input: string, cycles: number): string => {
    const grid = getGrid(input);
    const progressBar = new cliProgress.SingleBar({
        format: 'progress [{bar}] {percentage}% | ETA: {eta_formatted} | {value}/{total}'
    });
    progressBar.start(cycles, 0);

    let now = Date.now();

    for (let index = 0; index < cycles; index++) {
        for (const direction of directions) {
            tiltPlatform(grid, direction);
        }

        if ((index % 100 === 0) && (Date.now() - now > 100)) {
            progressBar.update(index);
            now = Date.now();
        }
    }
    progressBar.update(cycles)
    progressBar.stop();

    return gridToPlatformString(grid);
}

const inputStr = `
...OO..##.......O..O....O..O#...O.OO#.#..O...O....OOO##..O##O#...#..O....#........#O.##O#..OO#..OO.O
...#.#.#.O#...OO.#........O#.#............#...O...#...OOOO#...#..#..#.O...#..#....O.#O###..O#..OOO.O
..##..##.O...#..OO.O.#.#O#.O.OO..#.....#.....#O##O.#..###.O.........OOOO#...O.#.........##O..O.#O.O.
.....#.##O##.#.#O#....#.#O.....OO.#.#OO##OOOO..#O..#.#.#.O..........O.#......O...OO.........#.OO....
.#.O#O...#...#...O#O....O.......O#.O..OOO...#.##OO.#.O..O.#.O...O..O.#.#.#...#..O...OO..OO.....O.#.O
....#..#...#.##................O..OO.....##.........#...#..........#.OOO...O#..##.##.......#O..O.##.
.............OO#...O.#....O....O...##...OOO....O.O..O...#......O..O#.O#.#..........#.#....#O...#O..O
O.....O.O...O...OO..#...#.OO........#..##O...O.O.#.#..#O..##O.##..O......#.....O......#....O.....OO.
.#..O....O.O..O.#..#.......#OOO...#.O..O..O#...OO.#...##O.O..O.OO...O....#O.O.....O#....O....O.#....
...#....#OO...O....#.##.O#####..O...#...#...#..O..#.##.##OO...O#.........O..OO......#..OO.#...##O...
...OO...........O....O.##..#.O##.....O..#.......O#..#....#O.#...#.#.O..O#..#..O..O##..O...#..O##.O..
.....#OO#.O......#.O..O..O.....#.#.OOOOO..#......O.OO.OO.....#...#O....OO.O.#....##O..O..O......#...
.O#O.#.#O.....O.#..O..#O..#O.O..O.......O....O.....#...#........#.#....O#..#......#O....OO#.....O.##
.O..###.....O..##O...O..O..O.#....#.......#..##......O#O.#OOO...OOO...O..O#..#.#...OOO#..........O..
#..O#OO..#O.O..OOO...#.#...O..O.O.......#..#...#..O...O.O#.O....#...#..O.O....O.#.#...#.....OO...#.#
...O..#O............#.......#..##OO..##....#OO.OO..##..#OO.#.O..O.O........O........O.##...O.O.O...#
.O...O.....#....OO#.O#.###.O....#.O...O#....#....O....O..OO.O....O#OO#.#O#......OO..OOO...O.#.O.....
.O..O................OO##O..#....O..#.O..#.#............#.##.........#..O.O.O..O#...O.#OOO#..#.#...#
O..O.........O##...#......#..#O....#O#....O.O.O.O...#......O#O..#...O..##.#..O.O.#O.......OO...O#O##
OOOO.#O.O#.....#..#...#..O...#O....#.#.O.#..O.##.O....#.##.O.O....OO...O.......#..#......#...O###..O
..#.......#...O..O..OO.O#...OO.OO..O#.O....#OO....#.#O........##O.#.....###....OO#..O.O.O.......O#.#
#.O.......#OO#...#O#O#..OO.O.OOO#O#....OO..O#.O.#.O...##.#.O..#...O.O.....O..#.OO#.O...O.#....O.O..#
.OO#.OO###....O........#..O..##.O...OOO.#...O......O#....#.O#.O......O.......O.#..#O..O...#..#...#..
....##O....O.##......##.O.##......#....OOOOO#......#.#.....#O...#...#..OO##.##.....##.O...O.O##.#..O
.#...O.#OO........O..OO...##O.O..O.....O..#OOO....#..#O#.#O......O.O.##.....O......O.O.#..#.#..OO...
O...O....#...O##.....#......O.O..O..O..#...O..OO#..O#.#.....#....O...##.#.#O.O........#.O#O#OO.#..#.
#..#...#OO...O#..#.#.#O#O..........O..O...O.O#O...OOO..O...O.O#.O##....O.......O..O..#...OO..OOO....
.#.OOO#....O#.....#.OOO.........O.........O.......#O#O......O#O.O.#O#.#..O.....#.....#..O.##O.O#...#
...#....O.O##.O...O.O..OOOO##.............OO....O.O....O..O....#OO..O....OO.OO.O..#.#......O.O#.....
#....O...OO.#.....O...OO.#O.#O....#....##.O..#O..O.O...#...O#.#OOOOOO......#.O.##......##..###.O.O..
.#.O..O.##O.#.........O.O.#O....#......O.#....O...#O.#.OO.OOO..#..O.O.##..#.....#..O.....O#..O#....O
#.OO.#...O...O##O.O.O......#....O..O.O.......O.....#...OOO....O.O#.#..O.O..OO#.OOO..O...#..O..O.OO.#
.#..#........##O.O.....OO.....O...OO#O..#..O.....O...O....O.#.#.......OO.....O..O.O..O....#.#O.....#
...O.O.OO.O##OO..O.OO.......#O#O#..O#...O.#O.....#.....#.OO.#..#....O..OO.O.....O....O..#.OO.......O
O#..........O.#..OO...#OOO.O..O.##..#O##O.O.#O#.OO.O.O#...O#...OOO#.O.OO.O.#O..#O.#.......##O..O...O
.#.O.....#..O#....O.###.....##...O.....................O....OO#..O#.#.#...O....##...O.#...O..#.O##.#
..O...#...O#.#.O.O.O...O.......OO#.#........O...##.O...#..##..OO.#..O.#.#.O..OO....O.O..#...#O.O#.#.
....OOO#.O#...#...O#.O.OOO...##.....O...OO...O..OOO.O.O.O..##.#O#.#O.O...#O..O..#.#..OOOO..O.#.O#...
.O............#....#..OO...#..OO.OO....O..O.OOO......O....O#OO....#............#.OO#.O##.O#O..OOO.#O
.O......O.#.#.#..O.......O.........#O.O...#O#...#.OO...#...#.O..O..O.O.#.O.O.....#.#......##.O.O...O
...O..O.........#O..O.O..O###O#..#..#OO#OO..#O.#.....##..OO...OOO#...#O.........OOO.OO.##..#O.O..O.O
.#.##.#.#OOO#.OO.O.O#OO#O....O..#...O.......O.#.....##...#O..O.O...#..##O......OO.OOO..O...#.#.O#O..
.#.O##O#...#.O.#O..OO##....##O................#..#..#..#.O....#....#.#.#..#O..#...O.#O..#...O...OO..
.....O.......O##......OO..#...O...#.O..O..O#.O..##..#.O..#....#.O.#O....O..OO.#OO.#..#...#.O...OO.O.
..#O.###...O..###O..#..#....OO...O.O....O.#O#.#O..O..O..#..#..#....#..O.OOO...O.#O.....O..O....O.OO.
.O#....O.##O..........O.#OO..O...O...#..##.OO...#.#..OO.O.....##O..OO...O...OOO..#.#....OO..#OO.O...
O....O.#O#O....OO.......O..O.O.....O...#.O..#.OO..OO.....#....O...OO.##...O.....#O..O...O##.O.#O...#
O...#..O....#.O.O..O#.....O..#.OO#O#OO##O##...O.O.....O...#...O...OOO...O#O...O.#OO.##..O..##O.O#...
.#O..#O#..#.#........O..O#.......#...O.....O....O...O#..#.#..#...#.....#...#.#.....OO...O.##O.......
O#........O#...O.O.##...O.OOO.........##..........#O#............O...O.#O.O#.#.#.#.O..#....#........
.........#.#......##OOO....O.#O....OO..O....O.##....#......O.O........#O..#.O....##.........#.O.#...
#.#.O..O....OO#......#.O#....#O..OO..O.....O..#.#O#.O.##O....O......#O......OOO....#O.#OO....O.O..##
OO.O.##O.....O#....O.O#....O..###.O.O...O..#...O..#O....O..#OO...O...##.....O.#OO.....O...#O.O..#..O
.OOO#...O..#O..O......OOO..O..O...#.O.O#...OO.......O.O.O##...#O..O.......##....O#.OO###.....O...O.O
.O..O...#O.#....##.O.O.O.#......O.O.#.O#.O###....O...O..#..O#......O.........OO...OOO..#.O.....O....
.O...##...O#.........O..O.O....O...#..#.....O.#..O.#O..O.#.O....#..O..#....#.#.OOO...O#...#O#.#O..#.
#.#........O#.#.O.O.#.#.OOO.#.#.#O.#....#O.#.O..#..........#O..O#.##..O#O#.O.OOO..##..O....O.#.OO...
O..O..O.........#OO.#....#....O..O#O..O#....O..O.O.........O............OOOO..OO#.O#......O..#.#..#.
#..O.....#........O.....O....O#O##..O.O...##..#O.#.OO..#......#.#..O.......#....O..O.....#..O.....O.
..O.#.##...O..##O.....#..........O........#.#.#O..O.OO..OO.....O.....O..OO..OOO.#.#.O#.....#.#..O#.#
.................O...O.#.....#...O#....OO..#O...O....OO.OOO.##..##..O........#O#O..#....#.....#....#
..#.#..O....##.#O.....#.OOO.O.O....O#..O....OO......O.#.O#...#.#.O...O....#.......#O.O.#O.O.##.##.#O
..O..O.....#O........#O....#.#.........O.#....O..O.#.O...O#.O.#......O...O..#.......#O....##...##...
....OO.#......O...O#...#....##.#.O..#.O#.O#..O#....##.O#...O..O.....#.#..#O.#.....##O#.O#..O.O....#.
#..O..#..........#..O##O....#.#..O#...O..O.##.....OO..#...##O..####....O.......#........O.O....O.O..
.#.OO#.O.O...#OO.O#.O.#.#....O..#...OO..O.....#O.....#..##...O..###OO..O....#..O#..#O...O..O..#O...#
#..#OO#..O#.....#O..O.O.O...#.O..OO.O.O#..#....#O..O.OO........##..O......O#...OO#...#.....OO..#.#..
.#.##.O.O..O.....OOO..OOO..#..OO#...##.O.O.#..#..O.....O#...O.#...O.......O#.#.#O#...O..#...##...O..
.#..O..#.O.##O..O#.O.O....#.##....#.OO#.....##..OO#.#O.#.#...O#....OOOOO...O#.....##......O.........
.....###......#O...OO..O#.O.....O.#O.....#O##.#.##..#..#O..OO##..O...OO..O####O....O...O..O.#.O#.#..
.O#..O.O.O...#O..#..#....###..##...O.OOO.....O.#..O#.O.OO.O..O#...#.O...#.O#.O#.....#.OO..OO#..OO.O.
#....O#...#.......O........#....O##.O#......O........O#.O...OO...O#.#.O...OO..O............OO...OO.#
#.##...#O..OO...#.....#.O..O.O....O..O.....#O.OO.O...O.O.OO.##.O......#O.#.#O.#.O....O.OOO...O#O..O.
..#.#OOO.O...#..O.O#O.O...#.#..........#.O.##.O.##.O....###.#.#...#.O........#...#.O......O..#.OO...
OOO......##.....#....O......O.....#O#O...O......OOO.O.O....OO##O#.OOO#..O..O.#.#...O....#.O.O..O..##
.....O.#....#.##O.OOO.O.....O.#O..#O...#....OO.#..#.O..OO.O.##...O#...O.O##.O......O.#..O#O.OOO....O
#O..#...#..O...O.O.O...#..OOO..O.O..#...#.#..O.O#...O.......OO...O.##O...O#.....O.O....O..O.O.#.#O..
..O...#...O#......O....OO...#.#..#.O...#...O.O...O.O.......O....O...O..#....O...O.....##..O.#...#.#.
.#....#O#OO...O....##.#.O.O...O#........##.O.#...OO...O#.....O.......O.O.O##....#..OOO..........#...
...#..O....O#......O...##O.#.O.O.OO.O.#......##.O..O......O..O.#..O....O.....#O##...#.#O.OO.#O#.###.
#...#...#O.....#...O###......O#O..O.O.....O....O....#O....O#..#.O..OO###....O...O#......O.#O#....O..
#.....#OOO##.....O...#.O.##O..##.O......#OO.O..#.........O#.O.#.O....O#OO.O.OO..O##O#.......O.....O.
.#..#..#O.OOO.#...###.O...#..OO#.OOO#................O...O.O.........O.....#...#O.OO...O...#O.#..O.#
.O#O..#.#O....O..O.#.....O....#.O#O.O...#.OO..O.#........#...O...O.O....O#O......OOO.O.....O#.#O..O.
#.#.O#..O...#O..#....O.........O....##...#.#..#.O.#OO...O...O.#...#.....O#..O#.O#.O..OOO.O....O..O..
O..O.......#O#O.O......O.O....O#OOO.....##O....#.##..#.OOOO....#..O....#...#.O...#O.....#O#O..O..#..
..#...O.#.O#.O.O#.O....#.#....#.#...O.#O.##..O.#.....O...#...#....O.#..O#..#.#OOO#..OO.#.#O.#..O#..#
.OO.O..#.#..#.#..#O.O....#O..#O.......#.#.O.#.#.#.##..#.#O.#.O..#.O...O.#..#...O..O......##.......O.
...O.O..O.O.O.#.O#.O......O.O#.O#....OO......#O.#.O......O.OO.#O....O#........#..#..O.O#.#O#O..#...#
...#..O....#OO.OO#.OO.#.....OOO.OO##OO#......O....O......#O#.#.O..O....O..O.O..#O...#......#........
......#.....O#.O..#..O......O##.#.O........##.##...OOOO..#...#.O...#..OO.O.#.#.O.#...#.#OO#O....##..
.OO....#...O.#....O......#.O....O.....#.O..O.#.O....O.O#OO.O.O.#............#.#O#..##O..O.#..#.O##..
#.O#..#.#O..OO#O.O##..O...#.#O.....O..O.##....#.#...O.O....O.#...O..O#.#.OO..OOO..O..O.O.#..OO#...#.
....#.O..OO..O.##.O.#O..O.O.O..#..#.O.O....###O..#OO#....#.........O.###.O...O#.O...O#.#.O#O.O#OO.O.
O.#......O...OO.#.#.O..#.O............O#.O#O........#..O.#O#.#.#..O.OO..#.OO#.O.#.#O###..##..##.....
..O#O....O...#....................O#..#.O.#....O.#OOO...O.OOO.#..#..O##.O...O.....O.#.OO.....O..#..#
#.O....##O..##...#.#.OO...#.......#.#........#####.O.O......##.....#...........O#OO.O..#....O...O#..
..........#.O.#.#.#OOO.O..O.O.O.#O...#..O#....O..O##.O..#O...OO#O..OOO..OO#O#.O.....O..O##.O...#....
O###...O#.O......##O#..O#.........OO...O#O#O..#O#O..#O#O.#..#OO.#...##..##..#.#...#O.O....O...O....#
.#.....O#OO.O#.#.OOO#.#.#.#...O.#..##.##...O.OO.O.....O..##..O.......O..#...O....##OO#..O#.OOO.#.##.
`.trim()

export const numberOfCycles = 1000000000

if (Bun.env.NODE_ENV !== 'test') {
    console.log('Part 1 result:', getNorthBeamsLoad(gridToPlatformString(tiltPlatform(getGrid(inputStr)))))
    console.log('Part 2 result:', getNorthBeamsLoad(doCycles(inputStr, numberOfCycles)))
}
