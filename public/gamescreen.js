class GameScreen {
  constructor() {
    this.platforms = [];
    this.dynamic = [];
    this.zoom = 1;
  }

  newGame(platforms) {
    this.platforms = platforms;
  }

  update(dynamic) {
    this.dynamic = dynamic;
  }

  show(x, y, z) {
    push();
    translate(x, y);
    scale(z);
    for (var i = 0; i < this.platforms.length; i++) {
      drawObject(this.platforms[i])
    }

    for (var i = 0; i < this.dynamic.length; i++) {
      if (this.dynamic[i].hide !== true) {
        drawObject(this.dynamic[i])
      }
    }

    pop();
  }
}

function drawObject(obj) {
  push()
  translate(obj.x, obj.y);
  switch (obj.type) {
    case 'platform':
      fill(200);
      stroke(255);
      strokeWeight(1);
      rect(0, 0, obj.w, obj.h);
      break;
    case 'player':
      fill(255);
      noStroke();
      textAlign(CENTER);
      textSize(12);
      text(obj.name, 0, obj.r + 15);
      rotate(obj.angle);
      fill(obj.colour);
      stroke(0);
      strokeWeight(1);
      ellipse(0, 0, obj.r * 2);
      line(0, 0, obj.r, 0);
      if (obj.weapon) {
        var weaponObj = obj.weapon;
        weaponObj.angle = 0;
        weaponObj.x = obj.r;
        weaponObj.y = 0;
        weaponObj.hide = false;
        drawObject(weaponObj);
      }
      break;
    case 'weapon':
      rotate(obj.angle);
      fill(obj.colour);
      stroke(0);
      strokeWeight(1);
      rect(0, 0, obj.w, obj.h)
      break;
    case 'bullet':
      rotate(obj.angle)
      fill(255, 255, 0);
      noStroke();
      rect(-obj.r * 1.5, 0, obj.r * 15, obj.r)
      // fill(255);
      // rect(0, 0, obj.r, obj.r);
      break;
  }

  pop();
}
