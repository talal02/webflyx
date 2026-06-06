from window import Window
from maze import Maze

if __name__ == "__main__":
  window = Window(1100, 786)
  maze = Maze(30, 30, 5, 5, 75, 75, window)
  maze.solve()
  window.wait_for_close()