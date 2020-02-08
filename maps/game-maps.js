var Matter = require('matter-js');
var MapUtils = require('./map-utils.js');

var BasicGun = require('../weapons/basic-gun.js');
var MachineGun = require('../weapons/machine-gun.js');
var Sniper = require('../weapons/sniper.js');

var createMapFuncs = [];

function turnAndShoot(game) {
  game.width = 800;
  game.height = 540;
  game.bulletBounce = true;

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
  var pendulum = MapUtils.rectPlatform(game.width * 0.5, 60, 20, 300, game.engine, { density: 100, frictionAir: 0, restitution: 1, label: 'nojump' }, 'red');
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

function debugMap(game) {
  game.width = 800;
  game.height = 540;

  var ground = MapUtils.staticPlatform(game.width * 0.5, game.height - 50, game.width - 100, 20, game.engine);
  game.static.push(ground);

  var platform = MapUtils.staticPlatform(600, 400, 100, 20, game.engine, { label: 'spike' }, 'spike');
  game.static.push(platform);
  // var platform = MapUtils.polyPlatform(600, 400, 3, 20, game.engine, { isStatic: true, label: 'spike' }, 'default');
  // game.static.push(platform);

  platform = MapUtils.staticPlatform(400, 400, 100, 20, game.engine, {}, 'red');
  game.static.push(platform);

  platform = MapUtils.staticPlatform(400, 300, 100, 20, game.engine, {}, 'blue');
  game.static.push(platform);

  platform = MapUtils.staticPlatform(400, 200, 100, 20, game.engine, {}, 'green');
  game.static.push(platform);

  platform = MapUtils.staticPlatform(400, 100, 100, 20, game.engine, {}, 'yellow');
  game.static.push(platform);

  platform = MapUtils.staticPlatform(200, 200, 100, 20, game.engine, {}, 'purple');
  game.static.push(platform);

  platform = MapUtils.staticPlatform(200, 300, 100, 20, game.engine, {}, 'cyan');
  game.static.push(platform);

  // Weapons
  game.weaponSpawn = [
    [BasicGun, 1],
    [MachineGun, 1],
    [Sniper, 1]
  ]

  // Game boundary
  game.deathBounds = {
    bottom: game.height + 50
  }

  // Spawn points
  game.spawns = [{ x: 350, y: 200 }, { x: 450, y: 200 }, { x: 250, y: 200 }, { x: 550, y: 200 }];
}

createMapFuncs.push(turnAndShoot);
createMapFuncs.push(superBasic);
createMapFuncs.push(sixPlatforms);
// createMapFuncs.push(debugMap);

module.exports = createMapFuncs;
