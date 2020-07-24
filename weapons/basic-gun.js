var Weapon = require('./weapon.js');
var Bullet = require('../bullet.js');

// Basic test gun
class BasicGun extends Weapon {
  constructor(x, y, engine, experimental, id) {
    super(x, y, 1.33, 0.67, engine, experimental, id);
    this.fireRate = experimental ? 17 : 15;
  }

  shoot(x, y, angle, playerID) {
    // Only fire if gun is cooled down
    if (this.cooldown <= 0) {
      this.cooldown = this.fireRate;
      var bullet = new Bullet(x, y, 0.2, 1.67, angle, 1, playerID);

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
        col: 'fire',
        num: 10
      });
      this.sounds.push('pistol');

      return {
        shot: true,
        angleChange: 0.4,
        recoil: 100,
        bullets: [bullet]
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
      weapon: 'pistol',
      x: pos.x,
      y: pos.y,
      w: this.w,
      h: this.h,
      angle: this.body.getAngle(),
      hide: this.equipped
    }
  }
}

module.exports = BasicGun;
