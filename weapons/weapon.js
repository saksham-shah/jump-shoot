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
      // allowSleep: false,
      bullet: true
    };

    this.body = world.createBody(this.bodyDef);

    this.fixtureDef = {
      shape: pl.Box(w * 0.5, h * 0.5),
      density: 1.67,
      friction: 2,
      userData: {
        label: this.id,
        type: 'weapon',
        obj: this
      }
    };

    this.body.createFixture(this.fixtureDef);

    // Whether the weapon is currently equipped by a player
    this.equipped = false;

    // If 0, the weapon cannot hit anyone and can be freely equipped
    // If -1, the weapon is in the air after having been thrown and will hit any player it collides with
    // If >0, the weapon has just hit a player or platform and may still be able to hit a player
    // if it hasn't already. It cannot be equipped.
    this.thrown = 0;
    // Who the weapon was thrown at and hit (if any)
    this.throwHit = null;
    // Who the weapon was thrown by
    this.thrownBy = null;
    // If greater than 0, the weapon will not collide with whoever threw it
    // Allows the weapon to start inside the player and not instantly collide with the one that threw it
    this.passThrough = 5;
    // If greater than 0, the weapon is not equippable by the player it hit
    this.hitTimer = 0;

    // Controls weapon fire rate
    this.cooldown = 0;

    this.particles = [];
    this.sounds = [];
  }

  update() {
    // Decrement throwing properties
    if (this.thrown > 0) {
      this.thrown--;
    }

    if (this.passThrough > 0) {
      this.passThrough--;
    }

    if (this.hitTimer > 0) {
      this.hitTimer--;
    }

    // Decrement cooldown
    if (this.cooldown > 0) {
      this.cooldown--;
    }
  }

  // coolGun() {
  //   if (this.cooldown > 0) {
  //     this.cooldown--;
  //   }
  // }

  // Weapon becomes part of the player
  getEquipped(world) {
    this.equipped = true;
    // Remove weapon from physics engine as it is no longer a seperate entity
    this.removeFromWorld(world);

    this.sounds.push('equip');
  }

  // Weapon becomes a seperate entity again
  getUnequipped(x, y, angle, world) {
    this.equipped = false;
    var bodyDef = this.bodyDef;
    // Spawns at the position and angle provided
    // It is the position and angle of the player that threw it
    bodyDef.position = vec(x, y);
    bodyDef.angle = angle;

    // Create the body again
    this.body = world.createBody(bodyDef);
    this.body.createFixture(this.fixtureDef);
  }

  throw(vel, speed, angle) {
    // Initial velocity is the same as the player's current velocity
    // UPDATE: vel is now always 0 but it is kept at an argument in case it is changed
    this.body.setLinearVelocity(vel);

    // Apply a large force towards the specified angle (the angle of the throw)
    let mass = this.body.getMass();
    let fx = speed * mass * Math.cos(angle);
    let fy = speed * mass * Math.sin(angle);
    this.body.applyForceToCenter(vec(fx, fy), true);

    // Speed is 0 when the weapon is passively thrown (i.e. disarm or death)
    if (speed != 0) {
      this.sounds.push('throw');
    }
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
