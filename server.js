var express = require('express');
var app = express();
var portNo = process.env.PORT || 3000;

var server = app.listen(portNo);

app.use(express.static('public'));

console.log("Node server.js running on port" + portNo);

var socket = require('socket.io');

var io = socket(server);

var Matter = require('matter-js');

var Player = require('./player.js');
var BasicGun = require('./basic-gun.js');
var Platform = require('./platform.js');
var Bullet = require('./bullet.js');

var Lobby = require('./lobby.js');
// var LobbyData = require('./lobbydata.js');

//var Action = require('./action.js');

var width = 800;
var height = 540;

var users = new Map();
var lobbies = [];
var myLobby = new Lobby("lobby", "abc");
lobbies.push(myLobby);

// var lobbyData = new LobbyData(users, lobbies);

io.sockets.on('connection', newConnection);

// console.log(io);

function newConnection(socket) {
  console.log("new connection: " + socket.id);

  var data = myLobby.addPlayer(socket.id);
  socket.emit('joined lobby', data);
  socket.join(data.lobbyid);

  var userData = {
    lobbyid: data.lobbyid
  }
  users.set(socket.id, userData);

  socket.broadcast.to(myLobby.lobbyid).emit('player joined', socket.id);

//
  var player = new Player(100, 200, socket.id, colours[colourCount], engine);
  colourCount++;
  if (colourCount >= colours.length) {
    colourCount = 0;
  }
  players.set(player.id, player)

  var data = {
    width: width,
    height: height,
    platforms: [ground.toObject()]
  }
  // socket.emit('welcome', data);

  socket.on('start game', function(data) {
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    var data = lobby.newGame();
    var room = lobby.lobbyid;
    if (data) {
      io.in(room).emit('game start', data);
    }
  })

  socket.on('update', function(data) {
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    lobby.updateMousePos(socket.id, data);
    // var player = players.get(socket.id);
    // if (player) {
    //   player.mouseUpdate(data);
    // }
  })

  // socket.on('mousePress', function(data) {
  //   //socket.broadcast.emit('click', data);
  //   //circles.push(new Circle(data.x, data.y, 20, engine));
  //   //console.log(data);
  //   var player = players.get(socket.id);
  //   player.shoot();
  // });
  //
  // socket.on('mouseRelease', function(data) {
  //   //socket.broadcast.emit('click', data);
  //   //circles.push(new Circle(data.x, data.y, 20, engine));
  //   //console.log(data);
  //   var player = players.get(socket.id);
  //   player.shoot();
  // });

  socket.on('press', function(control) {
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    lobby.keyPressed(socket.id, control);
    // var player = players.get(socket.id);
    // player.controls[control] = true;
  })

  socket.on('release', function(control) {
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    lobby.keyReleased(socket.id, control);
    // var player = players.get(socket.id);
    // player.controls[control] = false;
  })

  socket.on('disconnect', function() {
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    lobby.removePlayer(socket.id);

    socket.broadcast.to(lobby.lobbyid).emit('player left', socket.id);

    console.log("disconnect: " + socket.id);
    // var player = players.get(socket.id)
    // player.removeFromWorld(engine);
    // players.delete(socket.id);
  })

  function getLobbyFromSocket(socketid) {
    // console.log(users);
    var userData = users.get(socketid);
    var lobbyid = userData.lobbyid;
    for (var i = 0; i < lobbies.length; i++) {
      if (lobbies[i].lobbyid === lobbyid) {
        return lobbies[i];
      }
    }
    return null;
  }
}

setInterval(updateGame, 1000 / 60);

//import {Matter} from './matter.min.js';


// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Events = Matter.Events;

var engine;

var weapons = [];
var bullets = [];
var actionQueue = [];
var ground;

var weaponCounter = 0;
//var player;

var players = new Map();

