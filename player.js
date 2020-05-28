const pl = require('planck-js');
const vec = pl.Vec2;
const MASSDECAY = 0.933;

// Wrapper class for a planck.js body
// Handles player actions based on controls
class Player {
  constructor(x, y, id, colour, world, experimental) {
    this.id = id;
    this.colour = colour;

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
      density: 1,
      userData: {
        label: this.id,
        type: 'player',
        obj: this
      }
    })

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

    if (this.weapon) {
      // Cool weapon gun so it can shoot
      this.weapon.coolGun();
    }
    this.cooldown++;

    this.lastShot.timeAgo++;

    this.lastCollisionParticle --;

    // Point the gun towards its target
    // mouseVel is used to make the movement smooth and natural

    var desired = this.mouseAngle - this.angle;
    var diff = desired - this.angleVel;
    var direction = 1;
    // Normalise the angle 'diff'
    diff = diff - 2 * Math.PI * Math.floor((diff + Math.PI) / 2 / Math.PI);
    if (diff < 0) {
      direction = -1;
    }
    diff = Math.min(Math.abs(diff), 0.15) * direction;
    direction = 1;
    this.angleVel += diff;
    if (this.angleVel < 0) {
      direction = -1;
    }
    this.angleVel = Math.min(Math.abs(this.angleVel), 0.5) * direction;
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
    if (this.controls.throw && this.weapon && !this.previousControls.throw) {
      this.weapon.thrown = -1;
      this.weapon.throwHit = false;
      this.throwWeapon(this.experimental ? 5000 : 2000, world);
    }
    this.previousControls.throw = this.controls.throw;

    // Activate shield
    if (this.controls.shield && this.weapon == null && this.cooldown >= 10) {
      this.shield = true;
      this.shieldWidth -= 0.015
    } else {
      this.shield = false;
      this.shieldWidth += 0.00375;
    }
    // Limit the shield's size to a maximum and minimum
    if (this.shieldWidth < 0.67) {
      this.shieldWidth = 0.67;
    } else if (this.shieldWidth > 3) {
      this.shieldWidth = 3;
    }

    // Return bullets if shot, otherwise null
    return bullets;
  }

  // Finds and returns nearby weapons (player must be nearly touching the weapons to pick up)
  checkForWeapons(weapons) {
    for (var i = 0; i < weapons.length; i++) {
      if (!weapons[i].equipped && weapons[i].thrown == 0) {
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

  // Equip a weapon
  equipWeapon(weapon, world) {
    this.weapon = weapon;
    this.weapon.getEquipped(world);
    // Can't throw the weapon immediately after equipping it
    // Prevents accidental throwing if the throw key is pressed when equipping
    // this.cooldown = 0;
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
        this.body.applyForceToCenter(vec(fx, fy));
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
    // Weapon starts slightly away from the player to avoid collision with the player
    var x = pos.x + (this.r + this.weapon.w * 1.1) * Math.cos(this.angle);
    var y = pos.y + (this.r + this.weapon.w * 1.1) * Math.sin(this.angle);
    this.weapon.getUnequipped(x, y, this.angle, world);
    this.weapon.throw(this.experimental ? vec(0, 0) : this.body.getLinearVelocity(), force, this.angle, world);
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
      this.body.applyForceToCenter(vec(-75 * mass, 0));
    }

    if (this.controls.right) {
      this.body.applyForceToCenter(vec(75 * mass, 0));
    }

    if (this.controls.up) {
      let jumped = false;
      for (let contact of this.contacts) {
        let data = contact.fixture.getUserData();
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
            // this.lastCollisionParticle = 0;
            this.landed = false;
          }
        }
      }

      // Also makes the player fall slower
      this.body.applyForceToCenter(vec(0, 30 * mass));
    }
    // Makes the player fall faster
    if (this.controls.down) {
      this.body.applyForceToCenter(vec(0, -30 * mass));
    }
    // Experimental bouncy feature - really isn't needed but I can't get myself to remove it
    // if (this.controls.bouncy) {
    //   this.body.restitution = 1.3
    // } else {
    //   this.body.restitution = 1;
    // }
  }

  damage(dmg) {
    var newDensity = this.fixture.getDensity() * Math.pow(MASSDECAY, dmg);
    this.fixture.setDensity(newDensity);
    this.body.resetMassData();
  }

  removeFromWorld(world) {
    // Must throw weapon before being removed
    if (this.weapon) {
      this.throwWeapon(0, world);
    }

    world.destroyBody(this.body);
  }

  toObject(users) {
    var pos = this.body.getPosition();
    var weaponToObj = null;
    // Also add equipped weapon to the data being sent
    if (this.weapon) {
      weaponToObj = this.weapon.toObject();
    }
    var name = users.get(this.id).name;
    return {
      type: 'player',
      id: this.id,
      x: pos.x,
      y: pos.y,
      r: this.r,
      angle: this.angle,
      shield: this.shield,
      shieldWidth: this.shieldWidth,
      name: name,
      colour: this.colour,
      weapon: weaponToObj
    }
  }
}

module.exports = Player;
