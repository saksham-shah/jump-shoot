const pl = require('planck-js');
const vec = pl.Vec2;
const MASSDECAY = 0.933;

// Wrapper class for a planck.js body
// Handles player actions based on controls
class Player {
  constructor(x, y, id, colour, team, mass, world, experimental) {
    this.id = id;
    this.colour = colour;
    this.team = team;

    this.experimental = experimental;

    this.r = 1;

    this.body = world.createBody({
      type: 'dynamic',
      position: vec(x, y),
      allowSleep: false,
      bullet: true
    });

    this.fixture = this.body.createFixture({
      shape: pl.Circle(this.r),
      friction: 0.5,
      restitution: 0.4,
      density: mass,
      userData: {
        label: this.id,
        type: 'player',
        obj: this
      }
    })

    this.mass = mass;

    this.contacts = [];
    this.staticFriction = 0;

    // Holds status of all key presses
    this.controls = {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      equip: false,
      throw: false,
      shield: false,
      bouncy: false
    }
    this.previousControls = {
      throw: false
    }

    // Control gun aiming
    this.mouseAngle = 0;
    this.angle = 0;
    this.angleVel = 0;

    // Stores weapon if equipped
    this.weapon = null;
    // Prevents weapon from instantly being reequiped when thrown
    this.cooldown = 0;

    this.shieldWidth = 3;

    this.lastShot = {
      timeAgo: 0,
      player: null
    }

    this.particles = [];
    this.sounds = [];
    this.lastCollisionParticle = 0;
    this.landed = false;
  }

  // Aim at the mouse position
  mouseUpdate(mPos) {
    if (!mPos || typeof mPos.x != 'number' || typeof mPos.y != 'number') return;
    var pos = this.body.getPosition();
    var dx = mPos.x - pos.x;
    var dy = mPos.y - pos.y;
    this.mouseAngle = Math.atan2(dy, dx);
  }

  update(weapons, world) {
    // Apply friction
    let friction = 0.98;
    if (this.staticFriction > 0) {
      friction = 0.95;
    }

    let vel = this.body.getLinearVelocity();
    let newVel = vec(vel.x * friction, vel.y * friction);
    this.body.setLinearVelocity(newVel);

    // if (this.weapon) {
    //   // Cool weapon gun so it can shoot
    //   this.weapon.coolGun();
    // }

    // Increment timer properties
    this.cooldown++;

    this.lastShot.timeAgo++;

    this.lastCollisionParticle --;

    // Point the gun towards its target
    // mouseVel is used to make the movement smooth and natural
    // Similar algorithm to steering

    var desired = this.mouseAngle - this.angle;
    var diff = desired - this.angleVel;
    var direction = 1;
    // Normalise the angle 'diff'
    diff = diff - 2 * Math.PI * Math.floor((diff + Math.PI) / 2 / Math.PI);
    if (diff < 0) {
      direction = -1;
    }

    // Limit the acceleration of the angle to 0.15 rad
    diff = Math.min(Math.abs(diff), 0.15) * direction;
    direction = 1;
    this.angleVel += diff;
    if (this.angleVel < 0) {
      direction = -1;
    }

    // Limit the velocity of the angle to 0.5 rad
    this.angleVel = Math.min(Math.abs(this.angleVel), 0.5) * direction;
    // Apply the velocity to the angle
    this.angle = (this.angle + this.angleVel) % (2 * Math.PI);

    // Make the player move around
    this.updateControls();

    // Shoot bullets
    var bullets = null;
    if (this.controls.shoot) {
      bullets = this.shoot();
    }

    // Pick up weapons
    if (this.weapon == null && this.cooldown >= 20) {
      var w = this.checkForWeapons(weapons);
      if (w) {
        // Equip weapon if there is one nearby
        this.equipWeapon(w, world);
      }
    }

    // Throw equipped weapon
    // (only throw if the throw control is just clicked - not held)
    if (this.controls.throw && this.weapon && !this.previousControls.throw) {
      // Set the throwing properties of the weapon
      // Weapon has just been thrown
      this.weapon.thrown = -1;
      // Weapon hasn't hit anyone
      this.weapon.throwHit = null;
      // Weapon has been thrown by this player
      this.weapon.thrownBy = this.id;
      // For 5 frames, the weapon will not collide with this player
      this.weapon.passThrough = 5;

      // Throw the actual weapon
      this.throwWeapon(5000, world);
    }
    this.previousControls.throw = this.controls.throw;

    // Activate shield
    if (this.controls.shield && this.weapon == null && this.cooldown >= 10) {
      this.shield = true;
      this.addToShield(this.experimental ? -0.024 : -0.015)
    } else {
      this.shield = false;
      this.addToShield(this.experimental ? 0.004 : 0.00375);
    }

    // Return bullets if shot, otherwise null
    return bullets;
  }

