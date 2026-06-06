import unittest

from maze import Maze


class Tests(unittest.TestCase):
    def test_maze_create_cells(self):
        num_cols = 12
        num_rows = 10
        m1 = Maze(0, 0, num_rows, num_cols, 10, 10)
        self.assertEqual(
            len(m1._Maze__cells),
            num_cols,
        )
        self.assertEqual(
            len(m1._Maze__cells[0]),
            num_rows,
        )

    def test_maze_reset_cells_visited(self):
        num_cols = 4
        num_rows = 4
        m1 = Maze(0, 0, num_rows, num_cols, 10, 10, seed=0)
        for col in range(num_cols):
            for row in range(num_rows):
                m1._Maze__cells[col][row].visited = True
        m1._Maze__reset_cells_visited()
        for col in range(num_cols):
            for row in range(num_rows):
                self.assertFalse(m1._Maze__cells[col][row].visited)

    def test_maze_break_entrance_and_exit(self):
        num_cols = 12
        num_rows = 10
        m1 = Maze(0, 0, num_rows, num_cols, 10, 10)
        m1._Maze__break_entrance_and_exit()
        self.assertFalse(m1._Maze__cells[0][0].has_top_wall)
        self.assertFalse(m1._Maze__cells[num_cols - 1][num_rows - 1].has_bottom_wall)

    def test_maze_solve(self):
        num_cols = 4
        num_rows = 4
        m1 = Maze(0, 0, num_rows, num_cols, 10, 10, seed=0)
        self.assertTrue(m1.solve())


if __name__ == "__main__":
    unittest.main()