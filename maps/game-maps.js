var Matter = require('matter-js');
var MapUtils = require('./map-utils.js');

var BasicGun = require('../weapons/basic-gun.js');
var MachineGun = require('../weapons/machine-gun.js');
var Sniper = require('../weapons/sniper.js');

var createMapFuncs = [];

function turnAndShoot(game) {
  game.width = 800;
  game.height = 540;
  // game.bulletBounce = true;

  // var pivotPlat = MapUtils.pivotPlatform(game.width * 0.5, game.height * 0.5, 450, 20, { density: 0.02, frictionAir: 0.001 }, game.engine);
  // game.dynamic.push(pivotPlat);

  var pivotPlat = MapUtils.rectPlatform(game.width * 0.5, game.height * 0.5, 450, 20, game.engine, { density: 0.02, frictionAir: 0.001 }, 'orange');
  game.dynamic.push(pivotPlat);
  MapUtils.addPivot(pivotPlat.body, game.engine);

  var ground = MapUtils.staticPlatform(game.width * 0.5, game.height, 100, 20, game.engine, {}, 'yellow');
  game.static.push(ground);

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
  game.spawns = [{ x: 350, y: 200 }, { x: 450, y: 200 }, { x: 250, y: 200 }, { x: 550, y: 200 }];
}

function superBasic(game) {
  game.width = 800;
  game.height = 540;

  var ground = MapUtils.staticPlatform(game.width * 0.5, game.height - 50, game.width - 100, 20, game.engine, {}, 'blue');
  game.static.push(ground);

  // var pendulum = MapUtils.pivotPlatform(game.width * 0.5, 60, 20, 300, { density: 100, frictionAir: 0, restitution: 1, label: 'nojump' }, game.engine, 0, 120);
  // game.dynamic.push(pendulum);
  var pendulum = MapUtils.rectPlatform(game.width * 0.5, 60, 20, 300, game.engine, { density: 100, frictionAir: 0, restitution: 1, label: 'nojump' }, 'purple');
  game.dynamic.push(pendulum);
  MapUtils.addPivot(pendulum.body, game.engine, 0, 120);

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
  game.spawns = [{ x: 350, y: 200 }, { x: 450, y: 200 }, { x: 250, y: 200 }, { x: 550, y: 200 }];
}

function sixPlatforms(game) {
  game.width = 800;
  game.height = 540;

  platform = MapUtils.staticPlatform(400, 150, 150, 20, game.engine, {}, 'green');
  game.static.push(platform);

  platform = MapUtils.staticPlatform(400, 300, 75, 20, game.engine, { label: 'spike' }, 'spike');
  game.static.push(platform);

  platform = MapUtils.staticPlatform(400, 450, 150, 20, game.engine, {}, 'green');
  game.static.push(platform);

  platform = MapUtils.staticPlatform(100, 250, 100, 20, game.engine, {}, 'cyan');
  game.static.push(platform);

  platform = MapUtils.staticPlatform(200, 350, 100, 20, game.engine, {}, 'cyan');
  game.static.push(platform);

  platform = MapUtils.staticPlatform(700, 250, 100, 20, game.engine, {}, 'cyan');
  game.static.push(platform);

  platform = MapUtils.staticPlatform(600, 350, 100, 20, game.engine, {}, 'cyan');
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
  game.spawns = [{ x: 200, y: 300 }, { x: 600, y: 300 }, { x: 100, y: 200 }, { x: 700, y: 200 }, { x: 400, y: 100 }, { x: 400, y: 400 }];
}

