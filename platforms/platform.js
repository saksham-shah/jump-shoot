const pl = require('planck-js');
const vec = pl.Vec2;

// Wrapper class for a planck.js body
// Can be used for static and dynamic platforms
class Platform {
  constructor(x, y, world, options = {}) {

    if (!options.colour) options.colour = 'default';
    if (!options.type) options.type = 'static';
    if (!options.density) options.density = 1;
    if (!options.restitution) options.restitution = 0;
    if (options.staticFriction == undefined) options.staticFriction = true;

    // Sometimes it is just adding a fixture to an existing body
    if (options.body) {
      this.body = options.body;

    } else {
      // Create a new body
      this.body = world.createBody({
        type: options.type,
        position: vec(x, y),
        allowSleep: false
      });

      x = 0;
      y = 0;
    }

    // Colours
    this.colour = options.colour;
  }
}

module.exports = Platform;
