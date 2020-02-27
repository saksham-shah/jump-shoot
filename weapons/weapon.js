var Matter = require('matter-js');

// Wrapper class for a Matter.js body
// Used by players to shoot at each other, can be equipped and thrown
class Weapon {
  constructor(x, y, w, h, engine, experimental) {
    this.w = w;
    this.h = h;
    // Arbitrary numbers
    this.options = {
      density: 0.05,
      friction: 0.5
      // frictionAir: experimental ? 0.2 : 0.01
    }
    this.body = Matter.Bodies.rectangle(x, y, w, h, this.options);

    // Add the body to the physics world
    Matter.World.add(engine.world, this.body);

    // Whether the weapon is currently equipped by a player
    this.equipped = false;
    // Controls weapon fire rate
    this.cooldown = 0;

    this.particles = [];
  }

  coolGun() {
    if (this.cooldown > 0) {
      this.cooldown--;
    }
  }

  // Weapon becomes part of the player
  getEquipped(engine) {
    this.equipped = true;
    // Remove weapon from physics engine as it is no longer a seperate entity
    this.removeFromWorld(engine);
  }

  // Weapon becomes a seperate entity again
  getUnequipped(x, y, angle, engine) {
    this.equipped = false;
    var options = this.options;
    options.angle = angle;
    this.body = Matter.Bodies.rectangle(x, y, this.w, this.h, options);
    // Add weapon back to physics engine as it is now a seperate entity again
    Matter.World.add(engine.world, this.body);
  }

  throw(vel, speed, angle, engine) {
    // Initial velocity is the same as the player's current velocity
    Matter.Body.setVelocity(this.body, vel);
    // Apply a large force towards the specified angle
    Matter.Body.applyForce(this.body, this.body.position, {
      x: speed * this.body.mass * Math.cos(angle),
      y: speed * this.body.mass * Math.sin(angle)
    });
  }

  removeFromWorld(engine) {
    Matter.World.remove(engine.world, this.body);
  }

  // Weapon disappears if off screen
  isOffScreen(height) {
    var pos = this.body.position;
    return (pos.y > height + 200);
  }
}

module.exports = Weapon;
