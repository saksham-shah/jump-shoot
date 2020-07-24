const pl = require('planck-js');
const vec = pl.Vec2;
var MapUtils = require('./map-utils.js');

var BasicGun = require('../weapons/basic-gun.js');
var MachineGun = require('../weapons/machine-gun.js');
var Sniper = require('../weapons/sniper.js');

var Platform = require('../platforms/platform.js');
var Path = require('../platforms/path.js');

var createMapFuncs = [];

function turnAndShoot(game) {
  game.width = 54;
  game.height = 36;

  // Small platform at the bottom
  var ground = new Platform(27, 0.5, 7, 1.33, game.world, { colour: 'yellow' });
  game.static.push(ground);

  // Pivoted platform
  var pivotPlat = new Platform(27, 18.5, 30, 1.33, game.world, { type: 'dynamic', density: 2.5, colour: 'orange'});
  pivotPlat.body.setAngularDamping(0.1);
  game.dynamic.push(pivotPlat);

  // Create the pivot
  game.world.createJoint(pl.RevoluteJoint({}, pivotPlat.body, ground.body, vec(27, 18.5)));

  // Spawn points
  game.spawns = [{ x: 24, y: 23 }, { x: 30, y: 23 }, { x: 18, y: 23 }, { x: 36, y: 23 }];
}

function pendulum(game) {
  game.width = 54;
  game.height = 36;

  // Ground
  var ground = new Platform(27, 3, 47, 1.33, game.world, { colour: 'blue' });
  game.static.push(ground);

  // Pendulum
  var platform = new Platform(27, 32, 1.33, 20, game.world, { type: 'dynamic', density: 4000, restitution: 1, nojump: true, colour: 'purple' });
  game.dynamic.push(platform);

  // Create the pivot
  game.world.createJoint(pl.RevoluteJoint({}, platform.body, ground.body, vec(27, 24)))

  // Spawn points
  game.spawns = [{ x: 24, y: 23 }, { x: 30, y: 23 }, { x: 18, y: 23 }, { x: 36, y: 23 }];
}

function sixPlatforms(game) {
  game.width = 54;
  game.height = 36;

  // Create the platforms

  platform = new Platform(27, 26, 10, 1.33, game.world, { colour: 'green' });
  game.static.push(platform);

  // Black death platform
  platform = new Platform(27, 16, 5, 1.33, game.world, { colour: 'spike', spike: true });
  game.static.push(platform);

  platform = new Platform(27, 6, 10, 1.33, game.world, { colour: 'green' });
  game.static.push(platform);

  platform = new Platform(7, 19.3, 7, 1.33, game.world, { colour: 'cyan' });
  game.static.push(platform);

  platform = new Platform(14, 12.7, 7, 1.33, game.world, { colour: 'cyan' });
  game.static.push(platform);

  platform = new Platform(47, 19.3, 7, 1.33, game.world, { colour: 'cyan' });
  game.static.push(platform);

  platform = new Platform(40, 12.7, 7, 1.33, game.world, { colour: 'cyan' });
  game.static.push(platform);

  // Spawn points
  game.spawns = [{ x: 14, y: 16 }, { x: 40, y: 16 }, { x: 7, y: 23 }, { x: 47, y: 23 }, { x: 27, y: 27 }, { x: 27, y: 10 }];
}

function lifts(game) {
  var platform, path;

  function addLift(x, offset, colour) {
    platform = new Platform(0, 0, 7, 1.33, game.world, { colour });
    path = new Path(platform.body, x, 29, x, 3, 10, offset);
    game.dynamic.push(platform);
    game.paths.push(path);
  }

  addLift(27, -0.25, 'green');
  addLift(19.5, 0, 'yellow');
  addLift(34.5, 0, 'yellow');
  addLift(12, 0.25, 'orange');
  addLift(42, 0.25, 'orange');
  addLift(4.5, 0.5, 'red');
  addLift(49.5, 0.5, 'red');

  // platform = new Platform(0, 0, 7, 1.33, game.world, { colour: 'green' });
  // path = new Path(platform.body, 27, 29, 27, 3, 10, -0.25);
  // game.dynamic.push(platform);
  // game.paths.push(path);

  // platform = new Platform(0, 0, 7, 1.33, game.world, { colour: 'yellow' });
  // path = new Path(platform.body, 19.5, 29, 19.5, 3, 10);
  // game.dynamic.push(platform);
  // game.paths.push(path);

  // platform = new Platform(0, 0, 7, 1.33, game.world, { colour: 'yellow' });
  // path = new Path(platform.body, 34.5, 29, 34.5, 3, 10);
  // game.dynamic.push(platform);
  // game.paths.push(path);

  // platform = new Platform(0, 0, 7, 1.33, game.world, { colour: 'orange' });
  // path = new Path(platform.body, 12, 29, 12, 3, 10, 0.25);
  // game.dynamic.push(platform);
  // game.paths.push(path);

  // platform = new Platform(0, 0, 7, 1.33, game.world, { colour: 'orange' });
  // path = new Path(platform.body, 42, 29, 42, 3, 10, 0.25);
  // game.dynamic.push(platform);
  // game.paths.push(path);

  // platform = new Platform(0, 0, 7, 1.33, game.world, { colour: 'red' });
  // path = new Path(platform.body, 4.5, 29, 4.5, 3, 10, 0.5);
  // game.dynamic.push(platform);
  // game.paths.push(path);

  // platform = new Platform(0, 0, 7, 1.33, game.world, { colour: 'red' });
  // path = new Path(platform.body, 49.5, 29, 49.5, 3, 10, 0.5);
  // game.dynamic.push(platform);
  // game.paths.push(path);

  // Spawn points
  game.spawns = [{ x: 27, y: 33 }, { x: 4.5, y: 20 }, { x: 49.5, y: 20 }, { x: 12, y: 7 }, { x: 42, y: 7 }, { x: 19.5, y: 20 }, { x: 34.5, y: 20 }];

}

