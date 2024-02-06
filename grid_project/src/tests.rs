
#[cfg(test)]
mod tests {
    use crate::{CharGrid, Direction, do_cycles, get_grid, get_north_beams_load, grid_to_platform_string, tilt_platform};

    // Example test values
    const TEST1_STATE: &str = "
O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....";
    const TEST1_STATE_AFTER_TILT: &str = "
OOOO.#.O..
OO..#....#
OO..O##..O
O..#.OO...
........#.
..#....#.#
..O..#.O.O
..O.......
#....###..
#....#....";
    const AFTER1_CYCLE_RESULT: &str = ".....#....
....#...O#
...OO##...
.OO#......
.....OOO#.
.O#...O#.#
....O#....
......OOOO
#...O###..
#..OO#....";
    const AFTER2_CYCLES_RESULT: &str = ".....#....
....#...O#
.....##...
..O#......
.....OOO#.
.O#...O#.#
....O#...O
.......OOO
#..OO###..
#.OOO#...O";
    const AFTER3_CYCLES_RESULT: &str = ".....#....
....#...O#
.....##...
..O#......
.....OOO#.
.O#...O#.#
....O#...O
.......OOO
#...O###.O
#.OOO#...O";
    const NUMBER_OF_CYCLES: u64 = 1000000000; // Example number of cycles

    #[test]
    fn tilting_works_correctly() {
        let mut grid = CharGrid::from_2d_vec(get_grid(TEST1_STATE));
        let direction = Direction::North;
        tilt_platform(&mut grid, direction);
        assert_eq!(grid_to_platform_string(&grid.to_2d_vec()), TEST1_STATE_AFTER_TILT.trim());
    }

    #[test]
    fn calculating_north_beams_load_is_correct() {
        assert_eq!(get_north_beams_load(TEST1_STATE_AFTER_TILT), 136);
    }

    #[test]
    fn state_after_1_cycle_is_correct() {
        let after1_cycles = do_cycles(TEST1_STATE, 1);
        assert_eq!(after1_cycles, AFTER1_CYCLE_RESULT);
    }

    #[test]
    fn state_after_2_cycles_is_correct() {
        let after2_cycles = do_cycles(TEST1_STATE, 2);
        assert_eq!(after2_cycles, AFTER2_CYCLES_RESULT);
    }

    #[test]
    fn state_after_3_cycles_is_correct() {
        let after3_cycles = do_cycles(TEST1_STATE, 3);
        assert_eq!(after3_cycles, AFTER3_CYCLES_RESULT);
    }

    #[test]
    fn north_beams_load_after_n_cycles_is_correct() {
        let result = do_cycles(TEST1_STATE, NUMBER_OF_CYCLES);
        assert_eq!(get_north_beams_load(&result), 64); // Example expected load
    }
}
