var Weapon = require('./weapon.js');
var Bullet = require('../bullet.js');

// Basic test gun
class Shotgun extends Weapon {
  constructor(x, y, engine, experimental, id) {
    super(x, y, 1.33, 1, engine, experimental, id);
    this.fireRate = 60;

    this.experimental = experimental;
  }

  shoot(x, y, angle, playerID) {
    // Only fire if gun is cooled down
    if (this.cooldown <= 0) {
      this.cooldown = this.fireRate;
      var bullets = [];

      var numEitherSide = 3;
      var angleRange = Math.PI / 4;
      angle -= angleRange / 2;
      for (var i = 0; i < 1 + 2 * numEitherSide; i++) {
        bullets.push(new Bullet(x, y, 0.067, 1.33, angle, 0.6, playerID));
        angle += angleRange / 2 / numEitherSide;
      }

      // Fire particle effect
      this.particles.push({
        x: x + this.w * Math.cos(angle),
        y: y + this.h * Math.sin(angle),
        vel: 0.2,
        velErr: 0.1,
        angle: angle,
        angleErr: Math.PI * 0.25,
        gravity: 0,
        r: 0.2,
        life: 15,
        lifeErr: 3,
        col: [255, 255, 0], //yellow
        num: 20
      });
      this.sounds.push('shotgun');

      return {
        shot: true,
        angleChange: 1,
        recoil: 4000,
        bullets: bullets
      }
    }
    return {
      shot: false
    }
  }

  toObject() {
    var pos = this.body.getPosition();
    return {
      type: 'weapon',
      weapon: 'shotgun',
      x: pos.x,
      y: pos.y,
      w: this.w,
      h: this.h,
      angle: this.body.getAngle(),
      colour: [100],
      hide: this.equipped
    }
  }
}

module.exports = Shotgun;
