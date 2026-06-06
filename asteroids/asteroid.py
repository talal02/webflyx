import pygame
import random

from asteroids.circleshape import CircleShape
from asteroids.constants import LINE_WIDTH, ASTEROID_MIN_RADIUS
from asteroids.logger import log_event

class Asteroid(CircleShape):
    def __init__(self, x, y, radius):
        super().__init__(x, y, radius)
    
    def draw(self, screen):
      pygame.draw.circle(screen, "white", self.position, self.radius, LINE_WIDTH)
    
    def update(self, dt):
      self.position += self.velocity * dt
    
    def split(self):
      self.kill()
      if self.radius > ASTEROID_MIN_RADIUS:
        log_event("asteroid_split")
        angle = random.uniform(20, 50)
        new_radius = self.radius - ASTEROID_MIN_RADIUS
        asteroid1 = Asteroid(self.position.x, self.position.y, new_radius)
        asteroid2 = Asteroid(self.position.x, self.position.y, new_radius)
        asteroid1.velocity = self.velocity.rotate(angle) * 1.2
        asteroid2.velocity = self.velocity.rotate(-angle) * 1.2