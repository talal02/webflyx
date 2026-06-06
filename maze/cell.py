from window import Window
from point import Point, Line

class Cell:
  def __init__(self, window: Window = None):
    self.has_left_wall = True
    self.has_right_wall = True
    self.has_top_wall = True
    self.has_bottom_wall = True
    self.visited = False
    self.__x1 = -1
    self.__y1 = -1
    self.__x2 = -1
    self.__y2 = -1
    self.__win = window
  
  def draw(self, x1, y1, x2, y2):
    self.__x1 = x1
    self.__y1 = y1
    self.__x2 = x2
    self.__y2 = y2
    if self.__win is None:
      return
    background_color = "#d9d9d9"
    if self.has_left_wall:
      self.__win.draw_line(Line(Point(x1, y1), Point(x1, y2)))
    else:
      self.__win.draw_line(Line(Point(x1, y1), Point(x1, y2)), fill=background_color)
    if self.has_right_wall:
      self.__win.draw_line(Line(Point(x2, y1), Point(x2, y2)))
    else:
      self.__win.draw_line(Line(Point(x2, y1), Point(x2, y2)), fill=background_color)
    if self.has_top_wall:
      self.__win.draw_line(Line(Point(x1, y1), Point(x2, y1)))
    else:
      self.__win.draw_line(Line(Point(x1, y1), Point(x2, y1)), fill=background_color)
    if self.has_bottom_wall:
      self.__win.draw_line(Line(Point(x1, y2), Point(x2, y2)))
    else:
      self.__win.draw_line(Line(Point(x1, y2), Point(x2, y2)), fill=background_color)
    

  def draw_move(self, to_cell: "Cell", undo: bool = False) -> None:
    if self.__win is None:
      return
    line_color = "gray"
    if not undo:
      line_color = "red"
    if self.__x1 == to_cell.__x1: # same x coordinate, so vertical line
      self.__win.draw_line(Line(Point(self.__x1, self.__y1), Point(self.__x1, self.__y2)), fill=line_color)
    elif self.__y1 == to_cell.__y1: # same y coordinate, so horizontal line
      self.__win.draw_line(Line(Point(self.__x1, self.__y1), Point(self.__x2, self.__y1)), fill=line_color)
    