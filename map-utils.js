var Matter = require('matter-js');
var Platform = require('./platform.js');

// Functions which make map creation code shorter and easier to write
class MapUtils {
  static staticPlatform(x, y, w, h, engine) {
    var platform = new Platform(x, y, w, h, { isStatic: true }, engine);
    return platform;
  }

  static pivotPlatform(x, y, w, h, options, engine, pivotX = 0, pivotY = 0) {
    var platform = new Platform(x, y, w, h, options, engine);
    var pivot = Matter.Constraint.create({
            bodyA: platform.body,
            // This means that (pivotX, pivotY) is secured in place
            pointA: { x: pivotX, y: pivotY },
            pointB: { x: platform.body.position.x + pivotX, y: platform.body.position.y + pivotY },
            stiffness: 1,
            length: 0
        });
    Matter.World.add(engine.world, pivot);
    return platform;
  }
}

module.exports = MapUtils;
