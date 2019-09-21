var Matter = require('matter-js');

var Player = require('./player.js');
var BasicGun = require('./basic-gun.js');
var Platform = require('./platform.js');
var Bullet = require('./bullet.js');

// Played within a lobby, runs the actual game and physics engine
class Game {
  constructor(users) {
    this.users = users;
    this.winner = null;
    this.ending = false;
    this.inGame = false;
  }

  // Initialise the physics engine and other variables needed in the game
  initGame() {
    this.weapons = [];
    this.bullets = [];
    this.platforms = [];

    this.weaponCounter = 0;

    this.players = new Map();

    this.colours = [
      [255, 0, 0], // red
      [0, 0, 255], // blue
      [0, 255, 0], // green
      [255, 255, 0] // yellow
    ];
    this.colourCount = 0;

    // Create an engine
    this.engine = Matter.Engine.create();

    // Check if a player is colliding
    function collisionGoing(event) {
      var pairs = event.pairs;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var playerA = this.players.get(pair.bodyA.label);
        var playerB = this.players.get(pair.bodyB.label);
        // If a player is colliding with a non-player, they can jump
        if (playerA && !playerB) {
          playerA.canJump = true;
        }
        if (playerB && !playerA) {
          playerB.canJump = true;
        }
      }
    }

    // Check if a player has stopped colliding
    function collisionStop(event) {
      var pairs = event.pairs;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var playerA = this.players.get(pair.bodyA.label);
        var playerB = this.players.get(pair.bodyB.label);
        // Once a player stops colliding, they can't jump
        if (playerA && !playerB) {
          playerA.canJump = false;
        }
        if (playerB && !playerA) {
          playerB.canJump = false;
        }
      }
    }

    // Allow the functions above to access the list of players in the game
    var boundCollisionGoing = collisionGoing.bind({"players": this.players});
    var boundCollisionStop = collisionStop.bind({"players": this.players});

    // Attach the functions to the matter.js engine
    Matter.Events.on(this.engine, 'collisionStart', boundCollisionGoing);
    Matter.Events.on(this.engine, 'collisionActive', boundCollisionGoing);
    Matter.Events.on(this.engine, 'collisionEnd', boundCollisionStop);

    // Add each player to the game
    for (var i = 0; i < this.users.length; i++) {
      var player = new Player(100, 200, this.users[i], this.colours[this.colourCount], this.engine);
      // Colours cycle around
      this.colourCount++;
      if (this.colourCount >= this.colours.length) {
        this.colourCount = 0;
      }
      this.players.set(player.id, player);
    }
  }

  // Create the game map
  createMap() {
    this.width = 800;
    this.height = 540;

    var ground = new Platform(this.width / 2, this.height - 20, this.width - 30, 20, this.engine);
    this.platforms.push(ground);

    // Game boundary
    this.deathBounds = {
      bottom: this.height + 50
    }
  }

  startGame() {
    this.initGame();
    this.createMap();
    this.inGame = true;

    // Send initial static objects to the players
    this.statics = [];
    for (var i = 0; i < this.platforms.length; i++) {
      this.statics.push(this.platforms[i].toObject());
    }

    var data = {
      // type: 'newGame',
      width: this.width,
      height: this.height,
      platforms: this.statics
    }

    return data;
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
  }

  update(users) {
    for (var [playerid, player] of this.players.entries()) {
      var bullet = player.update(this.weapons, this.engine);
      if (bullet) {
        // Add new bullets shot by the player
        this.bullets.push(bullet);
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
      var collide = this.bullets[i].update(this.engine.world.bodies);
      if (this.bullets[i].isOffScreen(this.width, this.height) || collide) {
        // Remove bullets if they go off screen
        this.bullets.splice(i, 1);
        i--;
      }
    }

    // Add weapons into game periodically if there aren't many on screen
    if (this.weaponCounter < 0) {
      if (this.weapons.length < this.players.size * 2) {
        this.weaponCounter = 300;
        var weapon = new BasicGun(Math.random() * (this.width - 100) + 50, 0, this.engine);
        this.weapons.push(weapon);
      }
    } else {
      this.weaponCounter--;
    }

    // Run the physics engine
    Matter.Engine.update(this.engine);

    // Send any data clients need to accurately animate the game
    var entities = [];
    var players = [];
    // var data = {
    //   type: 'updateGame',
    //   entities: []
    // };

    for (var i = 0; i < this.bullets.length; i++) {
      entities.push(this.bullets[i].toObject());
    }

    // for (var player of this.players.values()) {
    //   entities.push(player.toObject(users));
    // }

    for (var i = 0; i < this.weapons.length; i++) {
      entities.push(this.weapons[i].toObject());
    }

    for (var player of this.players.values()) {
      players.push(player.toObject(users));
    }

    return [entities, players];
  }

}

module.exports = Game;
