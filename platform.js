var Matter = require('matter-js');

class Platform {
  constructor(x, y, w, h, engine) {
    this.w = w;
    this.h = h;
    var options = {
      isStatic: true
    }
    this.body = Matter.Bodies.rectangle(x, y, w, h, options);
    this.body.friction = 0.2;
    this.body.restitution = 0.5;

    Matter.World.add(engine.world, this.body);
  }

  toObject() {
    var pos = this.body.position;
    return {
      type: 'platform',
      x: pos.x,
      y: pos.y,
      w: this.w,
      h: this.h
    }
  }

  show() {
    var pos = this.body.position;
    push()
    translate(pos.x, pos.y);
    fill(200);
    stroke(255);
    strokeWeight(1);
    rect(0, 0, this.w, this.h);
    pop();
  }
}

module.exports = Platform;
