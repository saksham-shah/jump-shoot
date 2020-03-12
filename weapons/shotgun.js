var Weapon = require('./weapon.js');
var Bullet = require('../bullet.js');

// Basic test gun
class Shotgun extends Weapon {
  constructor(x, y, engine, experimental, id) {
    super(x, y, 20, 15, engine, experimental, id);
    this.fireRate = 60;

    this.experimental = experimental;
  }

  shoot(x, y, angle, playerID) {
    // Only fire if gun is cooled down
    if (this.cooldown <= 0) {
      this.cooldown = this.fireRate;
      var bullets = [];

      var numEitherSide = this.experimental ? 3 : 4;
      var angleRange = Math.PI / 4;
      angle -= angleRange / 2;
      for (var i = 0; i < 1 + 2 * numEitherSide; i++) {
        bullets.push(new Bullet(x, y, 1, 20, angle, this.experimental ? 0.6 : 0.5, playerID));
        angle += angleRange / 2 / numEitherSide;
      }

      // Fire particle effect
      this.particles.push({
        x: x + this.w * Math.cos(angle),
        y: y + this.h * Math.sin(angle),
        vel: 3,
        velErr: 1.5,
        angle: angle,
        angleErr: Math.PI * 0.25,
        gravity: 0,
        r: 3,
        life: 15,
        lifeErr: 3,
        col: [255, 255, 0], //yellow
        num: 20
      });

      return {
        shot: true,
        angleChange: 1,
        recoil: 0.4,
        bullets: bullets
      }
    }
    return {
      shot: false
    }
  }

  toObject() {
    var pos = this.body.position;
    return {
      type: 'weapon',
      weapon: 'shotgun',
      x: pos.x,
      y: pos.y,
      w: this.w,
      h: this.h,
      angle: this.body.angle,
      colour: [100],
      hide: this.equipped
    }
  }
}

module.exports = Shotgun;
