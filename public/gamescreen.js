// Handles drawing of game objects
class GameScreen {
  constructor() {
    this.platforms = [];
    this.dynamic = [];
    this.zoom = 1;
  }

  // Reset platforms array
  newGame(platforms) {
    this.platforms = platforms;
  }

  update(dynamic) {
    this.dynamic = dynamic;
  }

  show(x, y, z) {
    push();
    translate(x, y);
    // Zoom in/out depending on the scale
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

//How to draw every possible game object - may split this into seperate functions as more game objects are added
function drawObject(obj) {
  push();
  translate(obj.x, obj.y);
  switch (obj.type) {
    case 'platform': // Simple rectangle
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
      text(obj.name, 0, obj.r + 15); // Name tag
      rotate(obj.angle); // Rotate to draw the gun in the right place
      fill(obj.colour);
      stroke(0);
      strokeWeight(1);
      ellipse(0, 0, obj.r * 2); // Draw player circle
      line(0, 0, obj.r, 0); // Draw direction the player is aiming
      if (obj.weapon) { // Draw player's weapon
        var weaponObj = obj.weapon;
        weaponObj.angle = 0; // Relative to player's angle and position
        weaponObj.x = obj.r;
        weaponObj.y = 0;
        weaponObj.hide = false;
        drawObject(weaponObj);
      }
      break;
    case 'weapon': // Rectangle for now - may add graphics
      rotate(obj.angle);
      fill(obj.colour);
      stroke(0);
      strokeWeight(1);
      rect(0, 0, obj.w, obj.h);
      break;
    case 'bullet': // Long thin rectangle to show it is a fast bullet
      rotate(obj.angle)
      fill(255, 255, 0);
      noStroke();
      rect(-obj.r * 1.5, 0, obj.r * 15, obj.r);
      break;
  }
  pop();
}
