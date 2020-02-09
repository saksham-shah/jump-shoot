// Handles drawing of game objects
class GameScreen {
  constructor() {
    // Properties about the game currently being shown
    this.platforms = [];
    this.entities = [];
    this.players = [];
    this.particles = [];
    this.bulletBounce = false;

    // this.leaveButton = new Button(0.1, 0.055, 'LEAVE', () => socket.emit('leave lobby'), null);
    this.leaveButton = new Button(backButtonOptions, 'LEAVE', () => socket.emit('leave lobby'), null);
  }

  // Reset arrays and store static platforms
  newGame(platforms, bulletBounce) {
    this.resetGame();
    this.platforms = platforms;
    this.bulletBounce = bulletBounce;
  }

  // Update arrays when the server sends data
  updateDynamic(entities, players) {
    this.entities = entities;
    this.players = players;

    // Update particles at the same rate as the server sends data
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
    this.players = [];
    this.particles = [];
    this.bulletBounce = false;
  }

  // Just updates the button(s)
  update() {
    // this.leaveButton.updateState(width * 0.9, height * 0.075);
    this.leaveButton.updateState();
  }

  // particleEffect(x, y, r, col, life) {
  //   this.particles.push(new Particle(x, y, 1, 1, 0.2, r, col, life));
  // }

  // Creates several particles which will move around
  particleExplosion(options) {
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

    if (!OLDGRAPHICS) {
      for (var i = 0; i < this.players.length; i++) {
        drawNameTag(this.players[i]);
      }
    }

    for (var i = 0; i < this.players.length; i++) {
      drawPlayerWeapon(this.players[i]);
    }

    for (var i = 0; i < this.players.length; i++) {
      drawOffScreenPlayer(this.players[i]);
    }

    pop();

    // Draw rectangles around the game screen so all players have equal vision
    fill(60);
    noStroke();
    rect(width * 0.5, gameSize.y * 0.5, width, gameSize.y);
    rect(width * 0.5, height - gameSize.y * 0.5, width, gameSize.y);
    rect(gameSize.x * 0.5, height * 0.5, gameSize.x, height);
    rect(width - gameSize.x * 0.5, height * 0.5, gameSize.x, height);

    // Draw the border of the game screen
    noFill();
    stroke(200);
    strokeWeight(2);
    // Thicker border is bullet bounce is active
    if (this.bulletBounce) {
      stroke(255);
      strokeWeight(4);
    }
    rect(width * 0.5, height * 0.5, gameSize.w * gameSize.z, gameSize.h * gameSize.z)

    // this.leaveButton.show(width * 0.9, height * 0.075);
    this.leaveButton.show();

    // Draw the lobby name in the top left
    drawText(lobbyName, {
      x: 25,
      y: 25,
      textSize: 20,
      xEdge: true
    });
    // push();
    // fill(255);
    // noStroke();
    // textSize(20);
    // textAlign(LEFT);
    // text(lobbyName, 25, 25);
    // pop();


    if (timer.time > 0 && timer.maxTime > 0) {
      timer.time--;

      // Draw the timer
      push();
      var progress = 1 - (timer.time / timer.maxTime);

      var { x, y, w } = getPosSize({
        type: 'circle',
        x: 0.5,
        y: 0.2,
        w: 50
      });

      fill(255);
      noStroke();
      translate(x, y);
      textAlign(CENTER);
      textSize(15 * ratio);
      if (timer.text) {
        text(timer.text, 0, -w * 0.5 - 15 * ratio);
      }
      rotate(-HALF_PI);
      arc(0, 0, w, w, 0, progress * TWO_PI, PIE);
      pop();

      // fill(255);
      // noStroke();
      // translate(width * 0.5, 100);
      // textAlign(CENTER);
      // textSize(15);
      // var timerR = 50;
      // if (timer.text) {
      //   text(timer.text, 0, -timerR * 0.5 - 15);
      // }
      // rotate(-HALF_PI);
      // arc(0, 0, timerR, timerR, 0, progress * TWO_PI, PIE);
      // pop();
    }

    if ((timer.time > 0 && timer.maxTime > 0) || (keyIsDown(76) && !textTarget)) {
      // Draw the scoreboard
      push()
      var txt = '';
      for (var i = 0; i < scoreboard.length; i++) {
        txt += `${scoreboard[i].name}: ${scoreboard[i].score}`;
        if (i < scoreboard.length - 1) {
          txt += '\n';
        }
      }

      fill(255);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(40 * ratio);
      text(txt, width * 0.5, height * 0.5);
      pop();
    }

    // Show the ping time if 'P' is pressed
    if (keyIsDown(80) && !textTarget) {
      drawText('Ping: ' + pingTime + 'ms', {
        x: 25,
        y: 50,
        textSize: 20,
        xEdge: true
      })
    }
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
  pop();
}

function drawPlayerWeapon(obj) {
  push();
  translate(obj.x, obj.y);
  rotate(obj.angle);
  if (obj.weapon) { // Draw player's weapon
    var weaponObj = obj.weapon;
    weaponObj.angle = 0; // Relative to player's angle and position
    weaponObj.x = obj.r;
    weaponObj.y = 0;
    weaponObj.hide = false;
    drawObject(weaponObj);
  } else if (!OLDGRAPHICS) {
    if (obj.shield) { // Draw player's shield
        fill(200);
        noStroke();
        rect(obj.r + 7, 0, 7, obj.shieldWidth);
    } else if (obj.id == myid) {
      fill(200, 50);
      noStroke();
      rect(obj.r + 7, 0, 7, obj.shieldWidth);
    }
  }
  pop();
}

// Draws the names of all players below them, as well as a crown on the previous winner
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

