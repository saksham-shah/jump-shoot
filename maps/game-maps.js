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
  // game.bulletBounce = true;

  // var pivotPlat = MapUtils.pivotPlatform(game.width * 0.5, game.height * 0.5, 450, 20, { density: 0.02, frictionAir: 0.001 }, game.engine);
  // game.dynamic.push(pivotPlat);

  var ground = new Platform(27, 0.5, 7, 1.33, game.world, { colour: 'yellow' });
  // var ground = MapUtils.staticPlatform(game.width * 0.5, game.height, 100, 20, game.engine, {}, 'yellow');
  game.static.push(ground);

  var pivotPlat = new Platform(27, 18.5, 30, 1.33, game.world, { type: 'dynamic', density: 2.5, colour: 'orange'});
  pivotPlat.body.setAngularDamping(0.1);
  // var pivotPlat = MapUtils.rectPlatform(game.width * 0.5, game.height * 0.5, 450, 20, game.engine, { density: 0.02, frictionAir: 0.001 }, 'orange');
  game.dynamic.push(pivotPlat);
  game.world.createJoint(pl.RevoluteJoint({}, pivotPlat.body, ground.body, vec(27, 18.5)));
  // MapUtils.addPivot(pivotPlat.body, game.engine);

  // Game boundary
  // game.deathBounds = {
  //   bottom: game.height + 50
  // }

  // Weapons
  game.weaponSpawn = [
    [BasicGun, 1],
    [MachineGun, 1],
    [Sniper, 1]
  ]

  // Spawn points
  game.spawns = [{ x: 24, y: 23 }, { x: 30, y: 23 }, { x: 18, y: 23 }, { x: 36, y: 23 }];
  // game.spawns = [{ x: 350, y: 200 }, { x: 450, y: 200 }, { x: 250, y: 200 }, { x: 550, y: 200 }];
}

function superBasic(game) {
  game.width = 54;
  game.height = 36;

  // var ground = MapUtils.staticPlatform(game.width * 0.5, game.height - 50, game.width - 100, 20, game.engine, {}, 'blue');
  // game.static.push(ground);

  var ground = new Platform(27, 3, 47, 1.33, game.world, { colour: 'blue' });
  game.static.push(ground);

  var platform = new Platform(27, 32, 1.33, 20, game.world, { type: 'dynamic', density: 4000, restitution: 1, nojump: true, colour: 'purple' });
  game.dynamic.push(platform);
  game.world.createJoint(pl.RevoluteJoint({}, platform.body, ground.body, vec(27, 24)))

  // var pendulum = MapUtils.pivotPlatform(game.width * 0.5, 60, 20, 300, { density: 100, frictionAir: 0, restitution: 1, label: 'nojump' }, game.engine, 0, 120);
  // game.dynamic.push(pendulum);
  // var pendulum = MapUtils.rectPlatform(game.width * 0.5, 60, 20, 300, game.engine, { density: 100, frictionAir: 0, restitution: 1, label: 'nojump' }, 'purple');
  // game.dynamic.push(pendulum);
  // MapUtils.addPivot(pendulum.body, game.engine, 0, 120);

  // Weapons
  game.weaponSpawn = [
    [BasicGun, 1],
    [MachineGun, 1],
    [Sniper, 1]
  ]

  // Game boundary
  // game.deathBounds = {
  //   bottom: game.height + 50
  // }

  // Spawn points
  game.spawns = [{ x: 24, y: 23 }, { x: 30, y: 23 }, { x: 18, y: 23 }, { x: 36, y: 23 }];
}

