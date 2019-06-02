var Matter = require('matter-js');

class Circle {
  constructor(x, y, r, engine) {
    this.r = r;
    var options = {
      restitution: 0.5,
      friction: 0.5,
      frictionAir: 0.02
    }
    this.body = Matter.Bodies.circle(x, y, r, options);

    Matter.World.add(engine.world, this.body);
  }

  isOffScreen() {
    var pos = this.body.position;
    return (pos.y > height + this.r + 200);
  }

  toObject() {
    var pos = this.body.position;
    return {
      type: 'circle',
      x: pos.x,
      y: pos.y,
      r: this.r
    }
  }

  show(fillC) {
    var pos = this.body.position;
    push()
    translate(pos.x, pos.y);
    fill(fillC);
    stroke(255);
    strokeWeight(1);
    ellipse(0, 0, this.r * 2);
    pop();
  }
}

module.exports = Circle;