function lifts(game) {
  var platform, path;

  platform = MapUtils.staticPlatform(0, 0, 100, 20, game.engine, {}, 'green');
  path = MapUtils.addPath(platform.body, 400, 100, 400, 620, 10000, -0.25);
  game.dynamic.push(platform);
  game.paths.push(path);

  platform = MapUtils.staticPlatform(0, 0, 100, 20, game.engine, {}, 'yellow');
  path = MapUtils.addPath(platform.body, 290, 100, 290, 620, 10000);
  game.dynamic.push(platform);
  game.paths.push(path);

  platform = MapUtils.staticPlatform(0, 0, 100, 20, game.engine, {}, 'yellow');
  path = MapUtils.addPath(platform.body, 510, 100, 510, 620, 10000);
  game.dynamic.push(platform);
  game.paths.push(path);

  platform = MapUtils.staticPlatform(0, 0, 100, 20, game.engine, {}, 'orange');
  path = MapUtils.addPath(platform.body, 180, 100, 180, 620, 10000, 0.25);
  game.dynamic.push(platform);
  game.paths.push(path);

  platform = MapUtils.staticPlatform(0, 0, 100, 20, game.engine, {}, 'orange');
  path = MapUtils.addPath(platform.body, 620, 100, 620, 620, 10000, 0.25);
  game.dynamic.push(platform);
  game.paths.push(path);

  platform = MapUtils.staticPlatform(0, 0, 100, 20, game.engine, {}, 'red');
  path = MapUtils.addPath(platform.body, 70, 100, 70, 620, 10000, 0.5);
  game.dynamic.push(platform);
  game.paths.push(path);

  platform = MapUtils.staticPlatform(0, 0, 100, 20, game.engine, {}, 'red');
  path = MapUtils.addPath(platform.body, 730, 100, 730, 620, 10000, 0.5);
  game.dynamic.push(platform);
  game.paths.push(path);


  // Weapons
  game.weaponSpawn = [
    [BasicGun, 1],
    [MachineGun, 1],
    [Sniper, 1]
  ]

  // Spawn points
  game.spawns = [{ x: 375, y: 0 }, { x: 425, y: 0 }, { x: 45, y: 200 }, { x: 95, y: 200 }, { x: 705, y: 200 }, { x: 755, y: 200 }];
  // game.spawns = [{ x: 70, y: 0 }, { x: 400, y: 0 }, { x: 730, y: 0 }];

}

function rotations(game) {
  game.width = 1200;
  game.height = 810;

  var platform, path, compound, partA, partB, partC, partD;

  platform = MapUtils.staticPlatform(0, 0, 200, 20, game.engine, {}, 'purple');
  path = MapUtils.addPath(platform.body, 150, 110, 150, 700, 15000);
  game.dynamic.push(platform);
  game.paths.push(path);

  platform = MapUtils.staticPlatform(0, 0, 200, 20, game.engine, {}, 'purple');
  path = MapUtils.addPath(platform.body, 1050, 110, 1050, 700, 15000, 0.5);
  game.dynamic.push(platform);
  game.paths.push(path);

  partA = MapUtils.rectPlatform(600, 155, 300, 20, game.engine, {}, 'cyan');
  partB = MapUtils.rectPlatform(850, 405, 300, 20, game.engine, { angle: Math.PI / 2 }, 'blue');
  partC = MapUtils.rectPlatform(600, 655, 300, 20, game.engine, {}, 'cyan');
  partD = MapUtils.rectPlatform(350, 405, 300, 20, game.engine, { angle: Math.PI / 2 }, 'blue');

  game.dynamic.push(partA);
  game.dynamic.push(partB);
  game.dynamic.push(partC);
  game.dynamic.push(partD);

  compound = Matter.Body.create({
    parts: [partA.body, partB.body, partC.body, partD.body],
    isStatic: true
  });

  game.storedObjects.compound = compound;

  Matter.World.add(game.engine.world, compound);

  game.platformUpdate = obj => {
    // Matter.Body.setAngularVelocity(obj.compound, 0.02);
    Matter.Body.rotate(obj.compound, 0.002);
  }

  // Weapons
  game.weaponSpawn = [
    [BasicGun, 1],
    [MachineGun, 1],
    [Sniper, 1]
  ]

  // Spawn points
  game.spawns = [{ x: 100, y: 350 }, { x: 1100, y: 350 }, { x: 200, y: 350 }, { x: 1000, y: 350 }];
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
createMapFuncs.push(rotations)
// createMapFuncs.push(debugMap);

module.exports = createMapFuncs;
