const pl = require('planck-js');
const vec = pl.Vec2;

// Wrapper class for a planck.js body
// Used by players to shoot at each other, can be equipped and thrown
class Weapon {
  constructor(x, y, w, h, world, experimental, id = '') {
    this.w = w;
    this.h = h;
    this.id = id;

    this.bodyDef = {
      type: 'dynamic',
      position: vec(x, y),
      allowSleep: false,
      bullet: true,
      userData: {
        label: this.id,
        type: 'weapon',
        obj: this
      }
    };

    this.body = world.createBody(this.bodyDef);

    this.fixtureDef = {
      shape: pl.Box(w * 0.5, h * 0.5),
      density: 1.67,
      friction: 2
    };

    this.body.createFixture(this.fixtureDef);

    // Whether the weapon is currently equipped by a player
    this.equipped = false;

    // Whether the weapon was just thrown
    this.thrown = 0;

    // Controls weapon fire rate
    this.cooldown = 0;

    this.particles = [];
  }

  update() {
    if (this.thrown > 0) {
      this.thrown--;
    }
  }

  coolGun() {
    if (this.cooldown > 0) {
      this.cooldown--;
    }
  }

  // Weapon becomes part of the player
  getEquipped(world) {
    this.equipped = true;
    // Remove weapon from physics engine as it is no longer a seperate entity
    this.removeFromWorld(world);
  }

  // Weapon becomes a seperate entity again
  getUnequipped(x, y, angle, world) {
    this.equipped = false;
    var bodyDef = this.bodyDef;
    bodyDef.position = vec(x, y);
    bodyDef.angle = angle;

    this.body = world.createBody(bodyDef);
    this.body.createFixture(this.fixtureDef);
  }

  throw(vel, speed, angle, world) {
    // Initial velocity is the same as the player's current velocity
    this.body.setLinearVelocity(vel);
    // Apply a large force towards the specified angle
    let mass = this.body.getMass();
    let fx = speed * mass * Math.cos(angle);
    let fy = speed * mass * Math.sin(angle);
    this.body.applyForceToCenter(vec(fx, fy));
  }

  removeFromWorld(world) {
    world.destroyBody(this.body);
  }

  // Weapon disappears if off screen
  isOffScreen() {
    var pos = this.body.getPosition();
    return (pos.y < -13.3);
  }
}

module.exports = Weapon;
