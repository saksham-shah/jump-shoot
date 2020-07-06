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
    this.pendingSounds = [];
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
      // let bodyA = contact.getFixtureA().getBody();
      // let bodyB = contact.getFixtureB().getBody();
      let fixA = contact.getFixtureA();
      let fixB = contact.getFixtureB();
      let dataA = fixA.getUserData();
      let dataB = fixB.getUserData();
      if (dataA) {
        if (dataA.type == 'player') {
          this.collidePlayer(dataA.obj, fixB, { x: -normal.x, y: -normal.y });

        } else if (dataA.type == 'weapon') {
          if (!(this.experimental && dataB && dataB.type == 'player'
            // && dataA.obj.thrownBy == dataB.obj.id && dataA.obj.thrown < 0 && dataA.obj.thrown > -5)) {
            && weaponPassPlayer(dataB.obj, dataA.obj))) {

            if (dataA.obj.thrown < 0) {
              dataA.obj.thrown = 30;
              dataB.obj.passThrough = 0;
            }
            
            if (this.experimental && dataB && dataB.type == 'player') {
              if (dataB.obj.weapon == null && dataB.obj.cooldown >= 20) {
                if (dataA.obj.thrown == 0 || (dataA.obj.thrown > 0 && dataA.obj.throwHit && dataA.obj.throwHit != dataB.obj.id)) {
                  contact.setEnabled(false);
                }
              }
            }
          }
        }
      }

      if (dataB) {
        if (dataB.type == 'player') {
          this.collidePlayer(dataB.obj, fixA, { x: normal.x, y: normal.y });

        } else if (dataB.type == 'weapon') {
          if (!(this.experimental && dataA && dataA.type == 'player'
            // && dataB.obj.thrownBy == dataA.obj.id && dataB.obj.thrown < 0 && dataB.obj.thrown > -5)) {
            && weaponPassPlayer(dataA.obj, dataB.obj))) {
            if (dataB.obj.thrown < 0) {
              dataB.obj.thrown = 30;
              dataB.obj.passThrough = 0;
            }
            
            if (this.experimental && dataA && dataA.type == 'player') {
              if (dataA.obj.weapon == null && dataA.obj.cooldown >= 20) {
                if (dataB.obj.thrown == 0 || (dataB.obj.thrown > 0 && dataB.obj.throwHit && dataB.obj.throwHit != dataA.obj.id)) {
                  contact.setEnabled(false);
                }
              }
            }
          }
        }
      }
    });

    this.world.on('end-contact', contact => {
      // let bodyA = contact.getFixtureA().getBody();
      // let bodyB = contact.getFixtureB().getBody();
      let fixA = contact.getFixtureA();
      let fixB = contact.getFixtureB();
      let dataA = fixA.getUserData();
      let dataB = fixB.getUserData();

      if (dataA && dataA.type == 'player') {
        let player = dataA.obj;
        for (let i = player.contacts.length - 1; i >= 0; i--) {
          if (fixB == player.contacts[i].fixture) {
            collisionParticles(player, player.contacts[i].normal);
            if (dataB && dataB.friction) {
              player.staticFriction--;
            }
            player.contacts.splice(i, 1);
          }
        }
      }

      if (dataB && dataB.type == 'player') {
        let player = dataB.obj;
        for (let i = player.contacts.length - 1; i >= 0; i--) {
          if (fixA == player.contacts[i].fixture) {
            if (dataA && dataA.friction) {
              player.staticFriction--;
            }
            collisionParticles(player, player.contacts[i].normal);
            player.contacts.splice(i, 1);
          }
        }
      }
    });

    this.world.on('pre-solve', contact => {
      let fixA = contact.getFixtureA();
      let fixB = contact.getFixtureB();
      let dataA = fixA.getUserData();
      let dataB = fixB.getUserData();

      if (dataA && dataA.type == 'weapon' && dataB && dataB.type == 'player') {
        if (weaponPassPlayer(dataB.obj, dataA.obj)) {
          contact.setEnabled(false);
        }
      }

      if (dataB && dataB.type == 'weapon' && dataA && dataA.type == 'player') {
        if (weaponPassPlayer(dataA.obj, dataB.obj)) {
          contact.setEnabled(false);
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
      var player = new Player(this.spawns[currentSpawn].x + (Math.random() - 0.5) * 0.01, this.spawns[currentSpawn].y + (Math.random() - 0.5) * 0.01, user, this.colours[currentColour], this.world, this.experimental);
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
    let data = other.getUserData();
    if (data && data.type == 'weapon') {
      if (weaponPassPlayer(player, data.obj)) return;
    }

    let thisContact = {
      fixture: other,
      normal: normal
    }

    player.contacts.push(thisContact);
    collisionParticles(player, normal);
    player.landed = true;

    if (data) {
      // Spikes kill players
      if (data.spike) {
        this.queueRemovePlayer(player.id)
      }

      if (data.friction) {
        player.staticFriction++;
      }

      if (data.type == 'weapon') {
        if (data.obj.thrown != 0 && !data.obj.throwHit) {
          data.obj.throwHit = player.id;
          player.damage(1);
          player.sounds.push('throwhit');
        }
      }
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
      } else if (deathY > this.height) {
        deathY = this.height;
        direction = -1;
      }
      this.pendingParticles.push({
        x: deathX,
        y: deathY,
        vel: 0.33,
        velErr: 0.033,
        angle: Math.PI * 0.5 * direction,
        angleErr: Math.PI * 0.125 * 0.5,
        gravity: -0.013,
        r: 0.33,
        life: 35,
        lifeErr: 5,
        col: player.colour,
        num: 50
      });
      this.pendingSounds.push('death');
    }
  }

  update() {
    for (let playerid of this.playersToRemove) {
      this.removePlayer(playerid);
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

          // Add all remaining bullet particles and sounds to pendingParticles and pendingSounds
          for (var j = 0; j < this.bullets[i].particles.length; j++) {
            this.pendingParticles.push(this.bullets[i].particles[j]);
          }
    
          for (var j = 0; j < this.bullets[i].sounds.length; j++) {
            this.pendingSounds.push(this.bullets[i].sounds[j]);
          }

          this.bullets.splice(i, 1);
          i--;
        }
      }
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
      players.push(player.toObject());
    }

    return { entities, players, nextWeaponX: this.nextWeaponX };
  }

  // Send any pending particle effects to the clients
  getEffects() {
    var particleExplosions = [];
    var sounds = [];

    for (var i = 0; i < this.weapons.length; i++) {
      for (var j = 0; j < this.weapons[i].particles.length; j++) {
        particleExplosions.push(this.weapons[i].particles[j]);
      }
      this.weapons[i].particles = [];

      for (var j = 0; j < this.weapons[i].sounds.length; j++) {
        sounds.push(this.weapons[i].sounds[j]);
      }
      this.weapons[i].sounds = [];
    }

    for (var i = 0; i < this.bullets.length; i++) {
      for (var j = 0; j < this.bullets[i].particles.length; j++) {
        particleExplosions.push(this.bullets[i].particles[j]);
      }
      this.bullets[i].particles = [];

      for (var j = 0; j < this.bullets[i].sounds.length; j++) {
        sounds.push(this.bullets[i].sounds[j]);
      }
      this.bullets[i].sounds = [];
    }

    for (var player of this.players.values()) {
      for (var i = 0; i < player.particles.length; i++) {
        particleExplosions.push(player.particles[i]);
      }
      player.particles = [];

      for (var i = 0; i < player.sounds.length; i++) {
        sounds.push(player.sounds[i]);
      }
      player.sounds = [];
    }

    for (var i = 0; i < this.pendingParticles.length; i++) {
      particleExplosions.push(this.pendingParticles[i]);
    }
    this.pendingParticles = [];

    for (var i = 0; i < this.pendingSounds.length; i++) {
      sounds.push(this.pendingSounds[i]);
    }
    this.pendingSounds = [];

    return { particles: particleExplosions, sounds: sounds };
  }
}