function sixPlatforms(game) {
  game.width = 54;
  game.height = 36;

  platform = new Platform(27, 26, 10, 1.33, game.world, { colour: 'green' });
  // platform = MapUtils.staticPlatform(400, 150, 150, 20, game.engine, {}, 'green');
  game.static.push(platform);

  platform = new Platform(27, 16, 5, 1.33, game.world, { colour: 'spike', spike: true });
  // platform = MapUtils.staticPlatform(400, 300, 75, 20, game.engine, { label: 'spike' }, 'spike');
  game.static.push(platform);

  platform = new Platform(27, 6, 10, 1.33, game.world, { colour: 'green' });
  // platform = MapUtils.staticPlatform(400, 450, 150, 20, game.engine, {}, 'green');
  game.static.push(platform);

  platform = new Platform(7, 19.3, 7, 1.33, game.world, { colour: 'cyan' });
  // platform = MapUtils.staticPlatform(100, 250, 100, 20, game.engine, {}, 'cyan');
  game.static.push(platform);

  platform = new Platform(14, 12.7, 7, 1.33, game.world, { colour: 'cyan' });
  // platform = MapUtils.staticPlatform(200, 350, 100, 20, game.engine, {}, 'cyan');
  game.static.push(platform);

  platform = new Platform(47, 19.3, 7, 1.33, game.world, { colour: 'cyan' });
  // platform = MapUtils.staticPlatform(700, 250, 100, 20, game.engine, {}, 'cyan');
  game.static.push(platform);

  platform = new Platform(40, 12.7, 7, 1.33, game.world, { colour: 'cyan' });
  // platform = MapUtils.staticPlatform(600, 350, 100, 20, game.engine, {}, 'cyan');
  game.static.push(platform);

  // Weapons
  game.weaponSpawn = [
    [BasicGun, 1],
    [MachineGun, 1],
    [Sniper, 1]
  ]

  // Game boundary
  // game.deathBounds = {
  //   bottom: game.height + 50
  // }

  // Spawn points
  game.spawns = [{ x: 14, y: 16 }, { x: 40, y: 16 }, { x: 7, y: 23 }, { x: 47, y: 23 }, { x: 27, y: 27 }, { x: 27, y: 10 }];
  // game.spawns = [{ x: 200, y: 300 }, { x: 600, y: 300 }, { x: 100, y: 200 }, { x: 700, y: 200 }, { x: 400, y: 100 }, { x: 400, y: 400 }];
}

function lifts(game) {
  var platform, path;

  platform = new Platform(0, 0, 7, 1.33, game.world, { colour: 'green' });
  path = new Path(platform.body, 27, 29, 27, 3, 10, -0.25);
  // platform = MapUtils.staticPlatform(0, 0, 100, 20, game.engine, {}, 'green');
  // path = MapUtils.addPath(platform.body, 400, 100, 400, 500, 10000, -0.25);
  game.dynamic.push(platform);
  game.paths.push(path);

  platform = new Platform(0, 0, 7, 1.33, game.world, { colour: 'yellow' });
  path = new Path(platform.body, 19.5, 29, 19.5, 3, 10);
  // platform = MapUtils.staticPlatform(0, 0, 100, 20, game.engine, {}, 'yellow');
  // path = MapUtils.addPath(platform.body, 290, 100, 290, 500, 10000);
  game.dynamic.push(platform);
  game.paths.push(path);

  platform = new Platform(0, 0, 7, 1.33, game.world, { colour: 'yellow' });
  path = new Path(platform.body, 34.5, 29, 34.5, 3, 10);
  // platform = MapUtils.staticPlatform(0, 0, 100, 20, game.engine, {}, 'yellow');
  // path = MapUtils.addPath(platform.body, 510, 100, 510, 500, 10000);
  game.dynamic.push(platform);
  game.paths.push(path);

  platform = new Platform(0, 0, 7, 1.33, game.world, { colour: 'orange' });
  path = new Path(platform.body, 12, 29, 12, 3, 10, 0.25);
  // platform = MapUtils.staticPlatform(0, 0, 100, 20, game.engine, {}, 'orange');
  // path = MapUtils.addPath(platform.body, 180, 100, 180, 500, 10000, 0.25);
  game.dynamic.push(platform);
  game.paths.push(path);

  platform = new Platform(0, 0, 7, 1.33, game.world, { colour: 'orange' });
  path = new Path(platform.body, 42, 29, 42, 3, 10, 0.25);
  // platform = MapUtils.staticPlatform(0, 0, 100, 20, game.engine, {}, 'orange');
  // path = MapUtils.addPath(platform.body, 620, 100, 620, 500, 10000, 0.25);
  game.dynamic.push(platform);
  game.paths.push(path);

  platform = new Platform(0, 0, 7, 1.33, game.world, { colour: 'red' });
  path = new Path(platform.body, 4.5, 29, 4.5, 3, 10, 0.5);
  // platform = MapUtils.staticPlatform(0, 0, 100, 20, game.engine, {}, 'red');
  // path = MapUtils.addPath(platform.body, 70, 100, 70, 500, 10000, 0.5);
  game.dynamic.push(platform);
  game.paths.push(path);

  platform = new Platform(0, 0, 7, 1.33, game.world, { colour: 'red' });
  path = new Path(platform.body, 49.5, 29, 49.5, 3, 10, 0.5);
  // platform = MapUtils.staticPlatform(0, 0, 100, 20, game.engine, {}, 'red');
  // path = MapUtils.addPath(platform.body, 730, 100, 730, 500, 10000, 0.5);
  game.dynamic.push(platform);
  game.paths.push(path);


  // Weapons
  game.weaponSpawn = [
    [BasicGun, 1],
    [MachineGun, 1],
    [Sniper, 1]
  ]

  // Spawn points
  // game.spawns = [{ x: 375, y: 0 }, { x: 425, y: 0 }, { x: 45, y: 200 }, { x: 95, y: 200 }, { x: 705, y: 200 }, { x: 755, y: 200 }];
  game.spawns = [{ x: 27, y: 33 }, { x: 4.5, y: 20 }, { x: 49.5, y: 20 }, { x: 12, y: 7 }, { x: 42, y: 7 }, { x: 19.5, y: 20 }, { x: 34.5, y: 20 }];
  // game.spawns = [{ x: 400, y: 50 }, { x: 70, y: 250 }, { x: 730, y: 250 }, { x: 180, y: 450 }, { x: 620, y: 450 }, { x: 290, y: 250 }, { x: 510, y: 250 }];

}