// var controls = [
//   {
//     up: false,
//     down: false,
//     left: false,
//     right: false
//   }, {
//     up: false,
//     down: false,
//     left: false,
//     right: false
//   }
// ]

var colours = [
  [255, 0, 0], // red
  [0, 0, 255], // blue
  [0, 255, 0], // green
  [255, 255, 0] // yellow
];
var colourCount = 0;

// create an engine
engine = Engine.create();
Events.on(engine, 'collisionStart', function(event) {
      var pairs = event.pairs;
      for (var i = 0; i < pairs.length; i++) {
          var pair = pairs[i];
          var playerA = players.get(pair.bodyA.label);
          var playerB = players.get(pair.bodyB.label);
          if (playerA && !playerB) {
            playerA.canJump = true;
          }
          if (playerB && !playerA) {
            playerB.canJump = true;
          }
      }
  });

  Events.on(engine, 'collisionActive', function(event) {
        var pairs = event.pairs;
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            var playerA = players.get(pair.bodyA.label);
            var playerB = players.get(pair.bodyB.label);
            if (playerA && !playerB) {
              playerA.canJump = true;
            }
            if (playerB && !playerA) {
              playerB.canJump = true;
            }
        }
    });

  Events.on(engine, 'collisionEnd', function(event) {
        var pairs = event.pairs;
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            var playerA = players.get(pair.bodyA.label);
            var playerB = players.get(pair.bodyB.label);
            if (playerA && !playerB) {
              playerA.canJump = false;
            }
            if (playerB && !playerA) {
              playerB.canJump = false;
            }
        }
    });

ground = new Platform(width / 2, height, width - 30, 20, engine);

// var player = new Player(100, 200, 0, engine);
// players.set(player.label, player)
// player = new Player(100, 200, 1, engine);
// players.set(player.label, player)

function updateGame() {
  for (var i = 0; i < lobbies.length; i++) {
    var room = lobbies[i].lobbyid;
    // var data = {
    //   players: lobbies[i].players,
    //   name: lobbies[i].name
    // }
    var data = lobbies[i].update();
    if (data) {
      if (data.inGame) {
        io.in(room).emit('update', data.gameData);
      } else {
        io.in(room).emit('game over', data.gameData);
      }
    }
  }
}

function draw() {

  for (var i = 0; i < lobbies.length; i++) {
    var room = lobbies[i].lobbyid;
    var data = {
      players: lobbies[i].players,
      name: lobbies[i].name
    }
    io.in(room).emit('lobby update', data);
  }

  while(actionQueue.length > 0) {
    controls = actionQueue[0].execute(controls);
    actionQueue.splice(0, 1);
  }

  for (var player of players.values()) {
    var bullet = player.update(weapons, engine);
    if (bullet) {
      bullets.push(bullet);
    }
  }

  for (var i = 0; i < weapons.length; i++) {
    if (weapons[i].isOffScreen(height)) {
      weapons[i].removeFromWorld(engine);
      weapons.splice(i, 1);
      i--;
    }
  }

  for (var i = 0; i < bullets.length; i++) {
    var collide = bullets[i].update(engine.world.bodies);
    if (bullets[i].isOffScreen(width, height) || collide) {
      bullets.splice(i, 1);
      i--;
    }
  }

  // console.log(engine.world.bodies[0].vertices);

  if (weaponCounter < 0) {
    if (weapons.length < players.size * 2) {
      weaponCounter = 300;
      var weapon = new BasicGun(Math.random() * (width - 100) + 50, 0, engine);
      weapons.push(weapon);
    }
  } else {
    weaponCounter--;
  }

  Engine.update(engine);

  var data = [];

  for (var i = 0; i < bullets.length; i++) {
    data.push(bullets[i].toObject());
  }

  for (var player of players.values()) {
    data.push(player.toObject());
  }

  for (var i = 0; i < weapons.length; i++) {
    data.push(weapons[i].toObject());
  }

  io.sockets.emit('update', data);
}
