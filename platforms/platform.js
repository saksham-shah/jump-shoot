var Matter = require('matter-js');

// Wrapper class for a Matter.js body
// Can be used for static and dynamic platforms
class Platform {
  constructor(body, engine, colour = 'default') {
    // Add the body to the physics world
    Matter.World.add(engine.world, body);
    this.body = body;

    // Colours
    this.colour = colour;
    // if (this.colour.fill == undefined) this.colour.fill = 200;
    // if (this.colour.edge == undefined) this.colour.edge = 150;
    // if (this.colour.weight == undefined) this.colour.weight = 1;
  }

  toObject() {
    var pos = this.body.position;
    return {
      type: 'platform',
      vertices: this.getVertices(),
      colour: this.colour
    }
  }

  getVertices() {
    var vertices = [];
    for (var v of this.body.vertices) {
      vertices.push ({
        x: v.x,
        y: v.y
      });
    }
    return vertices;
  }
}

module.exports = Platform;
