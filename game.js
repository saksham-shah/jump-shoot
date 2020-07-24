const pl = require('planck-js');
const vec = pl.Vec2;
const STEP = 1 / 60;

var Player = require('./player.js');

var BasicGun = require('./weapons/basic-gun.js');
var MachineGun = require('./weapons/machine-gun.js');
var Sniper = require('./weapons/sniper.js');
var Shotgun = require('./weapons/shotgun.js');

var mapFuncs = require('./maps/game-maps.js');

// Played within a lobby, runs the actual game and physics engine
class Game {
  constructor(users, settings) {
    this.users = users;
    this.winner = null;
    this.ending = false;
    this.inGame = false;

    this.settings = {
      experimental: settings.experimental,
      mass: settings.mass,
      bounceChance: settings.bounceChance,
      teams: settings.teams
    };

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

    // Properties of the map which can be changed in map functions
    this.width = 54;
    this.height = 36;
    this.bulletBounce = null;

    // Controls weapon drops
    this.weaponCounter = 180;
    this.nextWeaponX = null;
    this.weaponID = 0;

    this.time = 0;

    this.players = new Map();

    // Create the planck world
    this.world = pl.World({
      gravity: vec(0, -60)
    });

    // Event fired when a coliision starts between two fixtures
    this.world.on('begin-contact', contact => {
      let normal = contact.getWorldManifold().normal;
      let fixA = contact.getFixtureA();
      let fixB = contact.getFixtureB();
      let dataA = fixA.getUserData();
      let dataB = fixB.getUserData();

      // If one of the bodies is a player, process the player collision
      if (dataA && dataA.type == 'player') {
        this.collidePlayer(dataA.obj, fixB, { x: -normal.x, y: -normal.y });
      }

      if (dataB && dataB.type == 'player') {
        this.collidePlayer(dataB.obj, fixA, { x: normal.x, y: normal.y });
      }

      // Processes weapon collisions
      // Similar to Game.collidePlayer and honestly they should be next to each other in the code
      function processWeaponCollision(weapon, otherData) {
        // Don't process the collision if the other body is a player and the weapon should pass through
        if (!(otherData && otherData.type == 'player'
          && weaponPassPlayer(otherData.obj, weapon))) {

          // If the weapon was in the air (having been thrown), now it isn't
          if (weapon.thrown < 0) {
            weapon.thrown = 15;
            weapon.passThrough = 0;
          }
          
          // If the other body is a player
          if (otherData && otherData.type == 'player') {
            // If the player can equip a weapon
            if (otherData.obj.weapon == null && otherData.obj.cooldown >= 20) {
              // If the player can equip this particular weapon
              if (otherData.obj.weaponIsEquippable(weapon)) {
                // Disable the collision
                contact.setEnabled(false);
              }
            }
          }
        }
      }

      if (dataA && dataA.type == 'weapon') {
        processWeaponCollision(dataA.obj, dataB);
      }

      if (dataB && dataB.type == 'weapon') {
        processWeaponCollision(dataB.obj, dataA);
      }
    });

      // Event fired when a coliision ends between two fixtures
    this.world.on('end-contact', contact => {
      let fixA = contact.getFixtureA();
      let fixB = contact.getFixtureB();
      let dataA = fixA.getUserData();
      let dataB = fixB.getUserData();

      // If one of the bodies is a player
      if (dataA && dataA.type == 'player') {
        let player = dataA.obj;
        // Loop through all current player contacts
        for (let i = player.contacts.length - 1; i >= 0; i--) {
          // Find the contact that this event is about
          if (fixB == player.contacts[i].fixture) {
            // Create collision particles
            collisionParticles(player, player.contacts[i].normal);

            // Decrement the counter of friction contacts and remove this contact from the array
            if (dataB && dataB.friction) {
              player.staticFriction--;
            }
            player.contacts.splice(i, 1);
          }
        }
      }

      // Same as above but for the other body
      if (dataB && dataB.type == 'player') {
        let player = dataB.obj;
        for (let i = player.contacts.length - 1; i >= 0; i--) {
          if (fixA == player.contacts[i].fixture) {
            collisionParticles(player, player.contacts[i].normal);
            if (dataA && dataA.friction) {
              player.staticFriction--;
            }
            player.contacts.splice(i, 1);
          }
        }
      }
    });

    // Event fired every frame a collision is in progress
    this.world.on('pre-solve', contact => {
      let fixA = contact.getFixtureA();
      let fixB = contact.getFixtureB();
      let dataA = fixA.getUserData();
      let dataB = fixB.getUserData();

      // If the collision is between a weapon and a player
      if (dataA && dataA.type == 'weapon' && dataB && dataB.type == 'player') {
        // If the weapon should pass through the player, disable the collision
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
    // Randomly pick a map and call the map function
    var thisMapFunc = mapFuncs[Math.floor(Math.random() * mapFuncs.length)];
    thisMapFunc(this);

    // Weapons
    this.weaponSpawn = [
      [BasicGun, 1],
      [MachineGun, 1],
      [Sniper, 1],
      [Shotgun, 1]
    ]

    // A counter used to pick weapons randomly if they were unevenly weighted
    this.weaponSpawnTotal = 0;
    for (var w of this.weaponSpawn) {
      this.weaponSpawnTotal += w[1];
    }

    // Randomly decide if 'bullet bounce' is active in this game
    if (this.bulletBounce === null) {
      this.bulletBounce = Math.random() > this.settings.bounceChance ? false : true;
    }

    // Define the death bounds
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
    // Pick one of the spawn points to spawn the first player at
    var currentSpawn = Math.floor(Math.random() * this.spawns.length);
    // Add each player to the game
    for (var user of this.users.keys()) {
      // Don't add the player if they are spectating
      if (this.users.get(user).spectate) continue;

      // Decide the player's colour
      let colour;
      let team = this.users.get(user).team;
      // If teams are disabled, each player has their own colour
      if (this.settings.teams) {
        colour = team;
      } else {
        colour = this.users.get(user).colour;
      }

      // Create the player object at the chosen spawn point and add them to the players Map
      // Slight random variation in coordinates so players never spawn at EXACTLY the same position
      var player = new Player(this.spawns[currentSpawn].x + (Math.random() - 0.5) * 0.01, this.spawns[currentSpawn].y + (Math.random() - 0.5) * 0.01, user, colour, team, this.settings.mass, this.world, this.settings.experimental);
      this.players.set(player.id, player);

      // Spawn locations cycle around
      currentSpawn++;
      if (currentSpawn >= this.spawns.length) {
        currentSpawn = 0;
      }
    }
  }

  // Start the game by calling the above methods
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

  // A player has collided with another fixture
  collidePlayer(player, other, normal) {
    let data = other.getUserData();
    // If the other body is a weapon and should pass through the player, ignore it
    if (data && data.type == 'weapon') {
      if (weaponPassPlayer(player, data.obj)) return;
    }

    // Add this collision to an array in the Player object
    let thisContact = {
      fixture: other,
      normal: normal
    }

    player.contacts.push(thisContact);
    // Create particles
    collisionParticles(player, normal);
    // If the player was jumping, they have now landed
    player.landed = true;

    if (data) {
      // Spikes kill players
      if (data.spike) {
        this.queueRemovePlayer(player.id)
      }

      // Increment the player's friction counter to apply friction
      if (data.friction) {
        player.staticFriction++;
      }

      if (data.type == 'weapon') {
        // If the weapon has been thrown and is in the air,
        // Or if the weapon has hit a platform and wasn't thrown by this player
        if ((data.obj.thrown < 0 || (data.obj.thrown > 0 && data.obj.thrownBy != player.id))) {
          // The weapon hits the player
          data.obj.throwHit = player.id;
          // This player cannot equip this weapon for 60 frames (1 second)
          data.obj.hitTimer = 60;
          // The weapon is now freely equippable (by other players)
          data.obj.thrown = 0;
          // The weapon deals damage to this player
          player.damage(1);
          player.sounds.push('throwhit');
        }
      }
    }
  }

  addWeapon() {
    // Weapons drop more frequently if there are more players
    this.weaponCounter = 600 / this.players.size;

    // Randomly pick a weapon using the weight sum calculated earlier
    // This algorithm takes into account the weighted chances of each weapon dropping
    var num = Math.random() * this.weaponSpawnTotal;
    var counter = 0;
    while (num >= this.weaponSpawn[counter][1]) {
      num -= this.weaponSpawn[counter][1];
      counter++;
    }
    var chosenWeaponClass = this.weaponSpawn[counter][0];

    // Create the weapon at the designated X coordinate, slightly above the top of the screen
    var weapon = new chosenWeaponClass(this.nextWeaponX, this.height + 3, this.world, this.settings.experimental, this.weaponID);
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

  // Players cannot be removed in the middle of a physics step so sometimes they must be added to a queue
  queueRemovePlayer(playerid) {
    this.playersToRemove.push(playerid);
  }

  // Remove a player from the game (they fell off the screen, hit a spike or left the lobby)
  removePlayer(playerid) {
    var player = this.players.get(playerid);
    if (player) {
      // Remove player from the physics engine and players Map
      player.removeFromWorld(this.world);
      this.players.delete(playerid);

      // If a winner hasn't yet been decided
      if (!this.winner) {
        // Check for a winner
        if (this.players.size == 0) {
          this.inGame = false;
          // No winner chosen if no players left - it's a draw

        } else if (!this.settings.teams) {
          // Declare a winner if only one is remaining
          if (this.players.size == 1) {
            this.inGame = false;
            for (var playerid of this.players.keys()) {
              this.winner = playerid;
            }
          }

        } else {
          // Check if all remaining players are from the same team
          let teamRemaining = null;
          let onlyOneTeamLeft = true;
          for (let player of this.players.values()) {
            if (teamRemaining == null) {
              teamRemaining = player.team;
            } else if (teamRemaining != player.team) {
              onlyOneTeamLeft = false;
            }
          }

          if (onlyOneTeamLeft) {
            this.inGame = false;
            this.winner = teamRemaining;
          }
        }
      }

      // Death particles and sound
      var buffer = 1.33;
      // By default, particles shoot downwards
      var direction = 1;

      // Create death particles at the x and y coordinates of the player
      // Ensure the particles are always on screen by constraining the coordinates accordingly
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
        // If the player died at the bottom of the screen, make the particles shoot upwards
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
    // Go through the removal queue and remove the players
    for (let playerid of this.playersToRemove) {
      this.removePlayer(playerid);
    }

    // Decide where the next weapon will drop
    if (this.weaponCounter < 180 && this.nextWeaponX == null) {
      this.nextWeaponX = Math.random() * (this.width - 20) + 10;
    }

    // Add weapons into game periodically if there aren't many on screen
    if (this.weaponCounter < 0) {
      // Add the weapon
      this.addWeapon();
    } else {
      this.weaponCounter--;
    }

    // Loop through all players, weapons, bullets etc in the game

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
          col: b.reflected ? 'reflected' : 'bullet',
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

    for (var path of this.paths) {
      path.update(this.time);
    }

    // Run the physics engine and increment game time
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

    return { entities, players, nextWeapon: {
      x: this.nextWeaponX,
      time: this.weaponCounter
    } };
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
  // If this player has created collision particles recently, don't create more
  if (player.lastCollisionParticle > 0) return false;
  // If this is the first collision since the player jumped, create particles no matter what
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
  // Only create particles if this is a 'powerful landing' (see above)
  if (!isPowerfulLanding(player, normal)) return;
  var angle = Math.atan2(normal.y, normal.x);
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

// Returns true if the player-weapon collision should be ignored
function weaponPassPlayer(player, weapon) {
  // If the weapon was last thrown a while ago, don't ignore the collision
  if (weapon.passThrough == 0) return false;
  // This means the weapon has just been dropped
  // Collisions with players should be ignored when the weapon is first added to the world
  if (weapon.thrownBy == null) return true;
  // If this code is reached, the weapon has just been thrown by a player
  // Only ignore the collision if this player threw the weapon
  return weapon.thrownBy == player.id;
}

module.exports = Game;
