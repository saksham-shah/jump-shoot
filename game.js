var Matter = require('matter-js');

var Player = require('./player.js');
var BasicGun = require('./basic-gun.js');
var Platform = require('./platform.js');
var Bullet = require('./bullet.js');

// var LobbyData = require('./lobbydata.js');
// var serverStuff = require('./server.js');

class Game {
  constructor(users) {
    this.users = users;
    this.winner = null;
    this.inGame = false;
    // this.weapons = [];
    // this.bullets = [];
    // this.platforms = [];
    //
    // this.weaponCounter = 0;
    //
    // this.players = new Map();
    //
    // this.colours = [
    //   [255, 0, 0], // red
    //   [0, 0, 255], // blue
    //   [0, 255, 0], // green
    //   [255, 255, 0] // yellow
    // ];
    // this.colourCount = 0;
    //
    // this.engine = Matter.Engine.create();
    //
    // this.width = 0;
    // this.height = 0;

  }

  initGame() {
    // var Engine = Matter.Engine,
    //     Render = Matter.Render,
    //     World = Matter.World,
    //     Bodies = Matter.Bodies,
    //     Body = Matter.Body,
    //     Events = Matter.Events;

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

    // create an engine
    this.engine = Matter.Engine.create();

    function collisionGoing(event) {
      var pairs = event.pairs;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var playerA = this.players.get(pair.bodyA.label);
        var playerB = this.players.get(pair.bodyB.label);
        if (playerA && !playerB) {
          playerA.canJump = true;
        }
        if (playerB && !playerA) {
          playerB.canJump = true;
        }
      }
    }

