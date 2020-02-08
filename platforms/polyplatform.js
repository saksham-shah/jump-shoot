var Matter = require('matter-js');
var Platform = require('./platform.js');

// Wrapper class for a polygon Matter.js body

// Unused because bullet collisions don't have this taken into account
class PolyPlatform extends Platform {
  constructor(x, y, sides, r, options, engine, colour) {
    // Arbitrary numbers that seem to work well
    if (!options.friction) options.friction = 0.2;
    if (!options.restitution) options.restitution = 0.5;

    var body = Matter.Bodies.polygon(x, y, sides, r, options);

    super(body, engine, colour);
  }
}

module.exports = PolyPlatform;
