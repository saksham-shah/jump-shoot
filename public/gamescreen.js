// Handles drawing of game objects
class GameScreen {
  constructor() {
    this.platforms = [];
    // this.dynamic = [];
    this.entities = [];
    this.players = [];
    this.particles = [];
    this.zoom = 1;
    this.leaveButton = new Button(0.1, 0.055, 'LEAVE', () => socket.emit('leave lobby'), null);
    this.closeButton = new Button(0.1, 0.055, 'CLOSE', () => popup = null, null);

  }

  // Reset platforms array
  newGame(platforms) {
    this.platforms = platforms;
    this.entities = [];
    this.players = [];
    this.particles = [];
  }

  updateDynamic(entities, players) {
    // this.dynamic = dynamic;
    this.entities = entities;
    this.players = players;

    for (var i = 0; i < this.particles.length; i++) {
      if (this.particles[i].update()) {
        this.particles.splice(i, 1);
        i--;
      }
    }
  }

  resetGame() {
    this.platforms = [];
    this.dynamic = [];
  }

  update() {
    this.leaveButton.updateState(width * 0.9, height * 0.075);
  }

  particleEffect(x, y, r, col, life) {
    this.particles.push(new Particle(x, y, 1, 1, 0.2, r, col, life));
  }

  particleExplosion(options) {//x, y, vel, velErr, angle, angleErr, gravity, r, col, life, lifeErr, num) {
    // this.particles.push(new Particle(x, y, 1, 1, r, col, life));
    for (var i = 0; i < options.num; i++) {
      if (options.velErr) {
        options.vel += (Math.random() - 0.5) * 2 * options.velErr;
      }
      if (options.angleErr) {
        options.angle += (Math.random() - 0.5) * 2 * options.angleErr;
      }
      if (options.lifeErr) {
        options.life += (Math.random() - 0.5) * 2 * options.lifeErr;
      }
      if (!options.gravity) {
        options.gravity = 0;
      }

      var p = new Particle(options.x, options.y, options.vel, options.angle, options.gravity, options.r, options.col, options.life);
      this.particles.push(p);

    }

  }

  show(x, y, z) {
    push();
    translate(gameSize.x, gameSize.y);
    // Zoom in/out depending on the scale
    scale(gameSize.z);

    for (var i = 0; i < this.platforms.length; i++) {
      drawObject(this.platforms[i]);
    }

    for (var i = 0; i < this.entities.length; i++) {
      if (this.entities[i].hide !== true) {
        drawObject(this.entities[i]);
      }
    }

    for (var i = 0; i < this.players.length; i++) {
      drawPlayer(this.players[i]);
    }

    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].show();
    }

    for (var i = 0; i < this.players.length; i++) {
      drawNameTag(this.players[i]);
    }

    pop();

    fill(60);
    noStroke();
    rect(width * 0.5, gameSize.y * 0.5, width, gameSize.y);
    rect(width * 0.5, height - gameSize.y * 0.5, width, gameSize.y);
    rect(gameSize.x * 0.5, height * 0.5, gameSize.x, height);
    rect(width - gameSize.x * 0.5, height * 0.5, gameSize.x, height);

    noFill();
    stroke(255);
    strokeWeight(2);
    rect(width * 0.5, height * 0.5, gameSize.w * gameSize.z, gameSize.h * gameSize.z)

    this.leaveButton.show(width * 0.9, height * 0.075);

    push();
    fill(255);
    noStroke();
    textSize(20);
    textAlign(LEFT);
    text(lobbyName, 25, 25);
    pop();

  }
}

function drawPlayer(obj) {
  push();
  translate(obj.x, obj.y);
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
  } else {
    if (obj.shield) { // Draw player's shield
        fill(200);
        noStroke();
        rect(obj.r + 7, 0, 7, obj.shieldWidth);
        // rect(obj.r + 7, 0, 7, 400);
    } else if (obj.id == myid) {
      fill(200, 50);
      noStroke();
      rect(obj.r + 7, 0, 7, obj.shieldWidth);
      // rect(obj.r + 7, 0, 20, 400);
    }
  }
  pop();
}

function drawNameTag(obj) {
  push();
  translate(obj.x, obj.y);
  fill(255);
  noStroke();
  textAlign(CENTER);
  textSize(12);
  if (obj.id == myid) {
    textStyle(BOLD);
  }
  text(obj.name, 0, obj.r + 15);
  pop();
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
    // case 'player':
    //   fill(255);
    //   noStroke();
    //   textAlign(CENTER);
    //   textSize(12);
    //   text(obj.name, 0, obj.r + 15); // Name tag
    //   rotate(obj.angle); // Rotate to draw the gun in the right place
    //   fill(obj.colour);
    //   stroke(0);
    //   strokeWeight(1);
    //   ellipse(0, 0, obj.r * 2); // Draw player circle
    //   line(0, 0, obj.r, 0); // Draw direction the player is aiming
    //   if (obj.shield) { // Draw player's shield
    //       fill(255);
    //       noStroke();
    //       rect(obj.r + 5, 0, 10, obj.shieldWidth);
    //   }
    //   if (obj.weapon) { // Draw player's weapon
    //     var weaponObj = obj.weapon;
    //     weaponObj.angle = 0; // Relative to player's angle and position
    //     weaponObj.x = obj.r;
    //     weaponObj.y = 0;
    //     weaponObj.hide = false;
    //     drawObject(weaponObj);
    //   }
    //   break;
    case 'weapon': // Rectangle for now - may add graphics
      rotate(obj.angle);
      fill(obj.colour);
      stroke(0);
      strokeWeight(1);
      rect(0, 0, obj.w, obj.h);
      break;
    case 'bullet': // Long thin rectangle to show it is a fast bullet
      rotate(obj.angle)
      fill(obj.colour);
      // if (obj.reflected) {
      //   fill(255, 155, 0);
      // }
      noStroke();
      rect(-obj.r * 1.5, 0, obj.r * 15, obj.r);
      break;
  }
  pop();
}
