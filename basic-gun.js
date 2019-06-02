var Weapon = require('./weapon.js');
var Bullet = require('./bullet.js');

class BasicGun extends Weapon {
  constructor(x, y, engine) {
    super(x, y, 20, 10, engine);
    this.fireRate = 10;
  }

  shoot(x, y, angle, playerID) {
    if (this.cooldown <= 0) {
      this.cooldown = this.fireRate;
      var bullet = new Bullet(x, y, 3, 25, angle, 10, playerID);
      return {
        shot: true,
        angleChange: 0.4,
        recoil: 0.01,
        bullet: bullet
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
