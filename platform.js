var Matter = require('matter-js');

// Wrapper class for a Matter.js body
// Can be used for static and dynamic platforms
class Platform {
  constructor(x, y, w, h, options, engine) {
    this.w = w;
    this.h = h;
    this.body = Matter.Bodies.rectangle(x, y, w, h, options);
    // Arbitrary numbers that seem to work well
    this.body.friction = 0.2;
    this.body.restitution = 0.5;

    // Add the body to the physics world
    Matter.World.add(engine.world, this.body);
  }

  toObject() {
    var pos = this.body.position;
    return {
      type: 'platform',
      x: pos.x,
      y: pos.y,
      w: this.w,
      h: this.h,
      angle: this.body.angle
    }
  }
}

module.exports = Platform;