    function collisionStop(event) {
      var pairs = event.pairs;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var playerA = this.players.get(pair.bodyA.label);
        var playerB = this.players.get(pair.bodyB.label);
        if (playerA && !playerB) {
          playerA.canJump = false;
        }
        if (playerB && !playerA) {
          playerB.canJump = false;
        }
      }
    }

    var boundCollisionGoing = collisionGoing.bind({"players": this.players});
    var boundCollisionStop = collisionStop.bind({"players": this.players});

    Matter.Events.on(this.engine, 'collisionStart', boundCollisionGoing);
    Matter.Events.on(this.engine, 'collisionActive', boundCollisionGoing);
    Matter.Events.on(this.engine, 'collisionEnd', boundCollisionStop);

    // Matter.Events.on(this.engine, 'collisionStart', function(event) {
    //   var pairs = event.pairs;
    //   for (var i = 0; i < pairs.length; i++) {
    //     var pair = pairs[i];
    //     // console.log(this);
    //     // if (playerA != playerB) {
    //     //   if (playerA == "player") {
    //     //     playerA.canJump = true;
    //     //   }
    //     //   if (playerB == "player") {
    //     //     playerB.canJump = true;
    //     //   }
    //     // }
    //     var playerA = LobbyData.findPlayerInGame(pair.bodyA.label, serverStuff.users, serverStuff.lobbies);
    //     var playerB = LobbyData.findPlayerInGame(pair.bodyB.label, serverStuff.users, serverStuff.lobbies);
    //     // var playerA = this.players.get(pair.bodyA.label);
    //     // var playerB = this.players.get(pair.bodyB.label);
    //     if (playerA && !playerB) {
    //       playerA.canJump = true;
    //     }
    //     if (playerB && !playerA) {
    //       playerB.canJump = true;
    //     }
    //   }
    // });
    //
    // Matter.Events.on(this.engine, 'collisionActive', function(event) {
    //   var pairs = event.pairs;
    //   for (var i = 0; i < pairs.length; i++) {
    //     var pair = pairs[i];
    //     var playerA = LobbyData.findPlayerInGame(pair.bodyA.label, serverStuff.users, serverStuff.lobbies);
    //     var playerB = LobbyData.findPlayerInGame(pair.bodyB.label, serverStuff.users, serverStuff.lobbies);
    //     // var playerA = this.players.get(pair.bodyA.label);
    //     // var playerB = this.players.get(pair.bodyB.label);
    //     var playerA = LobbyData
    //     if (playerA && !playerB) {
    //       playerA.canJump = true;
    //     }
    //     if (playerB && !playerA) {
    //       playerB.canJump = true;
    //     }
    //   }
    // });
    //
    // Matter.Events.on(this.engine, 'collisionEnd', function(event) {
    //   var pairs = event.pairs;
    //   for (var i = 0; i < pairs.length; i++) {
    //     var pair = pairs[i];
    //     var playerA = LobbyData.findPlayerInGame(pair.bodyA.label, serverStuff.users, serverStuff.lobbies);
    //     var playerB = LobbyData.findPlayerInGame(pair.bodyB.label, serverStuff.users, serverStuff.lobbies);
    //     // var playerA = this.players.get(pair.bodyA.label);
    //     // var playerB = this.players.get(pair.bodyB.label);
    //     if (playerA && !playerB) {
    //       playerA.canJump = false;
    //     }
    //     if (playerB && !playerA) {
    //       playerB.canJump = false;
    //     }
    //   }
    // });

    for (var i = 0; i < this.users.length; i++) {
      var player = new Player(100, 200, this.users[i], this.colours[this.colourCount], this.engine);
      this.colourCount++;
      if (this.colourCount >= this.colours.length) {
        this.colourCount = 0;
      }
      this.players.set(player.id, player);
    }
  }

  createMap() {
    this.width = 800;
    this.height = 540;

    var ground = new Platform(this.width / 2, this.height - 20, this.width - 30, 20, this.engine);
    this.platforms.push(ground);

    this.deathBounds = {
      bottom: this.height + 50
    }
  }

  startGame() {
    this.initGame();
    this.createMap();
    this.inGame = true;

    this.statics = [];
    for (var i = 0; i < this.platforms.length; i++) {
      this.statics.push(this.platforms[i].toObject());
    }

    var data = {
      width: this.width,
      height: this.height,
      platforms: this.statics
    }

    return data;
  }

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
      player.removeFromWorld(this.engine);
      this.players.delete(playerid);
      if (this.players.size == 1) {
        this.inGame = false;
        for (var playerid of this.players.keys()) {
          this.winner = playerid;
        }
        // this.winner = this.players.keys()[0];
        // console.log(this.players.keys())
      } else if (this.players.size == 0) {
        this.inGame = false;
      }
    }
  }

  update(users) {
    for (var [playerid, player] of this.players.entries()) {
      var bullet = player.update(this.weapons, this.engine);
      if (bullet) {
        this.bullets.push(bullet);
      }

      if (player.isOutOfBounds(this.deathBounds)) {
        this.disconnectPlayer(playerid);
      }
    }

    for (var i = 0; i < this.weapons.length; i++) {
      if (this.weapons[i].isOffScreen(this.height)) {
        this.weapons[i].removeFromWorld(this.engine);
        this.weapons.splice(i, 1);
        i--;
      }
    }

    for (var i = 0; i < this.bullets.length; i++) {
      var collide = this.bullets[i].update(this.engine.world.bodies);
      if (this.bullets[i].isOffScreen(this.width, this.height) || collide) {
        this.bullets.splice(i, 1);
        i--;
      }
    }

    if (this.weaponCounter < 0) {
      if (this.weapons.length < this.players.size * 2) {
        this.weaponCounter = 300;
        var weapon = new BasicGun(Math.random() * (this.width - 100) + 50, 0, this.engine);
        this.weapons.push(weapon);
      }
    } else {
      this.weaponCounter--;
    }

    Matter.Engine.update(this.engine);

    var data = [];

    for (var i = 0; i < this.bullets.length; i++) {
      data.push(this.bullets[i].toObject());
    }

    for (var player of this.players.values()) {
      data.push(player.toObject(users));
    }

    for (var i = 0; i < this.weapons.length; i++) {
      data.push(this.weapons[i].toObject());
    }

    return data;
  }

}


module.exports = Game;
