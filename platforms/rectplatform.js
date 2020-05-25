// var Matter = require('matter-js');
var Platform = require('./platform.js');

// Wrapper class for a rectangular Matter.js body
class RectPlatform extends Platform {
  constructor(x, y, w, h, options, engine, colour) {
    // Arbitrary numbers that seem to work well
    if (!options.friction) options.friction = 0.2;
    if (!options.restitution) options.restitution = 0;
    var body = Matter.Bodies.rectangle(x, y, w, h, options);

    super(body, engine, colour);
  }
}

module.exports = RectPlatform;
