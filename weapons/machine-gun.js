var Weapon = require('./weapon.js');
var Bullet = require('../bullet.js');

// Machine gun
class MachineGun extends Weapon {
  constructor(x, y, engine, experimental, id) {
    super(x, y, 15, 15, engine, experimental, id);
    this.fireRate = 3;

    this.experimental = experimental;
  }

  shoot(x, y, angle, playerID) {
    // Only fire if gun is cooled down
    if (this.cooldown <= 0) {
      this.cooldown = this.fireRate;
      angle += Math.random() * Math.PI / 8 - Math.PI / 16;
      var bullet = new Bullet(x, y, 1, 15, angle, this.experimental ? 0.6 : 0.75, playerID);

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
        num: 3
      });

      return {
        shot: true,
        angleChange: 0.4,
        recoil: 0.05,
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
      weapon: 'machine gun',
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

module.exports = MachineGun;
