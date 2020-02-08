var Matter = require('matter-js');

var Player = require('./player.js');
// var BasicGun = require('./weapons/basic-gun.js');
// var Platform = require('./platform.js');
// var Bullet = require('./bullet.js');

var mapFuncs = require('./maps/game-maps.js');

// Played within a lobby, runs the actual game and physics engine
class Game {
  constructor(users) {
    this.users = users;
    this.winner = null;
    this.ending = false;
    this.inGame = false;

    this.pendingParticles = [];
  }

  // Initialise the physics engine and other variables needed in the game
  initGame() {
    this.weapons = [];
    this.bullets = [];
    this.static = [];
    this.dynamic = [];

    this.width = 800;
    this.height = 540;
    this.bulletBounce = false;

    // Game boundary
    this.deathBounds = {
      top: -this.height / 2,
      bottom: this.height + 50
    }

    this.weaponCounter = 0;

    this.players = new Map();

    this.colours = [
      [255, 0, 0], // red
      [0, 0, 255], // blue
      [0, 255, 0], // green
      [255, 255, 0] // yellow
    ];

    // Create an engine
    this.engine = Matter.Engine.create();

    // Check if a player is colliding
    function collisionGoing(event) {
      var pairs = event.pairs;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var normal = pair.collision.normal;
        var playerA = this.players.get(pair.bodyA.label);
        var playerB = this.players.get(pair.bodyB.label);
        // If a player is colliding with a non-player, they can jump
        if (playerA) {
          this.collidePlayer(playerA, pair.bodyB, normal);
          // playerA.canJump = true;
          // playerA.jumpNormal = normal;
        }
        if (playerB) {
          this.collidePlayer(playerB, pair.bodyA, { x: -normal.x, y: -normal.y });
          // playerB.canJump = true;
          // playerB.jumpNormal = { x: -normal.x, y: -normal.y };
        }
      }
    }

