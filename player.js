var Matter = require('matter-js');

// Wrapper class for a Matter.js body
// Handles player actions based on controls
class Player {
  constructor(x, y, id, colour, engine) {
    this.id = id;
    this.colour = colour;

    this.r = 15;
    // Arbitrary numbers
    var options = {
      restitution: 1.3,
      friction: 0.5,
      frictionAir: 0.02,
      density: 0.03,
      label: this.id // Used to identify players in collision events
    }
    this.body = Matter.Bodies.circle(x, y, this.r, options);

    // Add the body to the physics world
    Matter.World.add(engine.world, this.body);

    // Whether the player can currently jump (e.g. if they are on a platform)
    this.canJump = false;

    // Holds status of all key presses
    this.controls = {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      equip: false,
      throw: false,
      bouncy: false
    }

    // Control gun aiming
    this.mouseAngle = 0;
    this.angle = 0;
    this.angleVel = 0;

    // Stores weapon if equipped
    this.weapon = null;
    // Prevents weapon from instantly being reequiped when thrown
    this.cooldown = 0;
  }

  // Aim at the mouse position
  mouseUpdate(mPos) {
    var pos = this.body.position;
    var dx = mPos.x - pos.x;
    var dy = mPos.y - pos.y;
    this.mouseAngle = Math.atan2(dy, dx);
  }

  update(weapons, engine) {
    if (this.weapon) {
      // Cool weapon gun so it can shoot
      this.weapon.coolGun();
    }
    if (this.cooldown > 0) {
      this.cooldown--;
    }

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

    this.updateControls();

    // Shoot bullets
    var bullet = null;
    if (this.controls.shoot) {
      bullet = this.shoot();
    }

    // Pick up weapons
    if (this.weapon == null && this.cooldown <= 0) {
      var w = this.checkForWeapons(weapons);
      if (w) {
        // Equip weapon if there is one nearby
        this.equipWeapon(w, engine);
      }
    }

    // Throw equipped weapon
    if (this.controls.throw && this.weapon && this.cooldown <= 0) {
      this.throwWeapon(0.04, engine);
    }

    // Return a bullet if shot, otherwise null
    return bullet;

  }

  // Finds and returns nearby weapons (player must be nearly touching the weapons to pick up)
  checkForWeapons(weapons) {
    for (var i = 0; i < weapons.length; i++) {
      if (!weapons[i].equipped) {
        var weapon = weapons[i];
        var wPos = weapon.body.position;
        var pPos = this.body.position
        // Max distance from a weapon while still touching it is the player's radius + the weapon's diagonal
        // Buffer of 10 pixels added
        var maxD = Math.sqrt(Math.pow(weapon.w * 0.5, 2) + Math.pow(weapon.h * 0.5, 2)) + this.r + 10;
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
  equipWeapon(weapon, engine) {
    this.weapon = weapon;
    this.weapon.getEquipped(engine);
    // Can't throw the weapon for 20 frames
    // Prevents accidental throwing if the throw key is pressed when equipping
    this.cooldown = 20;
  }

  // Fire a weapon
  shoot() {
    // Only runs if a weapon is equipped
    if (this.weapon) {
      var result = this.weapon.shoot(this.body.position.x, this.body.position.y, this.angle, this.id);
      // If a shot was actually fired
      if (result.shot) {
        // Apply recoil to the gun - direction of recoil is always upwards
        if (Math.abs(this.angle) < Math.PI * 0.5) {
          this.angleVel -= result.angleChange;
        } else {
          this.angleVel += result.angleChange;
        }
        // Apply recoil to the player
        var recoilAngle = this.angle + Math.PI;
        Matter.Body.applyForce(this.body, this.body.position, {
          x: result.recoil * Math.cos(recoilAngle),
          y: result.recoil * Math.sin(recoilAngle)
        });
        // Return the bullet so it is added to the game
        return result.bullet;
      }
      return null;
    }
  }

  // Throw the currently equipped weapon
  throwWeapon(force, engine) {
    var pos = this.body.position;
    var angle = this.angle;
    // Weapon starts slightly away from the player to avoid collision with the player
    var x = pos.x + (this.r + this.weapon.w * 1.1) * Math.cos(this.angle);
    var y = pos.y + (this.r + this.weapon.w * 1.1) * Math.sin(this.angle);
    this.weapon.getUnequipped(x, y, this.angle, engine);
    this.weapon.throw(this.body.velocity, force, this.angle, engine);
    this.weapon = null;
    // Can't equip a weapon for 20 frames
    // Prevents picking up a weapon immediately after throwing it
    this.cooldown = 20;
  }

  // Checks if the player is out of the game boundaries
  isOutOfBounds(b) {
    var pos = this.body.position;
    if (b.top) {
      if (pos.y < b.top) {
        return true;
      }
    }
    if (b.bottom) {
      if (pos.y > b.bottom) {
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
    var body = this.body;
    if (this.controls.left) {
      Matter.Body.applyForce(body, body.position, {
        x: -0.001 * body.mass,
        y: 0
      })
    }
    if (this.controls.right) {
      Matter.Body.applyForce(body, body.position, {
        x: 0.001 * body.mass,
        y: 0
      });
    }
    if (this.controls.up) {
      if (this.canJump) {
        var vx = body.velocity.x;
        Matter.Body.setVelocity(body, { x: vx, y: -8 });
      }
      Matter.Body.applyForce(body, body.position, {
        x: 0,
        y: -0.0005 * body.mass
      });
    }
    if (this.controls.down) {
      Matter.Body.applyForce(body, body.position, {
        x: 0,
        y: 0.0005 * body.mass
      });
    }
    // Experimental bouncy feature
    if (this.controls.bouncy) {
      this.body.restitution = 1.3
    } else {
      this.body.restitution = 1;
    }
  }

  removeFromWorld(engine) {
    Matter.World.remove(engine.world, this.body);
    // Must throw weapon before being removed
    if (this.weapon) {
      this.throwWeapon(0, engine);
    }
  }

  toObject(users) {
    var pos = this.body.position;
    var weaponToObj = null;
    // Also add equipped weapon to the data being sent
    if (this.weapon) {
      weaponToObj = this.weapon.toObject();
    }
    var name = users.get(this.id).name;
    return {
      type: 'player',
      x: pos.x,
      y: pos.y,
      r: this.r,
      angle: this.angle,
      name: name,
      colour: this.colour,
      weapon: weaponToObj
    }
  }
}

module.exports = Player;
