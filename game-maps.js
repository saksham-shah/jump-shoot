var Matter = require('matter-js');
// var Platform = require('./platform.js');
var MapUtils = require('./map-utils.js');

var createMapFuncs = [];

function turnAndShoot(game) {
  game.width = 800;
  game.height = 540;
  game.bulletBounce = true;

  var pivotPlat = MapUtils.pivotPlatform(game.width * 0.5, game.height * 0.5, 450, 20, { density: 0.02, frictionAir: 0.001 }, game.engine);
  game.dynamic.push(pivotPlat);

  var ground = MapUtils.staticPlatform(game.width * 0.5, game.height, 100, 20, game.engine);
  game.static.push(ground);

  // Game boundary
  game.deathBounds = {
    bottom: game.height + 50
  }

  // Spawn points
  game.spawns = [{ x: 350, y: 200 }, { x: 450, y: 200 }, { x: 250, y: 200 }, { x: 550, y: 200 }];
}
createMapFuncs.push(turnAndShoot);

function superBasic(game) {
  game.width = 800;
  game.height = 540;

  var ground = MapUtils.staticPlatform(game.width * 0.5, game.height - 50, game.width - 100, 20, game.engine);
  game.static.push(ground);

  var pendulum = MapUtils.pivotPlatform(game.width * 0.5, 70, 20, 300, { density: 100, frictionAir: 0, restitution: 5 }, game.engine, 0, 120);
  game.dynamic.push(pendulum)

  // Game boundary
  game.deathBounds = {
    bottom: game.height + 50
  }

  // Spawn points
  game.spawns = [{ x: 350, y: 200 }, { x: 450, y: 200 }, { x: 250, y: 200 }, { x: 550, y: 200 }];
}
createMapFuncs.push(superBasic);

module.exports = createMapFuncs;