  // Draw crown on previous winner
  if (obj.id == lastWinner) {
    fill(255, 150, 0);
    stroke(255, 255, 0);
    strokeWeight(1);
    var r = obj.r;
    beginShape();
    vertex(-r, -r - 5);
    vertex(-r, -r - 15);
    vertex(-r * 0.5, -r - 10);
    vertex(0, -r - 15);
    vertex(r * 0.5, -r - 10);
    vertex(r, -r - 15);
    vertex(r, -r - 5);
    endShape(CLOSE);
  }

  pop();
}

function drawOffScreenPlayer(obj) {
  if (obj.x - obj.r > gameSize.w || obj.x + obj.r < 0 || obj.y - obj.r > gameSize.h || obj.y + obj.r < 0) {
    // Player is offscreen and an offscreen arrow needs to be drawn
    var x = obj.x;
    var y = obj.y;
    var buffer = obj.r * 2;

    if (x < buffer) {
      x = buffer;
    } else if (x > gameSize.w - buffer) {
      x = gameSize.w - buffer;
    }
    if (y < buffer) {
      y = buffer;
    } else if (y > gameSize.h - buffer) {
      y = gameSize.h - buffer;
    }
    var colour = obj.colour;
    colour.push(50);
    fill(colour);
    stroke(0, 50);
    strokeWeight(1);
    ellipse(x, y, obj.r * 2);
  }
}

//How to draw every possible game object - may split this into seperate functions as more game objects are added
function drawObject(obj) {
  push();
  switch (obj.type) {
    case 'platform': // Simple rectangle
      // translate(obj.x, obj.y);
      // rotate(obj.angle);
      fill(platformColours[obj.colour].fill);
      stroke(platformColours[obj.colour].edge);
      strokeWeight(platformColours[obj.colour].weight || 1);
      beginShape();
      for (var v of obj.vertices) {
        vertex(v.x, v.y);
      }
      endShape(CLOSE);
      // rect(0, 0, obj.w, obj.h);
      break;
    case 'weapon': // Rectangle for now - may add graphics
      translate(obj.x, obj.y);
      rotate(obj.angle);
      fill(obj.colour);
      stroke(0);
      strokeWeight(1);
      rect(0, 0, obj.w, obj.h);
      break;
    case 'bullet': // Long thin rectangle to show it is a fast bullet
      translate(obj.x, obj.y);
      rotate(obj.angle)
      fill(obj.colour);
      noStroke();
      rect(-obj.r * 1.5, 0, obj.r * 15, obj.r);
      break;
  }
  pop();
}

var platformColours = {
  default: {
    fill: 200,
    edge: 150,
    weight: 1
  },
  spike: {
    fill: 25,
    edge: 75,
    weight: 3
  },
  red: {
    fill: [200, 0, 0],
    edge: [150, 0, 0]
  },
  orange: {
    fill: [200, 120, 0],
    edge: [150, 90, 0]
  },
  yellow: {
    fill: [200, 200, 0],
    edge: [150, 150, 0]
  },
  green: {
    fill: [0, 200, 0],
    edge: [0, 150, 0]
  },
  cyan: {
    fill: [0, 200, 200],
    edge: [0, 150, 150]
  },
  blue: {
    fill: [0, 0, 200],
    edge: [0, 0, 150]
  },
  purple: {
    fill: [200, 0, 200],
    edge: [150, 0, 150]
  }
};