function rotations(game) {
  game.width = 80;
  game.height = 54;

  body = game.world.createBody({
      type: 'kinematic',
      position: vec(40, 27),
      angularVelocity: -0.12
      // userData: {
      //   type: 'platform',
      //   friction: true
      // }
  });

  let platform, path;

  platform = new Platform(0, 17, 20, 1.33, game.world, { body: body, colour: 'cyan' });
  game.dynamic.push(platform);
  platform = new Platform(0, -17, 20, 1.33, game.world, { body: body, colour: 'cyan' });
  game.dynamic.push(platform);
  platform = new Platform(17, 0, 1.33, 20, game.world, { body: body, colour: 'blue' });
  game.dynamic.push(platform);
  platform = new Platform(-17, 0, 1.33, 20, game.world, { body: body, colour: 'blue' });
  game.dynamic.push(platform);

  platform = new Platform(0, 0, 13.3, 1.33, game.world, { colour: 'purple' });
  game.dynamic.push(platform);

  path = new Path(platform.body, 10, 7, 10, 47, 15, 0.5);
  game.paths.push(path);

  platform = new Platform(0, 0, 13.3, 1.33, game.world, { colour: 'purple' });
  game.dynamic.push(platform);

  path = new Path(platform.body, 70, 7, 70, 47, 15);
  game.paths.push(path);

  // var platform, path, compound, partA, partB, partC, partD;

  // platform = MapUtils.staticPlatform(0, 0, 200, 20, game.engine, {}, 'purple');
  // path = MapUtils.addPath(platform.body, 150, 110, 150, 700, 15000);
  // game.dynamic.push(platform);
  // game.paths.push(path);

  // platform = MapUtils.staticPlatform(0, 0, 200, 20, game.engine, {}, 'purple');
  // path = MapUtils.addPath(platform.body, 1050, 110, 1050, 700, 15000, 0.5);
  // game.dynamic.push(platform);
  // game.paths.push(path);

  // partA = MapUtils.rectPlatform(600, 155, 300, 20, game.engine, {}, 'cyan');
  // partB = MapUtils.rectPlatform(850, 405, 300, 20, game.engine, { angle: Math.PI / 2 }, 'blue');
  // partC = MapUtils.rectPlatform(600, 655, 300, 20, game.engine, {}, 'cyan');
  // partD = MapUtils.rectPlatform(350, 405, 300, 20, game.engine, { angle: Math.PI / 2 }, 'blue');

  // game.dynamic.push(partA);
  // game.dynamic.push(partB);
  // game.dynamic.push(partC);
  // game.dynamic.push(partD);

  // compound = Matter.Body.create({
  //   parts: [partA.body, partB.body, partC.body, partD.body],
  //   isStatic: true
  // });

  // game.storedObjects.compound = compound;

  // Matter.World.add(game.engine.world, compound);

  // game.platformUpdate = obj => {
  //   // Matter.Body.setAngularVelocity(obj.compound, 0.02);
  //   Matter.Body.rotate(obj.compound, 0.002);
  // }

  // Weapons
  game.weaponSpawn = [
    [BasicGun, 1],
    [MachineGun, 1],
    [Sniper, 1]
  ]

  // Spawn points
  game.spawns = [{ x: 7, y: 30 }, { x: 73, y: 30 }, { x: 13, y: 30 }, { x: 67, y: 30 }];
  // game.spawns = [{ x: 100, y: 350 }, { x: 1100, y: 350 }, { x: 200, y: 350 }, { x: 1000, y: 350 }];
}

