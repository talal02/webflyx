from tkinter import Tk, BOTH, Canvas
from point import Line

class Window():
  def __init__(self, width, height):
    self.width = width
    self.height = height
    self.__root = Tk()
    self.canvas = Canvas(self.__root, width=self.width, height=self.height)
    self.canvas.pack(fill=BOTH, expand=1)
    self.is_running = False
  
  def redraw(self):
    self.__root.update_idletasks()
    self.__root.update()
    
  def wait_for_close(self):
    self.is_running = True
    while self.is_running:
      self.redraw()
      
  def close(self):
    self.is_running = False
    self.__root.protocol("WM_DELETE_WINDOW", self.close)

  def draw_line(self, line: Line, fill="black"):
    line.draw(self.canvas, fill=fill)