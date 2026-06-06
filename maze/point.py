from tkinter import Canvas


class Point():
  def __init__(self, x, y):
    self.x = x
    self.y = y

  def __str__(self):
    return f"({self.x}, {self.y})"

class Line():
  def __init__(self, start, end):
    self.start = start
    self.end = end

  def __str__(self):
    return f"{self.start} -> {self.end}"
  
  def draw(self, canvas: Canvas, fill="black", width=2):
    canvas.create_line(self.start.x, self.start.y, self.end.x, self.end.y, fill=fill, width=width)
