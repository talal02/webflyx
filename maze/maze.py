from window import Window
from cell import Cell
import random
import time

class Maze:
  def __init__(
      self,
      x1: int,
      y1: int,
      num_rows: int,
      num_cols: int,
      cell_size_x: float,
      cell_size_y: float,
      win: Window = None,
      seed: int = None,
   ) -> None:
    self.__x1 = x1
    self.__y1 = y1
    self.__num_rows = num_rows
    self.__num_cols = num_cols
    self.__cell_size_x = cell_size_x
    self.__cell_size_y = cell_size_y
    self.__win = win
    if seed is not None:
      random.seed(seed)
    self.__cells = []
    self.__create_cells()
    self.__break_walls_r(0, 0)
    self.__reset_cells_visited()
    self.__break_entrance_and_exit()
      
  def __create_cells(self):
    for col in range(self.__num_cols):
      self.__cells.append([])
      for row in range(self.__num_rows):
        self.__cells[col].append(Cell(self.__win))
        self.__draw_cell(col, row)
    
  def __draw_cell(self, col, row):
    x1 = self.__x1 + col * self.__cell_size_x
    y1 = self.__y1 + row * self.__cell_size_y
    x2 = x1 + self.__cell_size_x
    y2 = y1 + self.__cell_size_y
    self.__cells[col][row].draw(x1, y1, x2, y2)
    self.__animate()
    
  
  def __animate(self):
    if self.__win is None:
      return
    self.__win.redraw()
    time.sleep(0.05)
    
  def __break_entrance_and_exit(self):
    self.__cells[0][0].has_top_wall = False
    self.__cells[self.__num_cols - 1][self.__num_rows - 1].has_bottom_wall = False
    self.__draw_cell(0, 0)
    self.__draw_cell(self.__num_cols - 1, self.__num_rows - 1)

  def __break_walls_r(self, i, j):
    current_cell = self.__cells[i][j]
    current_cell.visited = True
    while True:
      neighbors = []
      if i > 0 and not self.__cells[i - 1][j].visited:
        neighbors.append((i - 1, j, "left"))
      if i < self.__num_cols - 1 and not self.__cells[i + 1][j].visited:
        neighbors.append((i + 1, j, "right"))
      if j > 0 and not self.__cells[i][j - 1].visited:
        neighbors.append((i, j - 1, "up"))
      if j < self.__num_rows - 1 and not self.__cells[i][j + 1].visited:
        neighbors.append((i, j + 1, "down"))

      if len(neighbors) == 0:
        self.__draw_cell(i, j)
        return

      next_i, next_j, direction = random.choice(neighbors)
      next_cell = self.__cells[next_i][next_j]
      if direction == "left":
        current_cell.has_left_wall = False
        next_cell.has_right_wall = False
      elif direction == "right":
        current_cell.has_right_wall = False
        next_cell.has_left_wall = False
      elif direction == "up":
        current_cell.has_top_wall = False
        next_cell.has_bottom_wall = False
      elif direction == "down":
        current_cell.has_bottom_wall = False
        next_cell.has_top_wall = False

      self.__draw_cell(i, j)
      self.__draw_cell(next_i, next_j)
      self.__break_walls_r(next_i, next_j)

  def __reset_cells_visited(self):
    for col in range(self.__num_cols):
      for row in range(self.__num_rows):
        self.__cells[col][row].visited = False

  def solve(self):
    self.__reset_cells_visited()
    return self.__solve_r(0, 0)

  def __solve_r(self, i, j):
    self.__animate()
    current_cell = self.__cells[i][j]
    current_cell.visited = True
    if i == self.__num_cols - 1 and j == self.__num_rows - 1:
      return True

    directions = [
      (i + 1, j, "right", current_cell.has_right_wall),
      (i - 1, j, "left", current_cell.has_left_wall),
      (i, j + 1, "down", current_cell.has_bottom_wall),
      (i, j - 1, "up", current_cell.has_top_wall),
    ]

    for next_i, next_j, direction, has_wall in directions:
      if next_i < 0 or next_i >= self.__num_cols or next_j < 0 or next_j >= self.__num_rows:
        continue
      next_cell = self.__cells[next_i][next_j]
      if has_wall or next_cell.visited:
        continue

      current_cell.draw_move(next_cell)
      if self.__solve_r(next_i, next_j):
        return True
      current_cell.draw_move(next_cell, undo=True)

    return False

