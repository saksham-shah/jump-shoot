var Matter = require('matter-js');
// var Circle = require('./circle.js');

class Player {
  constructor(x, y, id, colour, engine) {
    // this.physShape = new Circle(x, y, 15, engine);
    this.id = id;
    this.colour = colour;

    this.r = 15;
    var options = {
      restitution: 1.3,
      friction: 0.5,
      frictionAir: 0.02,
      density: 0.03,
      label: this.id
    }
    this.body = Matter.Bodies.circle(x, y, this.r, options);

    Matter.World.add(engine.world, this.body);
    // Matter.Body.setDensity(this.physShape.body, 0.03);
    // this.physShape.body.label = this.id;
    //this.jump = 0;
    this.canJump = false;
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

    this.mouseAngle = 0;
    this.angle = 0;
    this.angleVel = 0;

    this.weapon = null;
    this.cooldown = 0;
  }

  mouseUpdate(mPos) {
    var pos = this.body.position;
    var dx = mPos.x - pos.x;
    var dy = mPos.y - pos.y;
    this.mouseAngle = Math.atan2(dy, dx);
  }

  update(weapons, engine) {
    if (this.weapon) {
      this.weapon.coolGun();
    }
    if (this.cooldown > 0) {
      this.cooldown--;
    }

    var desired = this.mouseAngle - this.angle;

    //reqForce = Math.min(reqForce, 0.2) * direction;
    var diff = desired - this.angleVel;

    //diff = diff % (2 * Math.PI);
    var direction = 1;

    diff = diff - 2 * Math.PI * Math.floor((diff + Math.PI) / 2 / Math.PI);
    if (diff < 0) {
      direction = -1;
    }
    diff = Math.min(Math.abs(diff), 0.15) * direction;
    //console.log(diff);
    direction = 1;
    this.angleVel += diff;
    if (this.angleVel < 0) {
      direction = -1;
    }
    this.angleVel = Math.min(Math.abs(this.angleVel), 0.5) * direction;

    //this.angleVel = 0.2;

    this.angle = (this.angle + this.angleVel) % (2 * Math.PI);//this.angleVel;

    this.updateControls();

    var bullet = null;
    if (this.controls.shoot) {
      bullet = this.shoot();
    }

    if (this.controls.equip && this.weapon == null && this.cooldown <= 0) {
      var w = this.checkForWeapons(weapons);
      if (w) {
        this.equipWeapon(w, engine);
      }
    }

    if (this.controls.throw && this.weapon && this.cooldown <= 0) {
      this.throwWeapon(0.04, engine);
    }

    return bullet;

  }

  checkForWeapons(weapons) {
    for (var i = 0; i < weapons.length; i++) {
      if (!weapons[i].equipped) {
        var weapon = weapons[i];
        var wPos = weapon.body.position;
        var pPos = this.body.position
        var maxD = Math.sqrt(Math.pow(weapon.w * 0.5, 2) + Math.pow(weapon.h * 0.5, 2)) + this.r + 10;
        var actualD = Math.sqrt(Math.pow(pPos.x - wPos.x, 2) + Math.pow(pPos.y - wPos.y, 2));
        if (actualD < maxD) {
          return weapon;
        }
      }
    }
    return null;
  }

  equipWeapon(weapon, engine) {
    this.weapon = weapon;
    this.weapon.getEquipped(engine);
    this.cooldown = 20;
  }

  shoot() {
    if (this.weapon) {
      // NOTE: for some reason the angle vel is working in the opposite direction
      // console.log("shoot!");
      // if (Math.abs(this.angle) < Math.PI * 0.5) {
      //   this.angleVel = -2;
      //   // console.log("right");
      // } else {
      //   this.angleVel = 2;
      // }
      //
      // this.shootCool = 20;
      var result = this.weapon.shoot(this.body.position.x, this.body.position.y, this.angle, this.id);
      if (result.shot) {
        if (Math.abs(this.angle) < Math.PI * 0.5) {
          this.angleVel -= result.angleChange;
        } else {
          this.angleVel += result.angleChange;
        }
        var recoilAngle = this.angle + Math.PI;
        Matter.Body.applyForce(this.body, this.body.position, {
          x: result.recoil * Math.cos(recoilAngle),
          y: result.recoil * Math.sin(recoilAngle)
        });
        return result.bullet;
      }
      return null;
    }
  }

  throwWeapon(force, engine) {
    var pos = this.body.position;
    var angle = this.angle;
    var x = pos.x + (this.r + this.weapon.w * 1.1) * Math.cos(this.angle);
    var y = pos.y + (this.r + this.weapon.w * 1.1) * Math.sin(this.angle);
    this.weapon.getUnequipped(x, y, this.angle, engine);
    this.weapon.throw(this.body.velocity, force, this.angle, engine);
    this.weapon = null;
    this.cooldown = 20;
  }

  updateControls() {
    var body = this.body;
    if (this.controls.left) {
      //body.force.x -= 0.001 * body.mass;
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
        //console.log("jump attempt")
        var vx = body.velocity.x;
        //var vy = Math.min(0, body.velocity.y)
        Matter.Body.setVelocity(body, { x: vx, y: -8 });
        //console.log(body.velocity);
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
    if (this.controls.bouncy) {
      this.body.restitution = 1.3
    } else {
      this.body.restitution = 1;
    }
  }

  removeFromWorld(engine) {
    Matter.World.remove(engine.world, this.body);
    if (this.weapon) {
      this.throwWeapon(0, engine);
    }
  }

  toObject() {
    var pos = this.body.position;
    var weaponToObj = null;
    if (this.weapon) {
      weaponToObj = this.weapon.toObject();
    }
    return {
      type: 'player',
      x: pos.x,
      y: pos.y,
      r: this.r,
      angle: this.angle,
      colour: this.colour,
      weapon: weaponToObj
    }
  }

  // show() {
  //   this.show(200);
  // }
}

module.exports = Player;
