var Weapon = require('./weapon.js');
var Bullet = require('../bullet.js');

// Basic test gun
class BasicGun extends Weapon {
  constructor(x, y, engine, experimental, id) {
    super(x, y, 20, 10, engine, experimental, id);
    this.fireRate = experimental ? 15 : 12;
  }

  shoot(x, y, angle, playerID) {
    // Only fire if gun is cooled down
    if (this.cooldown <= 0) {
      this.cooldown = this.fireRate;
      var bullet = new Bullet(x, y, 3, 25, angle, 1, playerID);

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
        num: 10
      });

      return {
        shot: true,
        angleChange: 0.4,
        recoil: 0.01,
        bullets: [bullet]
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
      weapon: 'pistol',
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

module.exports = BasicGun;
