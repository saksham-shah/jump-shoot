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
    this.damage = damage; // Exponential - 10 damage halves a player's mass
    this.originPlayer = originPlayer;

    this.reflected = false;
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

      // Some bodies will have some external data
      if (body.externalData) {
        // If body is a player
        if (body.externalData.type == 'player') {
          var player = body.externalData.obj;
          var shieldX = body.position.x + (player.r + 7) * Math.cos(player.angle);
          var shieldY = body.position.y + (player.r + 7) * Math.sin(player.angle);
          // if (player.id != this.originPlayer) {
            // console.log(shieldX);
            // console.log(shieldY);
            // console.log(collideWithRect(this.x, this.y, shieldX, shieldY, 20, 400, player.angle));
          // }
          if (collideWithRect(this.x, this.y, shieldX, shieldY, 7, player.shieldWidth, player.angle) && player.id != this.originPlayer && player.shield && !this.reflected) {
            this.angle += 2 * player.angle - 2 * this.angle - Math.PI;
            this.vel *= 1.25
            player.shieldWidth += 2.5;
            this.reflected = true;
            return false;
          }
        }
      }

      // If body is circle and is not the player who shot the bullet
      if (body.circleRadius && (body.label != this.originPlayer || this.reflected)) {
        var dSq = Math.pow(this.x - body.position.x, 2) + Math.pow(this.y - body.position.y, 2);
        // Check if bullet has hit the circle
        if (dSq < Math.pow(body.circleRadius, 2)) {
          var force = 0.5;
          if (this.reflected) {
            force = 2;
          }
          Matter.Body.applyForce(body, { x: this.x, y: this.y }, {
            x: force * Math.cos(this.angle),
            y: force * Math.sin(this.angle)
          });

          // Deal damage if hit a player
          if (body.externalData) {
            if (body.externalData.type == 'player') {
              var damage = this.damage;
              if (this.reflected) {
                damage += 1.5;
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
          var force = 0.5;
          if (this.reflected) {
            force = 1.5;
          }
          Matter.Body.applyForce(body, { x: this.x, y: this.y }, {
            x: force * Math.cos(this.angle),
            y: force * Math.sin(this.angle)
          });
          return true;
        }
      }


        // var dx = this.x - body.position.x;
        // var dy = this.y - body.position.y;
        // // Calculate distance from body
        // var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        // // Check if bullet has hit the rectangle
        // var theta = Math.atan2(dy, dx) - body.angle;
        // var newX = d * Math.cos(theta);
        // var newY = d * Math.sin(theta);
        // if (newX > - w * 0.5 && newX < w * 0.5 && newY > - h * 0.5 && newY < h * 0.5) {
        //   Matter.Body.applyForce(body, { x: this.x, y: this.y }, {
        //     x: 0.5 * Math.cos(this.angle),
        //     y: 0.5 * Math.sin(this.angle)
        //   });
        //   return true;
        // }
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
      angle: this.angle,
      reflected: this.reflected
    }
  }
}

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