  // Finds and returns nearby weapons (player must be nearly touching the weapons to pick up)
  checkForWeapons(weapons) {
    // Loop through all the weapons and check if any are equippable and close enough to equip
    for (var i = 0; i < weapons.length; i++) {
      if (this.weaponIsEquippable(weapons[i])) {
        var weapon = weapons[i];
        var wPos = weapon.body.getPosition();
        var pPos = this.body.getPosition();
        // Max distance from a weapon while still touching it is the player's radius + the weapon's diagonal
        // Buffer of 10 pixels added
        var maxD = Math.sqrt(Math.pow(weapon.w * 0.5, 2) + Math.pow(weapon.h * 0.5, 2)) + this.r + 0.67;
        var actualD = Math.sqrt(Math.pow(pPos.x - wPos.x, 2) + Math.pow(pPos.y - wPos.y, 2));
        // Return the weapon if close enough
        if (actualD < maxD) {
          return weapon;
        }
      }
    }
    return null;
  }

  weaponIsEquippable(weapon) {
    // If the weapon is already equipped, it isn't equippable
    if (weapon.equipped) return false;
    // If the weapon has recently been thrown, it isn't equippable
    if (weapon.thrown != 0) return false;
    // If the weapon hit someone long enough ago,
    // or it didn't hit anyone,
    // or it hit someone else,
    // it IS equippable
    return weapon.hitTimer == 0 || !weapon.throwHit || weapon.throwHit != this.id;
  }

  // Equip a weapon
  equipWeapon(weapon, world) {
    this.weapon = weapon;
    this.weapon.getEquipped(world);
  }

  // Fire a weapon
  shoot() {
    // Only runs if a weapon is equipped
    if (this.weapon) {
      let pos = this.body.getPosition();
      var result = this.weapon.shoot(pos.x, pos.y, this.angle, this.id);
      // If a shot was actually fired
      if (result.shot) {
        // Apply recoil to the gun - direction of recoil is always upwards
        if (Math.abs(this.angle) > Math.PI * 0.5) {
          this.angleVel -= result.angleChange;
        } else {
          this.angleVel += result.angleChange;
        }
        // Apply recoil to the player
        var recoilAngle = this.angle + Math.PI;
        let fx = result.recoil * Math.cos(recoilAngle);
        let fy = result.recoil * Math.sin(recoilAngle);
        this.body.applyForceToCenter(vec(fx, fy), true);
        // Return the bullets so they are added to the game
        return result.bullets;
      }
    }
    return null;
  }

  // Throw the currently equipped weapon
  throwWeapon(force, world) {
    var pos = this.body.getPosition();
    var angle = this.angle;
    // Weapon starts at the circumference of the player
    var x = pos.x + this.r * Math.cos(this.angle);
    var y = pos.y + this.r * Math.sin(this.angle);
    // Unequip the weapon and apply the throwing force to it
    this.weapon.getUnequipped(x, y, this.angle, world);
    this.weapon.throw(vec(0, 0), force, this.angle, world);
    this.weapon = null;
    // Prevents picking up a weapon immediately after throwing it
    this.cooldown = 0;
  }

  // Checks if the player is out of the game boundaries
  isOutOfBounds(b) {
    var pos = this.body.getPosition();
    if (b.top) {
      if (pos.y > b.top) {
        return true;
      }
    }
    if (b.bottom) { // Used most often
      if (pos.y < b.bottom) {
        return true;
      }
    }
    if (b.left) {
      if (pos.x < b.left) {
        return true;
      }
    }
    if (b.right) {
      if (pos.x > b.right) {
        return true;
      }
    }
    return false;
  }

