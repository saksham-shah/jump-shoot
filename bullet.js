const pl = require('planck-js');
const vec = pl.Vec2;
// const MASSDECAY = 0.933;

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

    this.particles = [];
    this.sounds = [];

    this.wasOnScreen = false;

    this.timeAlive = 0;
  }

  // Returns true if the bullet has collided with a player or platform and needs to be removed
  update(players, world) {
    // Ensures that the bullet only moves a maximum of 5 pixels at a time
    // Prevents fast bullets from going through objects without skipping them
    this.timeAlive ++;
    var distanceMoved = 0;
    var step = this.vel / Math.ceil(this.vel / 0.333);
    var collide = false;
    let count = 0;
    // Keeps moving until it collides or moves the max distance of one frame
    while (distanceMoved < this.vel && !collide) {
      // Detects and logs infinite loops
      count++;
      if (count % 100 == 0) {
        console.log(`Moved bullet: ${count}`);
      }
      this.x += step * Math.cos(this.angle);
      this.y += step * Math.sin(this.angle);
      distanceMoved += step;
      collide = this.checkCollisions(players, world)
    }
    return collide;
  }

  checkCollisions(players, world) {
    for (let player of players.values()) {
      // Check shield collisions if the bullet hasn't already been reflected by another shield
      if (player.shield && !this.reflected) {
        var pos = player.body.getPosition();
        var angle = player.angle;
        var shieldX = pos.x + (player.r + 0.5) * Math.cos(angle);
        var shieldY = pos.y + (player.r + 0.5) * Math.sin(angle);
        if (collideWithRect(this.x, this.y, shieldX, shieldY, 0.5, player.shieldWidth, angle)) {
          // The bullet has hit the shield and should be reflected
          this.reflected = true;
          this.originPlayer = player.id;
          
          // Alter the direction of movement
          this.angle += 2 * angle - 2 * this.angle - Math.PI;
          // Speed increases
          this.vel *= 1.25
          // The reflecting player regains some of their shield
          player.addToShield(player.experimental ? this.damage : 0.17);

          // Create the particles and reflecting sound
          this.particles.push({
            x: this.x,
            y: this.y,
            vel: 0.2,
            velErr: 0.1,
            angle: this.angle,
            angleErr: Math.PI * 0.25,
            gravity: 0,
            r: 0.2,
            life: 15,
            lifeErr: 3,
            col: 'reflected',
            num: 10
          });
          this.sounds.push('shield');
          return false;
        }
      }
    }
    
    // Loop through all of the fixtures in the world to check for collisions
    // O(n^2), the limiting factor of the game
    for (let body = world.getBodyList(); body; body = body.getNext()) {
      for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
        let data = fixture.getUserData();
        // Various criteria for a bullet hit
        // Basically prevents bullets from hitting the player that fired them instantly
        if ((this.reflected || this.timeAlive > 10 || !data || data.type != 'player' || data.label != this.originPlayer)
         && fixture.testPoint(vec(this.x, this.y))) {
          // Arbitrary force value
          let force = 4000 * this.damage;

          // Reflected bullets have a greater impact
          if (this.reflected) {
            force *= 2;
          }

          // Calculate and apply the force to the player body
          let fx = force * Math.cos(this.angle);
          let fy = force * Math.sin(this.angle);

          body.applyForce(vec(fx, fy), vec(this.x, this.y));

          if (data && data.type == 'player') {
            var player = data.obj;
            var damage = this.damage;
            if (this.reflected) {
              // Reflected bullets do more damage
              damage += 2;
              if (player.weapon) {
                // Player is disarmed
                player.throwWeapon(0, world);
                player.sounds.push('disarm');

                if (player.experimental) {
                  let origin = players.get(this.originPlayer);
                  // The player that reflected the bullet regains their entire shield
                  if (origin) origin.shieldWidth = 3;
                }
              }
            }

            player.lastShot.timeAgo = 0;
            player.lastShot.player = this.originPlayer;

            // Player takes damage from bullets
            player.damage(damage);
          }

          return true;
        }
      }
    }

    return false;
  }

  // Bullet disappears if offscreen
  // Returns true if the bullet is offscreen and can be removed,
  // or if 'bullet bounce' is enabled and the bullet has bounced off a wall
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
          }
          if (this.y < 0 || this.y > height) {
            var vx = this.vel * Math.cos(this.angle);
            var vy = this.vel * Math.sin(this.angle);
            if ((this.y < 0 && vy < 0) || (this.y > height && vy > 0)) vy *= -1;
            this.angle = Math.atan2(vy, vx);
            collide = true;
          }
          return collide;
        }

        // If bullet doesn't bounce and is away from the screen, it can simply be removed
        return (this.x < -10 || this.x > width + 10 || this.y < -10 || this.y > height + 10)
      }
      return false;
    } else {
      this.wasOnScreen = true;
      return false;
    }
  }

  toObject() {
    return {
      type: 'bullet',
      x: this.x,
      y: this.y,
      r: this.r,
      angle: this.angle,
      reflected: this.reflected,
      // colour: this.colour
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