    // Check if a player has stopped colliding
    function collisionStop(event) {
      var pairs = event.pairs;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var normal = pair.collision.normal;
        var normalAngle = Math.atan2(normal.y, normal.x);
        var playerA = this.players.get(pair.bodyA.label);
        var playerB = this.players.get(pair.bodyB.label);
        // Once a player stops colliding, they can't jump
        // Also creates particle effects
        if (playerA) {
          collisionParticles(playerA, pair.bodyA.position, normalAngle);
          playerA.canJump = false;
        }
        if (playerB) {
          normalAngle += Math.PI;
          collisionParticles(playerB, pair.bodyB.position, normalAngle);
          playerB.canJump = false;
        }
      }
    }

    // Allow the functions above to access the list of players in the game
    // var boundCollisionGoing = collisionGoing.bind({"players": this.players});
    // var boundCollisionStop = collisionStop.bind({"players": this.players});
    var boundCollisionGoing = collisionGoing.bind(this);
    var boundCollisionStop = collisionStop.bind(this);

    // Attach the functions to the matter.js engine
    Matter.Events.on(this.engine, 'collisionStart', boundCollisionGoing);
    Matter.Events.on(this.engine, 'collisionActive', boundCollisionGoing);
    Matter.Events.on(this.engine, 'collisionEnd', boundCollisionStop);
  }

  // Create the game map
  createMap() {
    var thisMapFunc = mapFuncs[Math.floor(Math.random() * mapFuncs.length)];
    thisMapFunc(this);

    this.weaponSpawnTotal = 0;
    for (var w of this.weaponSpawn) {
      this.weaponSpawnTotal += w[1];
    }
  }

  addPlayers() {
    var currentSpawn = 0;
    var currentColour = 0;
    // Add each player to the game
    for (var user of this.users.keys()) {
      var player = new Player(this.spawns[currentSpawn].x, this.spawns[currentSpawn].y, user, this.colours[currentColour], this.engine);
      this.players.set(player.id, player);

      // Colours cycle around
      currentColour++;
      if (currentColour >= this.colours.length) {
        currentColour = 0;
      }

      // Spawn locations cycle around
      currentSpawn++;
      if (currentSpawn >= this.spawns.length) {
        currentSpawn = 0;
      }
    }
  }

  startGame() {
    this.initGame();
    this.createMap();
    this.addPlayers();
    this.inGame = true;

    // Send initial static objects to the players
    this.staticToSend = [];
    for (var i = 0; i < this.static.length; i++) {
      this.staticToSend.push(this.static[i].toObject());
    }

    var data = {
      width: this.width,
      height: this.height,
      platforms: this.staticToSend,
      bulletBounce: this.bulletBounce
    }

    return data;
  }

  collidePlayer(player, other, normal) {
    if (other.label != 'nojump') {
      player.canJump = true;
      player.jumpNormal = normal;
    } else {
      player.canJump = false;
    }

    // Spikes kill players
    if (other.label == 'spike') {
      this.disconnectPlayer(player.id)
    }
  }

  addWeapon() {
    // Weapons drop more frequently if there are more players
    this.weaponCounter = 600 / this.players.size;

    var num = Math.random() * this.weaponSpawnTotal;
    var counter = 0;
    while (num > this.weaponSpawn[counter][1]) {
      num -= this.weaponSpawn[counter][1];
      counter++;
    }
    var chosenWeaponClass = this.weaponSpawn[counter][0];

    // var weapon = new BasicGun(Math.random() * (this.width - 300) + 150, Math.random() * -100, this.engine);
    var weapon = new chosenWeaponClass(Math.random() * (this.width - 300) + 150, Math.random() * -100, this.engine);
    this.weapons.push(weapon);
  }

  // The following three functions process user inputs (key and mouse presses, mouse movements)
  // Only process events if the player is in the game
  updateMousePos(playerid, mousePos) {
    var player = this.players.get(playerid);
    if (player) {
      player.mouseUpdate(mousePos);
    }
  }

  keyPressed(playerid, control) {
    var player = this.players.get(playerid);
    if (player) {
      player.controls[control] = true;
    }
  }

  keyReleased(playerid, control) {
    var player = this.players.get(playerid);
    if (player) {
      player.controls[control] = false;
    }
  }

  disconnectPlayer(playerid) {
    var player = this.players.get(playerid);
    if (player) {
      // Remove player from the physics engine
      player.removeFromWorld(this.engine);
      this.players.delete(playerid);
      if (!this.winner) {
        // Declare a winner if only one is remaining
        if (this.players.size == 1) {
          this.inGame = false;
          for (var playerid of this.players.keys()) {
            this.winner = playerid;
          }
        } else if (this.players.size == 0) {
          this.inGame = false;
          // No winner chosen if no players left - it's a draw
        }
      }
    }

    // Death particles
    var buffer = 20;
    var direction = 1;
    var deathX = player.body.position.x;
    if (deathX < buffer) {
      deathX = buffer;
    } else if (deathX > this.width - buffer) {
      deathX = this.width - buffer;
    }
    var deathY = player.body.position.y;
    if (deathY < 0) {
      deathY = 0;
      direction = -1;
    } else if (deathY > this.height) {
      deathY = this.height;
    }
    this.pendingParticles.push({
      x: deathX,
      y: deathY,
      vel: 5,
      velErr: 0.5,
      angle: -Math.PI * 0.5 * direction,
      angleErr: Math.PI * 0.125 * 0.5,
      gravity: 0.2,
      r: 5,
      life: 35,
      lifeErr: 5,
      col: player.colour,
      num: 50
    });
  }

  update(users) {
    for (var [playerid, player] of this.players.entries()) {
      var bullets = player.update(this.weapons, this.engine);
      if (bullets) {
        // Add new bullets shot by the player
        for (var b of bullets) {
          this.bullets.push(b);
        }
      }

      if (player.isOutOfBounds(this.deathBounds)) {
        // Remove players if they exit the game boundaries
        this.disconnectPlayer(playerid);
      }
    }

    for (var i = 0; i < this.weapons.length; i++) {
      if (this.weapons[i].isOffScreen(this.height)) {
        // Remove weapons if they go off screen
        this.weapons[i].removeFromWorld(this.engine);
        this.weapons.splice(i, 1);
        i--;
      }
    }

    for (var i = 0; i < this.bullets.length; i++) {
      var collide = this.bullets[i].update(this.engine.world.bodies, this.engine);
      if (this.bullets[i].isOffScreen(this.width, this.height, this.bulletBounce) || collide) {
        // Create bullet hit particle effect
        var b = this.bullets[i];
        this.pendingParticles.push({
          x: b.x,
          y: b.y,
          vel: 3,
          velErr: 1.5,
          angle: b.angle,
          angleErr: Math.PI * 0.25,
          gravity: 0,
          r: 3,
          life: 15,
          lifeErr: 3,
          col: b.colour,
          num: 10
        });

        if (collide || !this.bulletBounce) {
          // Remove bullets if they collide or if bullet bouncing is disabled
          // If bullets can bounce then they shouldn't be removed for going out of the map
          this.bullets.splice(i, 1);
          i--;
        }
      }
    }

    // Add weapons into game periodically if there aren't many on screen
    if (this.weaponCounter < 0) {
      if (this.weapons.length < this.players.size * 2) {
        // Add the weapon
        this.addWeapon();
      }
    } else {
      this.weaponCounter--;
    }

    // Run the physics engine
    Matter.Engine.update(this.engine);

    // Send any data that clients need to accurately animate the game
    var entities = [];
    var players = [];


    for (var i = 0; i < this.bullets.length; i++) {
      entities.push(this.bullets[i].toObject());
    }

    for (var i = 0; i < this.weapons.length; i++) {
      entities.push(this.weapons[i].toObject());
    }

    for (var i = 0; i < this.dynamic.length; i++) {
      entities.push(this.dynamic[i].toObject());
    }

    for (var player of this.players.values()) {
      players.push(player.toObject(users));
    }

    return [entities, players];
  }

  // Send any pending particle effects to the clients
  getParticles() {
    var particleExplosions = [];

    for (var i = 0; i < this.weapons.length; i++) {
      for (var j = 0; j < this.weapons[i].particles.length; j++) {
        particleExplosions.push(this.weapons[i].particles[j]);
      }
      this.weapons[i].particles = [];
    }

    for (var i = 0; i < this.bullets.length; i++) {
      for (var j = 0; j < this.bullets[i].particles.length; j++) {
        particleExplosions.push(this.bullets[i].particles[j]);
      }
      this.bullets[i].particles = [];
    }

    for (var player of this.players.values()) {
      for (var i = 0; i < player.particles.length; i++) {
        particleExplosions.push(player.particles[i]);
      }
      player.particles = [];
    }

    for (var i = 0; i < this.pendingParticles.length; i++) {
      particleExplosions.push(this.pendingParticles[i]);
    }
    this.pendingParticles = [];

    return particleExplosions;
  }
}

// Generate particles in the direction of the normal of a player collision
function collisionParticles(player, pos, angle) {
  var v = player.body.velocity;
  var vMagSq = Math.pow(v.x, 2) + Math.pow(v.y, 2);
  if (vMagSq < 3) {
    // Don't create particles if the player wasn't moving very fast
    return;
  }
  var px = pos.x - player.r * Math.cos(angle);
  var py = pos.y - player.r * Math.sin(angle);
  player.particles.push({
    x: px,
    y: py,
    vel: 3,
    velErr: 1.5,
    angle: angle,
    angleErr: Math.PI * 0.25,
    gravity: 0,
    r: 3,
    life: 15,
    lifeErr: 3,
    col: player.colour,
    num: 10
  });
}

module.exports = Game;
