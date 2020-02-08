var Matter = require('matter-js');

class Bullet {
  constructor(x, y, r, vel, angle, damage, originPlayer) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.vel = vel;
    this.angle = angle;
    this.damage = damage; // Exponential - 10 damage halves a player's mass
    this.originPlayer = originPlayer;

    this.reflected = false;

    this.colour = [255, 255, 0];

    this.particles = [];

    this.wasOnScreen = false;

    this.timeAlive = 0;
  }

  update(bodies, engine) {
    // Ensures that the bullet only moves a maximum of 5 pixels at a time
    // Prevents fast bullets from going through objects without skipping them
    this.timeAlive ++;
    var distanceMoved = 0;
    var step = this.vel / Math.ceil(this.vel / 5)
    // Keeps moving until it collides
    while (distanceMoved < this.vel && !collide) {
      this.x += step * Math.cos(this.angle);
      this.y += step * Math.sin(this.angle);
      distanceMoved += step;
      var collide = this.checkCollisions(bodies, engine)
    }
    return collide;
  }

  checkCollisions(bodies, engine) {
    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];

      // Some bodies will have some external data
      if (body.externalData && !this.reflected) {
        // If body is a player
        if (body.externalData.type == 'player') {
          var player = body.externalData.obj;
          if (player.shield) {
            var shieldX = body.position.x + (player.r + 7) * Math.cos(player.angle);
            var shieldY = body.position.y + (player.r + 7) * Math.sin(player.angle);
            if (collideWithRect(this.x, this.y, shieldX, shieldY, 7, player.shieldWidth, player.angle)) {
              this.angle += 2 * player.angle - 2 * this.angle - Math.PI;
              this.vel *= 1.25
              player.shieldWidth += 2.5;
              this.reflected = true;
              this.colour = [255, 155, 0];

              this.particles.push({
                x: this.x,
                y: this.y,
                vel: 3,
                velErr: 1.5,
                angle: this.angle,
                angleErr: Math.PI * 0.25,
                gravity: 0,
                r: 3,
                life: 15,
                lifeErr: 3,
                col: this.colour,
                num: 10
              });

              return false;
            }
          }
        }
      }

      // If body is circle and is not the player who shot the bullet
      if (body.circleRadius && (body.label != this.originPlayer || this.reflected || this.timeAlive > 10)) {
        var dSq = Math.pow(this.x - body.position.x, 2) + Math.pow(this.y - body.position.y, 2);
        // Check if bullet has hit the circle
        if (dSq < Math.pow(body.circleRadius, 2)) {
          var force = this.damage / 2;
          if (this.reflected) {
            force *= 2;
          }
          Matter.Body.applyForce(body, { x: this.x, y: this.y }, {
            x: force * Math.cos(this.angle),
            y: force * Math.sin(this.angle)
          });

          // Deal damage if hit a player
          if (body.externalData) {
            if (body.externalData.type == 'player') {
              var player = body.externalData.obj;
              var damage = this.damage;
              if (this.reflected) {
                damage += 2;
                if (player.weapon) {
                  player.throwWeapon(0, engine);
                }
              }
              var newDensity = body.density * Math.pow(body.externalData.obj.massDecay, damage);
              Matter.Body.setDensity(body, newDensity);
            }
          }
          return true;
        }
      } else if (body.vertices.length == 4) { // Means body is a rectangle
        // Calculate dimensions of the rectangle and position of bullet relative to the rectangle
        var w = Math.sqrt(Math.pow(body.vertices[0].x - body.vertices[1].x, 2) + Math.pow(body.vertices[0].y - body.vertices[1].y, 2));
        var h = Math.sqrt(Math.pow(body.vertices[1].x - body.vertices[2].x, 2) + Math.pow(body.vertices[1].y - body.vertices[2].y, 2));
        if (collideWithRect(this.x, this.y, body.position.x, body.position.y, w, h, body.angle)) {
          var force = this.damage / 2;
          if (this.reflected) {
            force *= 2;
          }
          Matter.Body.applyForce(body, { x: this.x, y: this.y }, {
            x: force * Math.cos(this.angle),
            y: force * Math.sin(this.angle)
          });
          return true;
        }
      }
    }
    return false;
  }

  // Bullet disappears if offscreen
  isOffScreen(width, height, bounce) {
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      // Is offscreen right now
      if (this.wasOnScreen) {
        // Has now gone off screen

        if (bounce) {
          var collide = false;

          // Checks if bullets have reached the edge and reflects them
          if (this.x < 0 || this.x > width) {
            var vx = this.vel * Math.cos(this.angle);
            var vy = this.vel * Math.sin(this.angle);
            if ((this.x < 0 && vx < 0) || (this.x > width && vx > 0)) vx *= -1;
            this.angle = Math.atan2(vy, vx);
            collide = true;
            // this.wasOnScreen = false;
          }
          if (this.y < 0 || this.y > height) {
            var vx = this.vel * Math.cos(this.angle);
            var vy = this.vel * Math.sin(this.angle);
            if ((this.y < 0 && vy < 0) || (this.y > height && vy > 0)) vy *= -1;
            this.angle = Math.atan2(vy, vx);
            collide = true;
            // this.wasOnScreen = false;
          }
          return collide;
        }

        // If bullet doesn't bounce and is away from the screen, it can simply be removed
        return (this.x < -200 || this.x > width + 200 || this.y < -200 || this.y > height + 200)
      }
      return false;
    } else {
      this.wasOnScreen = true;
      return false;
    }

    // Below code is as good as commented out. Needs to be removed during next code clean up
    console.log("This code should not be running right now. bullet.js line 179");
    var collide = false;
    if (this.x < 0 || this.x > width) {
      var vx = this.vel * Math.cos(this.angle);
      var vy = this.vel * Math.sin(this.angle);
      vx *= -1;
      this.vel = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
      this.angle = Math.atan2(vy, vx);
    }
    if (this.y < 0 || this.y > height) {
      var vx = this.vel * Math.cos(this.angle);
      var vy = this.vel * Math.sin(this.angle);
      vy *= -1;
      this.vel = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
      this.angle = Math.atan2(vy, vx);
    }

    if (this.x < 0) {
      this.x = 0;
      collide = true;
    }
    if (this.x > width) {
      this.x = width;
      collide = true;
    }
    if (this.y < 0) {
      this.y = 0;
      collide = true;
    }
    if (this.y > height) {
      this.y = height;
      collide = true;
    }
    return collide;
  }

  toObject() {
    return {
      type: 'bullet',
      x: this.x,
      y: this.y,
      r: this.r,
      angle: this.angle,
      colour: this.colour
    }
  }
}

// Check if a rectangle contains a point
function collideWithRect(xBul, yBul, xRect, yRect, w, h, angle) {
  var dx = xBul - xRect;
  var dy = yBul - yRect;
  // Calculate distance from body
  var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  // Check if bullet has hit the rectangle
  var theta = Math.atan2(dy, dx) - angle;
  var newX = d * Math.cos(theta);
  var newY = d * Math.sin(theta);
  if (newX > - w * 0.5 && newX < w * 0.5 && newY > - h * 0.5 && newY < h * 0.5) {
    return true;
  }
  return false;
}

module.exports = Bullet;
