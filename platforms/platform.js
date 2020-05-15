const pl = require('planck-js');
const vec = pl.Vec2;

// Wrapper class for a planck.js body
// Can be used for static and dynamic platforms
class Platform {
  constructor(x, y, w, h, world, options = {}) {

    if (!options.colour) options.colour = 'default';
    if (!options.type) options.type = 'static';
    if (!options.density) options.density = 1;
    if (!options.restitution) options.restitution = 0;

    // Sometimes it is just adding a fixture to an existing body
    if (options.body) {
      this.body = options.body;

    } else {
      // Create a new body
      this.body = world.createBody({
        type: options.type,
        position: vec(x, y),
        allowSleep: false,
        userData: {
          type: 'platform',
          nojump: options.nojump,
          spike: options.spike
        }
      });

      x = 0;
      y = 0;
    }

    // Create a new fixture
    this.fixture = this.body.createFixture({
      shape: pl.Box(w * 0.5, h * 0.5, vec(x, y)),
      density: options.density,
      restitution: options.restitution,
      friction: 0.2
    });

    // Colours
    this.colour = options.colour;
  }

  toObject() {
    var pos = this.body.getPosition();
    return {
      type: 'platform',
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

module.exports = Platform;