// Check if a collision is strong enough for particles to be created
function isPowerfulLanding(player, normal) {
  if (player.lastCollisionParticle > 0) return false;
  if (!player.landed) return true;

  var nAng = Math.atan2(normal.y, normal.x);
  // Calculate the magnitude and angle of current velocity
  var v = player.body.getLinearVelocity();
  var vMag = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
  var vAng = Math.atan2(v.y, v.x);

  // Work out the component of the velocity parallel to the normal
  var angle = vAng - nAng;
  var parallelV = vMag * Math.cos(angle);
  return parallelV > 10;
}

// Generate particles in the direction of the normal of a player collision
function collisionParticles(player, normal) {
  if (!isPowerfulLanding(player, normal)) return;
  var angle = Math.atan2(normal.y, normal.x);
  // var v = player.body.getLinearVelocity();
  // var vMagSq = Math.pow(v.x, 2) + Math.pow(v.y, 2);
  // if ((vMagSq < 100 || player.lastCollisionParticle > 0) && player.landed) {
  //   // Don't create particles if the player wasn't moving very fast
  //   return;
  // }
  // if (player.lastCollisionParticle > 0) {
  //   return;
  // }
  player.lastCollisionParticle = 3;

  var pos = player.body.getPosition();

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
  player.sounds.push('collision');
}

function weaponPassPlayer(player, weapon) {
  if (weapon.passThrough == 0) return false;
  if (weapon.thrownBy == null) return true;
  return weapon.thrownBy == player.id;
}

module.exports = Game;
