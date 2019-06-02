var Matter = require('matter-js');

class Weapon {
  constructor(x, y, w, h, engine) {
    this.w = w;
    this.h = h;
    this.options = {
      density: 0.05,
      friction: 0.5
    }
    this.body = Matter.Bodies.rectangle(x, y, w, h, this.options);
    Matter.World.add(engine.world, this.body);
    this.equipped = false;
    this.cooldown = 0;
  }

  coolGun() {
    if (this.cooldown > 0) {
      this.cooldown--;
    }
  }

  getEquipped(engine) {
    this.equipped = true;
    this.removeFromWorld(engine);
  }

  getUnequipped(x, y, angle, engine) {
    this.equipped = false;
    var options = this.options;
    options.angle = angle;
    this.body = Matter.Bodies.rectangle(x, y, this.w, this.h, options);
    Matter.World.add(engine.world, this.body);
    // Matter.Body.setPosition(this.body, {
    //   x: x,
    //   y: y
    // });
  }

  throw(vel, speed, angle, engine) {
    Matter.Body.setVelocity(this.body, vel);
    Matter.Body.applyForce(this.body, this.body.position, {
      x: speed * this.body.mass * Math.cos(angle),
      y: speed * this.body.mass * Math.sin(angle)
    });
  }

  removeFromWorld(engine) {
    Matter.World.remove(engine.world, this.body);
  }

  isOffScreen(height) {
    var pos = this.body.position;
    return (pos.y > height + 200);
  }
}

module.exports = Weapon;
