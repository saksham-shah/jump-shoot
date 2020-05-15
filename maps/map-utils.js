// var Matter = require('matter-js');

var Path = require('../platforms/path.js');

var RectPlatform = require('../platforms/rectplatform.js');
var PolyPlatform = require('../platforms/polyplatform.js');

// Functions which make map creation code shorter and easier to write
class MapUtils {
  static rectPlatform(x, y, w, h, engine, options = {}, colour) {
    var platform = new RectPlatform(x, y, w, h, options, engine, colour);
    return platform;
  }

  static staticPlatform(x, y, w, h, engine, options = {}, colour) {
    options.isStatic = true;
    var platform = new RectPlatform(x, y, w, h, options, engine, colour);
    return platform;
  }

  static pivotPlatform(x, y, w, h, options, engine, pivotX = 0, pivotY = 0, colour) {
    var platform = new RectPlatform(x, y, w, h, options, engine, colour);
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

  static addPivot(body, engine, pivotX = 0, pivotY = 0) {
    var pivot = Matter.Constraint.create({
      bodyA: body,
      // This means that (pivotX, pivotY) is secured in place
      pointA: { x: pivotX, y: pivotY },
      pointB: { x: body.position.x + pivotX, y: body.position.y + pivotY },
      stiffness: 1,
      length: 0
    });
    Matter.World.add(engine.world, pivot);
  }

  static addPath(body, x1, y1, x2, y2, period, offset) {
    return new Path(body, x1, y1, x2, y2, period, offset);
  }

  static polyPlatform(x, y, sides, r, engine, options = {}, colour) {
    var platform = new PolyPlatform(x, y, sides, r, options, engine, colour);
    return platform;
  }
}

module.exports = MapUtils;
