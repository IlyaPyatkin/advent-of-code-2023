mod tests;


struct CharGrid {
    rows: usize,
    cols: usize,
    grid: Vec<char>,
}

impl CharGrid {
    // Constructor that converts Vec<Vec<char>> to CharGrid
    fn from_2d_vec(input: Vec<Vec<char>>) -> Self {
        let rows = input.len();
        let cols = if rows > 0 { input[0].len() } else { 0 };
        let grid = input.into_iter().flatten().collect();

        CharGrid { rows, cols, grid }
    }

    fn to_2d_vec(&self) -> Vec<Vec<char>> {
        (0..self.rows).map(|r| {
            self.grid[r * self.cols..(r + 1) * self.cols].to_vec()
        }).collect()
    }

    fn get(&self, r: usize, c: usize) -> Option<char> {
        if r >= self.rows || c >= self.cols {
            None
        } else {
            Some(self.grid[r * self.cols + c])
        }
    }

    fn set(&mut self, r: usize, c: usize, value: char) {
        if r < self.rows && c < self.cols {
            self.grid[r * self.cols + c] = value;
        }
    }
}

fn get_grid(input: &str) -> Vec<Vec<char>> {
    input
        .trim()
        .lines()
        .map(|row| row.chars().collect())
        .collect()
}

fn is_round_rock(c: char) -> bool {
    c == 'O'
}

fn get_north_beams_load(input: &str) -> usize {
    let grid = get_grid(input);
    grid.iter()
        .enumerate()
        .fold(0, |acc, (row_index, row)| {
            acc + row.iter()
                .filter(|&&c| is_round_rock(c))
                .count() * (grid.len() - row_index)
        })
}

#[derive(Debug, PartialEq, Eq)]
enum Direction {
    North,
    West,
    South,
    East,
}

fn is_vertical(direction: &Direction) -> bool {
    match direction {
        Direction::North | Direction::South => true,
        _ => false,
    }
}

fn tilt_sector(grid: &mut CharGrid, sector_index: usize, direction: &Direction) {
    let mut last_empty_index: Option<usize> = None;
    let is_vertical = is_vertical(direction);
    let loops = if is_vertical { grid.rows } else { grid.cols };
    let is_reversed = direction == &Direction::South || direction == &Direction::East;

    let mut index = if is_reversed { loops - 1 } else { 0 };
    while is_reversed || !is_reversed && index < loops {
        let current_index = if is_vertical { index } else { sector_index };
        let current_sector_index = if is_vertical { sector_index } else { index };

        match grid.get(current_index, current_sector_index) {
            Some('.') => {
                if last_empty_index.is_none() {
                    last_empty_index = Some(index)
                }
            },
            Some('#') => last_empty_index = None,
            Some('O') => {
                if let Some(empty_idx) = last_empty_index {
                    grid.set(if is_vertical { empty_idx } else { sector_index }, if is_vertical { sector_index } else { empty_idx }, 'O');
                    grid.set(current_index, current_sector_index, '.');
                    last_empty_index = if is_reversed { Some(empty_idx - 1) } else { Some(empty_idx + 1) };
                }
            }
            _ => {}
        }

        if is_reversed {
            if index == 0 { break; } // Prevent underflow
            index -= 1;
        } else {
            index += 1;
        }
    }
}

fn tilt_platform(grid: &mut CharGrid, direction: Direction) {
    let loops = if is_vertical(&direction) { grid.cols } else { grid.rows };
    for index in 0..loops {
        tilt_sector(grid, index, &direction);
    }
    // In Rust, you would typically return the modified grid directly, or modify it in place as we've done here.
}

use indicatif::{ProgressBar, ProgressStyle};

fn grid_to_platform_string(grid: &Vec<Vec<char>>) -> String {
    grid.iter()
        .map(|row| row.iter().collect::<String>())
        .collect::<Vec<_>>()
        .join("\n")
}

fn do_cycles(input: &str, cycles: u64) -> String {
    let mut grid = CharGrid::from_2d_vec(get_grid(input)); // Assuming `get_grid` is implemented as shown earlier

    let progress_bar = ProgressBar::new(cycles as u64);

    progress_bar.set_style(ProgressStyle::with_template("progress [{bar:40.cyan/blue}] {percent}% | ETA: {eta} | {pos}/{len}")
        .unwrap()
        .progress_chars("##-"));

    progress_bar.set_message("Processing...");

    for _index in 0..cycles {
        for direction in [Direction::North, Direction::West, Direction::South, Direction::East] {
            tilt_platform(&mut grid, direction); // Assuming `tilt_platform` is adapted for Rust
        }

        // Update progress every 100000 cycles or if not implemented, you can adjust the frequency
        if _index % 1000 == 0 {
            progress_bar.set_position(_index);
        }
    }
    progress_bar.set_position(cycles);
    progress_bar.finish_with_message("Done");

    grid_to_platform_string(&grid.to_2d_vec())
}





fn main() {
    let input = "
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
".trim();

    let result = do_cycles(input, 1000000000);
    let load = get_north_beams_load(&result);
    println!("North beams load: {}", load);
}