function doubleSided(game) {
  game.width = 54;
  game.height = 36;

  var ground = new Platform(27, 8, 8, 1.33, game.world, { colour: 'red' });
  game.static.push(ground);

  function createSwivel(x, y) {
    var body = game.world.createBody({
      type: 'dynamic',
      position: vec(x, y),
      allowSleep: false
    });
    body.setAngularDamping(0.2);
    game.world.createJoint(pl.RevoluteJoint({}, body, ground.body, vec(x, y + 0.0)));
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

  // ground = new Platform(0, 23.5, 1, 3, game.world, { colour: 'yellow' });
  // game.static.push(ground);
  // ground = new Platform(54, 23.5, 1, 3, game.world, { colour: 'yellow' });
  // game.static.push(ground);
  ground = new Platform(2, 22, 4, 1.33, game.world, { colour: 'yellow' });
  game.static.push(ground);
  ground = new Platform(52, 22, 4, 1.33, game.world, { colour: 'yellow' });
  game.static.push(ground);

  // Spawn points
  // game.spawns = [{ x: 17, y: 12 }, { x: 37, y: 12 }, { x: 7, y: 12 }, { x: 47, y: 12 }, { x: 12, y: 26 }, { x: 42, y: 26 }];
  game.spawns = [{ x: 17, y: 19 }, { x: 37, y: 19 }, { x: 7, y: 19 }, { x: 47, y: 19 }];//, { x: 12, y: 26 }, { x: 42, y: 26 }];
}

function debugMap(game) {
  game.width = 800;
  game.height = 540;

  var ground = MapUtils.staticPlatform(game.width * 0.5, game.height - 50, game.width - 100, 20, game.engine);
  game.static.push(ground);

  // var platform = MapUtils.staticPlatform(600, 400, 100, 20, game.engine, { label: 'spike' }, 'spike');
  // game.static.push(platform);
  // var platform = MapUtils.polyPlatform(600, 400, 3, 20, game.engine, { isStatic: true, label: 'spike' }, 'default');
  // game.static.push(platform);

  platform = MapUtils.staticPlatform(400, 400, 100, 20, game.engine, {}, 'red');
  // game.storedObjects.bodies = platform.body;
  // game.dynamic.push(platform);

  game.paths.push(MapUtils.addPath(platform.body, 100, 100, 600, 500, 10000))

  // game.platformUpdate = game => {
  //   var body = game.storedObjects.red;
  //   var py = 270 + 150 * Math.sin(game.engine.timing.timestamp * 0.001);
  //   Matter.Body.setVelocity(body, { x: 0, y: py - body.position.y });
  //   Matter.Body.setPosition(body, { x: 100, y: py });
  // }

  // Weapons
  game.weaponSpawn = [
    [BasicGun, 1],
    [MachineGun, 1],
    [Sniper, 1]
  ]

  // Spawn points
  game.spawns = [{ x: 350, y: 200 }, { x: 450, y: 200 }, { x: 250, y: 200 }, { x: 550, y: 200 }];
}

createMapFuncs.push(turnAndShoot);
createMapFuncs.push(superBasic);
createMapFuncs.push(sixPlatforms);
createMapFuncs.push(lifts);
createMapFuncs.push(rotations);
createMapFuncs.push(doubleSided);
// createMapFuncs.push(debugMap);

module.exports = createMapFuncs;