  // Moves player by applying forces based on which controls are pressed
  updateControls() {
    let mass = this.body.getMass();
    // Move the player left and right
    if (this.controls.left) {
      this.body.applyForceToCenter(vec(-75 * mass, 0), true);
    }

    if (this.controls.right) {
      this.body.applyForceToCenter(vec(75 * mass, 0)), true;
    }

    if (this.controls.up) {
      // Jump!
      let jumped = false;
      for (let contact of this.contacts) {
        let data = contact.fixture.getUserData();
        // If the player hasn't already jumped this frame and this fixture can be jumped on
        if (!jumped && (!data || !data.nojump)) {
          var n = contact.normal;
          var nAng = Math.atan2(n.y, n.x);
          // Can only jump at certain angles
          // E.g. can't jump if you are touching a platform from below
          if (nAng <= -Math.PI * 5/6 || nAng >= -Math.PI / 6) {
            // Calculate the magnitude and angle of current velocity
            var v = this.body.getLinearVelocity();
            var vMag = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
            var vAng = Math.atan2(v.y, v.x);

            // Resolve velocity into components parallel and perperdicular to the normal of the collision
            // Parallel to the normal of the collision is the direction of the jump
            // Parallel velocity will be set to 8 (arbitrary)
            // Perperdicular velocity will be unchanged
            var jumpForce = 30;
            var angle = vAng - nAng;
            var parallelV = jumpForce;
            var perpV = vMag * Math.sin(angle);

            // Calculate the magnitude and angle of the new velocity post-jump
            var newVMag = Math.sqrt(Math.pow(parallelV, 2) + Math.pow(perpV, 2));
            var newVAng = Math.atan2(perpV, parallelV) + nAng;

            // Resolve new velocity into x and y components (as that is how they are stored in Matter.js)
            var vx = newVMag * Math.cos(newVAng);
            var vy = newVMag * Math.sin(newVAng);

            // Jumps will always make the player go upwards
            if (vy < jumpForce * 0.75) {
              vy = jumpForce * 0.75;
            }

            this.body.setLinearVelocity(vec(vx, vy));
            jumped = true;
            this.landed = false;
          }
        }
      }

      // Also makes the player fall slower
      this.body.applyForceToCenter(vec(0, 30 * mass), true);
    }
    // Makes the player fall faster
    if (this.controls.down) {
      this.body.applyForceToCenter(vec(0, -30 * mass), true);
    }
  }

  // Make the player lighter when they are hit by a bullet
  damage(dmg) {
    // Damage is exponential
    var newDensity = this.fixture.getDensity() * Math.pow(MASSDECAY, dmg);
    this.mass = newDensity;
    this.fixture.setDensity(newDensity);
    this.body.resetMassData();
  }

  // Make the shield shrink or grow
  addToShield(w) {
    this.shieldWidth += w;

    // Limit the size of the shield between 0.6 and 3
    if (this.shieldWidth < (this.experimental ? 0.6 : 0.67)) {
      this.shieldWidth = this.experimental ? 0.6 : 0.67;
    } else if (this.shieldWidth > 3) {
      this.shieldWidth = 3;
    }
  }

  // Remove the player from the physics engine (when they die)
  removeFromWorld(world) {
    // Must throw weapon before being removed
    if (this.weapon) {
      this.throwWeapon(0, world);
    }

    world.destroyBody(this.body);
  }

  toObject() {
    var pos = this.body.getPosition();
    var weaponToObj = null;
    // Also add equipped weapon to the data being sent
    if (this.weapon) {
      weaponToObj = this.weapon.toObject();
    }
    let mass = Math.round(this.mass * 100);
    return {
      type: 'player',
      id: this.id,
      x: pos.x,
      y: pos.y,
      r: this.r,
      angle: this.angle,
      shield: this.shield,
      shieldWidth: this.shieldWidth,
      stat: mass < 5 ? '<5' : mass,
      colour: this.colour,
      weapon: weaponToObj
    }
  }
}

module.exports = Player;
