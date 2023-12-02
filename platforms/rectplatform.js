const pl = require('planck-js');
const vec = pl.Vec2;
var Platform = require('./platform.js');

// Wrapper class for a rectangular planck.js body
class RectPlatform extends Platform {
  constructor(x, y, w, h, world, options = {}) {
    super(x, y, w, h, world, options);

    if (!options.body) {
      x = 0;
      y = 0;
    }

    // Create a new fixture
    this.fixture = this.body.createFixture({
      shape: pl.Box(w * 0.5, h * 0.5, vec(x, y)),
      density: options.density,
      restitution: options.restitution,
      friction: 0.2,
      userData: {
        type: 'platform',
        nojump: options.nojump,
        spike: options.spike,
        friction: options.staticFriction
      }
    });
  }

  toObject() {
    var pos = this.body.getPosition();
    return {
      type: 'rect_platform',
      x: pos.x,
      y: pos.y,
      angle: this.body.getAngle(),
      vertices: this.getVertices(),
      colour: this.colour
    }
  }

  getVertices() {
    return this.fixture.getShape().m_vertices;
  }
}

module.exports = RectPlatform;
