var Matter = require('matter-js');

class Bullet {
  constructor(x, y, r, vel, angle, damage, originPlayer) {
    this.x = x;
    this.y = y;
    this.r = r;
    // this.vx = vel * Math.cos(angle);
    // this.vy = vel * Math.sin(angle);
    this.vel = vel;
    this.angle = angle;
    this.damage = damage;
    this.originPlayer = originPlayer;
  }

  update(bodies) {
    // Ensures that the bullet only moves a maximum of 5 pixels at a time
    // Prevents fast bullets from going through objects without skipping them
    var distanceMoved = 0;
    var step = this.vel / Math.ceil(this.vel / 5)
    // Keeps moving until it collides
    while (distanceMoved < this.vel && !collide) {
      // this.x += this.vx * 0.5;
      // this.y += this.vy * 0.5;
      this.x += step * Math.cos(this.angle);
      this.y += step * Math.sin(this.angle);
      distanceMoved += step;
      var collide = this.checkCollisions(bodies)
    }
    return collide;
  }

  checkCollisions(bodies) {
    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      // If body is circle and is not the player who shot the bullet
      if (body.circleRadius && body.label != this.originPlayer) {
        var dSq = Math.pow(this.x - body.position.x, 2) + Math.pow(this.y - body.position.y, 2);
        // Check if bullet has hit the circle
        if (dSq < Math.pow(body.circleRadius, 2)) {
          Matter.Body.applyForce(body, { x: this.x, y: this.y }, {
            x: 0.5 * Math.cos(this.angle),
            y: 0.5 * Math.sin(this.angle)
          });
          return true;
        }
      } else if (body.vertices.length == 4) { // Means body is a rectangle
        // Calculate dimensions of the rectangle and position of bullet relative to the rectangle
        var w = Math.sqrt(Math.pow(body.vertices[0].x - body.vertices[1].x, 2) + Math.pow(body.vertices[0].y - body.vertices[1].y, 2));
        var h = Math.sqrt(Math.pow(body.vertices[1].x - body.vertices[2].x, 2) + Math.pow(body.vertices[1].y - body.vertices[2].y, 2));
        var dx = this.x - body.position.x;
        var dy = this.y - body.position.y;
        // Calculate distance from body
        var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        // Check if bullet has hit the rectangle
        var theta = Math.atan2(dy, dx) - body.angle;
        var newX = d * Math.cos(theta);
        var newY = d * Math.sin(theta);
        if (newX > - w * 0.5 && newX < w * 0.5 && newY > - h * 0.5 && newY < h * 0.5) {
          Matter.Body.applyForce(body, { x: this.x, y: this.y }, {
            x: 0.5 * Math.cos(this.angle),
            y: 0.5 * Math.sin(this.angle)
          });
          return true;
        }
      }
    }
    return false;
  }

  // Bullet disappears if off screen
  isOffScreen(width, height) {
    return (this.x < -100 || this.x > width + 100 || this.y < -100 || this.y > height + 100)
  }

  toObject() {
    return {
      type: 'bullet',
      x: this.x,
      y: this.y,
      r: this.r,
      angle: this.angle
    }
  }
}

module.exports = Bullet;
