var Weapon = require('./weapon.js');
var Bullet = require('../bullet.js');

// Sniper gun
class Sniper extends Weapon {
  constructor(x, y, engine, experimental, id) {
    super(x, y, 2, 0.67, engine, experimental, id);
    this.fireRate = 90;

    this.experimental = experimental;
  }

  shoot(x, y, angle, playerID) {
    // Only fire if gun is cooled down
    if (this.cooldown <= 0) {
      this.cooldown = this.fireRate;
      var bullet = new Bullet(x, y, 0.33, 2.67, angle, 2.5, playerID);

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
        // col: [255, 255, 0], //yellow
        col: 'fire',
        num: 20
      });
      this.sounds.push('sniper');

      return {
        shot: true,
        angleChange: 0.8,
        recoil: 5000,
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
      weapon: 'sniper',
      x: pos.x,
      y: pos.y,
      w: this.w,
      h: this.h,
      angle: this.body.getAngle(),
      // colour: [100],
      hide: this.equipped
    }
  }
}

module.exports = Sniper;