function rotations(game) {
  game.width = 81;
  game.height = 54;

  // Create a body for the central rotating square
  body = game.world.createBody({
      type: 'kinematic',
      position: vec(40.5, 27),
      angularVelocity: -0.12
  });

  let platform, path;

  // Four sides of the rotating square
  platform = new Platform(0, 17, 20, 1.33, game.world, { body: body, colour: 'cyan' });
  game.dynamic.push(platform);
  platform = new Platform(0, -17, 20, 1.33, game.world, { body: body, colour: 'cyan' });
  game.dynamic.push(platform);
  platform = new Platform(17, 0, 1.33, 20, game.world, { body: body, colour: 'blue' });
  game.dynamic.push(platform);
  platform = new Platform(-17, 0, 1.33, 20, game.world, { body: body, colour: 'blue' });
  game.dynamic.push(platform);

  // Two lifts - one on each side
  platform = new Platform(0, 0, 13.3, 1.33, game.world, { colour: 'purple' });
  game.dynamic.push(platform);

  path = new Path(platform.body, 10, 7, 10, 47, 15, 0.5);
  game.paths.push(path);

  platform = new Platform(0, 0, 13.3, 1.33, game.world, { colour: 'purple' });
  game.dynamic.push(platform);

  path = new Path(platform.body, 71, 7, 70, 47, 15);
  game.paths.push(path);

  // Spawn points
  game.spawns = [{ x: 7, y: 30 }, { x: 73, y: 30 }, { x: 13, y: 30 }, { x: 67, y: 30 }];
}

function doubleSided(game) {
  game.width = 54;
  game.height = 36;

  // A stable platform in the middle
  var ground = new Platform(27, 8, 8, 1.33, game.world, { colour: 'red' });
  game.static.push(ground);

  // Booooooooooooooooooooooooo
  function createSwivel(x, y) {
    // Create the body of the swivel platform
    var body = game.world.createBody({
      type: 'dynamic',
      position: vec(x, y),
      allowSleep: false
    });
    body.setAngularDamping(0.2);

    // Create the pivot
    game.world.createJoint(pl.RevoluteJoint({}, body, ground.body, vec(x, y + 0.0)));

    // Add the two sides of the platform - one side is a spike
    var platform = new Platform(0, 0.5, 8, 1, game.world, { body: body, density: 10, colour: 'orange' });
    game.dynamic.push(platform);
    platform = new Platform(0, -0.5, 8, 1, game.world, { body: body, density: 10, spike: true, colour: 'spike' });
    game.dynamic.push(platform);
  }

  createSwivel(37, 15);
  createSwivel(17, 15);
  createSwivel(47, 15);
  createSwivel(7, 15);
  createSwivel(27, 28);

  // Two small platforms, one on each side
  ground = new Platform(2, 22, 4, 1.33, game.world, { colour: 'yellow' });
  game.static.push(ground);
  ground = new Platform(52, 22, 4, 1.33, game.world, { colour: 'yellow' });
  game.static.push(ground);

  // Spawn points
  game.spawns = [{ x: 17, y: 19 }, { x: 37, y: 19 }, { x: 7, y: 19 }, { x: 47, y: 19 }];//, { x: 12, y: 26 }, { x: 42, y: 26 }];
}

createMapFuncs.push(turnAndShoot);
createMapFuncs.push(pendulum);
createMapFuncs.push(sixPlatforms);
createMapFuncs.push(lifts);
createMapFuncs.push(rotations);
createMapFuncs.push(doubleSided);

module.exports = createMapFuncs;
