const pl = require('planck-js');
const vec = pl.Vec2;
const STEP = 1 / 60;

var Player = require('./player.js');
// var BasicGun = require('./weapons/basic-gun.js');
// var Platform = require('./platform.js');
// var Bullet = require('./bullet.js');

var BasicGun = require('./weapons/basic-gun.js');
var MachineGun = require('./weapons/machine-gun.js');
var Sniper = require('./weapons/sniper.js');
var Shotgun = require('./weapons/shotgun.js');

var mapFuncs = require('./maps/game-maps.js');

// Played within a lobby, runs the actual game and physics engine
class Game {
  constructor(users, experimental) {
    this.users = users;
    this.winner = null;
    this.ending = false;
    this.inGame = false;

    this.experimental = experimental;

    this.pendingParticles = [];
    this.playersToRemove = [];
  }

  // Initialise the physics engine and other variables needed in the game
  initGame() {
    this.weapons = [];
    this.bullets = [];
    this.static = [];
    this.dynamic = [];
    this.paths = [];

    this.width = 54;
    this.height = 36;
    this.bulletBounce = null;

    this.weaponCounter = 180;
    this.nextWeaponX = null;
    this.weaponID = 0;

    this.time = 0;

    this.storedObjects = {};

    this.players = new Map();

    this.colours = [
      [255, 0, 0], // red
      [0, 0, 255], // blue
      [0, 255, 0], // green
      [255, 255, 0] // yellow
    ];

    this.world = pl.World({
      gravity: vec(0, -60)
    });

    this.world.on('begin-contact', contact => {
      let normal = contact.getWorldManifold().normal;
      let bodyA = contact.getFixtureA().getBody();
      let bodyB = contact.getFixtureB().getBody();
      let dataA = bodyA.getUserData();
      let dataB = bodyB.getUserData();

      if (dataA && dataA.type == 'player') {
        this.collidePlayer(dataA.obj, bodyB, { x: normal.x, y: normal.y });
      }

      if (dataB && dataB.type == 'player') {
        this.collidePlayer(dataB.obj, bodyA, { x: -normal.x, y: -normal.y });
      }
    });

    this.world.on('end-contact', contact => {
      let bodyA = contact.getFixtureA().getBody();
      let bodyB = contact.getFixtureB().getBody();
      let dataA = bodyA.getUserData();
      let dataB = bodyB.getUserData();

      if (dataA && dataA.type == 'player') {
        let player = dataA.obj;
        for (let i = player.contacts.length - 1; i >= 0; i--) {
          if (bodyB == player.contacts[i].body) {
            collisionParticles(player, bodyA.getPosition(), player.contacts[i].normal);
            player.contacts.splice(i, 1);
          }
        }
      }

      if (dataB && dataB.type == 'player') {
        let player = dataB.obj;
        for (let i = player.contacts.length - 1; i >= 0; i--) {
          if (bodyA == player.contacts[i].body) {
            collisionParticles(player, bodyB.getPosition(), player.contacts[i].normal);
            player.contacts.splice(i, 1);
          }
        }
      }
    });

  }

  // Create the game map
  createMap() {
    var thisMapFunc = mapFuncs[Math.floor(Math.random() * mapFuncs.length)];
    thisMapFunc(this);

    // Weapons
    this.weaponSpawn = [
      [BasicGun, 1],
      [MachineGun, 1],
      [Sniper, 1],
      [Shotgun, 1]
    ]

    this.weaponSpawnTotal = 0;
    for (var w of this.weaponSpawn) {
      this.weaponSpawnTotal += w[1];
    }

    if (this.bulletBounce === null) {
      this.bulletBounce = Math.random() > 0.25 ? false : true;
    }

    if (!this.deathBounds) {
      // Game boundary
      this.deathBounds = {
        top: this.height + 27,
        bottom: -3,
        left: -40,
        right: this.width + 40
      }
    }
  }

