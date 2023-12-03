const pl = require('planck-js');
const vec = pl.Vec2;
var Platform = require('./platform.js');

// Wrapper class for a circular planck.js body
class CircPlatform extends Platform {
  constructor(x, y, r, world, options = {}) {
    super(x, y, world, options);

    if (!options.body) {
      x = 0;
      y = 0;
    }

    this.r = r

    // Create a new fixture
    this.fixture = this.body.createFixture({
      shape: pl.Circle(vec(x, y), r),
      density: options.density,
      restitution: options.restitution,
      friction: 0.2,
      userData: {
        type: 'platform',
        nojump: options.nojump,
        bouncy: options.bouncy,
        spike: options.spike,
        friction: options.staticFriction
      }
    });
  }

  toObject() {
    var pos = this.body.getPosition();
    return {
      type: 'circ_platform',
      x: pos.x,
      y: pos.y,
      r: this.r,
      colour: this.colour
    }
  }
}

module.exports = CircPlatform;