  addPlayers() {
    var currentSpawn = Math.floor(Math.random() * this.spawns.length);
    var currentColour = 0;
    // Add each player to the game
    for (var user of this.users.keys()) {
      var player = new Player(this.spawns[currentSpawn].x, this.spawns[currentSpawn].y, user, this.colours[currentColour], this.world, this.experimental);
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
    let thisContact = {
      body: other,
      normal: normal
    }

    player.contacts.push(thisContact);

    let data = other.getUserData();
    // Spikes kill players
    if (data && data.spike) {
      this.queueRemovePlayer(player.id)
    }
  }

  addWeapon() {
    // Weapons drop more frequently if there are more players
    this.weaponCounter = 600 / this.players.size;

    var num = Math.random() * this.weaponSpawnTotal;
    var counter = 0;
    while (num >= this.weaponSpawn[counter][1]) {
      num -= this.weaponSpawn[counter][1];
      counter++;
    }
    var chosenWeaponClass = this.weaponSpawn[counter][0];


    // var weapon = new BasicGun(Math.random() * (this.width - 300) + 150, Math.random() * -100, this.engine);
    var weapon = new chosenWeaponClass(this.nextWeaponX, this.height + 3, this.world, this.experimental, this.weaponID);
    this.weapons.push(weapon);

    this.nextWeaponX = null;
    this.weaponID++;
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

  queueRemovePlayer(playerid) {
    this.playersToRemove.push(playerid);
  }

  removePlayer(playerid) {
    var player = this.players.get(playerid);
    if (player) {
      // Remove player from the physics engine
      player.removeFromWorld(this.world);
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

      // Death particles
      var buffer = 1.33;
      var direction = 1;
      var deathX = player.body.getPosition().x;
      if (deathX < buffer) {
        deathX = buffer;
      } else if (deathX > this.width - buffer) {
        deathX = this.width - buffer;
      }
      var deathY = player.body.getPosition().y;
      if (deathY < 0) {
        deathY = 0;
        direction = -1;
      } else if (deathY > this.height) {
        deathY = this.height;
      }
      this.pendingParticles.push({
        x: deathX,
        y: deathY,
        vel: 0.33,
        velErr: 0.033,
        angle: -Math.PI * 0.5 * direction,
        angleErr: Math.PI * 0.125 * 0.5,
        gravity: -0.013,
        r: 0.33,
        life: 35,
        lifeErr: 5,
        col: player.colour,
        num: 50
      });
    }
  }

  update(users) {
    for (let playerid of this.playersToRemove) {
      this.removePlayer(playerid);
    }

    for (var [playerid, player] of this.players.entries()) {
      var bullets = player.update(this.weapons, this.world);
      if (bullets) {
        // Add new bullets shot by the player
        for (var b of bullets) {
          this.bullets.push(b);
        }
      }

      if (player.isOutOfBounds(this.deathBounds)) {
        // Remove players if they exit the game boundaries
        this.removePlayer(playerid);
      }
    }

    for (var i = 0; i < this.weapons.length; i++) {
      if (this.weapons[i].isOffScreen(this.height)) {
        // Remove weapons if they go off screen
        this.weapons[i].removeFromWorld(this.world);
        this.weapons.splice(i, 1);
        i--;
      } else {
        this.weapons[i].update();
      }
    }

    for (var i = 0; i < this.bullets.length; i++) {
      var collide = this.bullets[i].update(this.players, this.world);
      if (this.bullets[i].isOffScreen(this.width, this.height, this.bulletBounce) || collide) {
        // Create bullet hit particle effect
        var b = this.bullets[i];
        this.pendingParticles.push({
          x: b.x,
          y: b.y,
          vel: 0.2,
          velErr: 0.1,
          angle: b.angle,
          angleErr: Math.PI * 0.25,
          gravity: 0,
          r: 0.2,
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

    // Decide where the next weapon will drop
    if (this.weaponCounter < 180 && this.nextWeaponX == null) {
      this.nextWeaponX = Math.random() * (this.width - 20) + 10;
    }

    // Add weapons into game periodically if there aren't many on screen
    if (this.weaponCounter < 0) {
      // if (this.weapons.length < this.players.size * 2) {
      // Add the weapon
      this.addWeapon();
      // }
    } else {
      this.weaponCounter--;
    }

    if (this.platformUpdate) this.platformUpdate(this.storedObjects);

    for (var path of this.paths) {
      path.update(this.time);
    }

    // Run the physics engine
    this.world.step(STEP);
    this.time += STEP;

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

    return { entities, players, nextWeaponX: this.nextWeaponX };
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
function collisionParticles(player, pos, normal) {
  var angle = Math.atan2(normal.y, normal.x);
  var v = player.body.getLinearVelocity();
  var vMagSq = Math.pow(v.x, 2) + Math.pow(v.y, 2);
  if (vMagSq < 100) {
    // Don't create particles if the player wasn't moving very fast
    return;
  }
  if (player.lastCollisionParticle > 0) {
    return;
  }
  player.lastCollisionParticle = 60;

  var px = pos.x - player.r * Math.cos(angle);
  var py = pos.y - player.r * Math.sin(angle);
  player.particles.push({
    x: px,
    y: py,
    vel: 0.2,
    velErr: 0.1,
    angle: angle,
    angleErr: Math.PI * 0.25,
    gravity: 0,
    r: 0.2,
    life: 15,
    lifeErr: 3,
    col: player.colour,
    num: 10
  });
}

module.exports = Game;
