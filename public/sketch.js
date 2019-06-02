// module aliases
// var Engine = Matter.Engine,
//     Render = Matter.Render,
//     World = Matter.World,
//     Bodies = Matter.Bodies,
//     Body = Matter.Body,
//     Events = Matter.Events;
//
// var engine;
//
// var circles = [];
var actionQueue = [];

var platforms = [];
var dynamic = [];

var controls = {
  up: 87, // W
  down: 83, // S
  left: 65, // A
  right: 68, // D
  shoot: "left", // LMB
  equip: "right", // RMB
  throw: "right", // RMB
  bouncy: 69 // E
}
// var ground;
// //var player;
//
// var players = new Map();
//
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

var socket;

function setup() {

  socket = io.connect();//'http://192.168.1.211:3000');
  //console.log(io.connect());

  socket.on('welcome', function(data) {
    //console.log(data);
    createCanvas(data.width, data.height);
    platforms = data.platforms;
  })

  socket.on('click', function(data) {
    //circles.push(new Circle(data.x, data.y, 20));
  });

  socket.on('update', function(data) {
    dynamic = data;
    //console.log(data);
  })

  //createCanvas(400, 400);
  rectMode(CENTER);

  // create an engine
  // engine = Engine.create();
  // Events.on(engine, 'collisionStart', function(event) {
  //       var pairs = event.pairs;
  //       for (var i = 0; i < pairs.length; i++) {
  //           var pair = pairs[i];
  //           var playerA = players.get(pair.bodyA.label);
  //           var playerB = players.get(pair.bodyB.label);
  //           if (playerA && !playerB) {
  //             playerA.canJump = true;
  //           }
  //           if (playerB && !playerA) {
  //             playerB.canJump = true;
  //           }
  //       }
  //   });
  //
  //   Events.on(engine, 'collisionActive', function(event) {
  //         var pairs = event.pairs;
  //         for (var i = 0; i < pairs.length; i++) {
  //             var pair = pairs[i];
  //             var playerA = players.get(pair.bodyA.label);
  //             var playerB = players.get(pair.bodyB.label);
  //             if (playerA && !playerB) {
  //               playerA.canJump = true;
  //             }
  //             if (playerB && !playerA) {
  //               playerB.canJump = true;
  //             }
  //         }
  //     });
  //
  //   Events.on(engine, 'collisionEnd', function(event) {
  //         var pairs = event.pairs;
  //         for (var i = 0; i < pairs.length; i++) {
  //             var pair = pairs[i];
  //             var playerA = players.get(pair.bodyA.label);
  //             var playerB = players.get(pair.bodyB.label);
  //             if (playerA && !playerB) {
  //               playerA.canJump = false;
  //             }
  //             if (playerB && !playerA) {
  //               playerB.canJump = false;
  //             }
  //         }
  //     });
  //
  // ground = new Platform(width / 2, height, width, 20);
  //
  // var player = new Player(100, 200, 0);
  // players.set(player.label, player)
  // player = new Player(100, 200, 1);
  // players.set(player.label, player)
}

function mousePressed() {
  // circles.push(new Circle(mouseX, mouseY, 20));

  var keys = Object.keys(controls);
  for (var i = 0; i < keys.length; i++) {
    if (controls[keys[i]] == mouseButton) {
      socket.emit('press', keys[i]);
    }
  }

  return false;

  // var data = {
  //   x: mouseX,
  //   y: mouseY
  // }
  //
  // socket.emit('mousePress', {}});
}

function mouseReleased() {
  var keys = Object.keys(controls);
  for (var i = 0; i < keys.length; i++) {
    if (controls[keys[i]] == mouseButton) {
      socket.emit('release', keys[i]);
      // console.log(keys[i]);
    }
  }

  return false;
  // socket.emit('mouseRelease', {});
}

function keyPressed() {
  var control;
  var keys = Object.keys(controls);
  for (var i = 0; i < keys.length; i++) {
    if (keyCode == controls[keys[i]]) {
      // control = keys[i]
      socket.emit('press', keys[i]);
    }
  }
  // socket.emit('startPress', control);
}

function keyReleased() {
  var control;
  var keys = Object.keys(controls);
  for (var i = 0; i < keys.length; i++) {
    if (keyCode == controls[keys[i]]) {
      // control = keys[i]
      socket.emit('release', keys[i]);
    }
  }
  // socket.emit('endPress', control);
}

function draw() {
  background(51);

  for (var i = 0; i < platforms.length; i++) {
    drawObject(platforms[i])
  }

  for (var i = 0; i < dynamic.length; i++) {
    if (dynamic[i].hide !== true) {
      drawObject(dynamic[i])
    }
  }

  var data = {
    x: mouseX,
    y: mouseY
  };

  socket.emit('update', data);
}

function drawObject(obj) {
  push()
  translate(obj.x, obj.y);
  switch (obj.type) {
    case 'platform':
      fill(200);
      stroke(255);
      strokeWeight(1);
      rect(0, 0, obj.w, obj.h);
      break;
    case 'player':
      rotate(obj.angle);
      fill(obj.colour);
      stroke(0);
      strokeWeight(1);
      ellipse(0, 0, obj.r * 2);
      line(0, 0, obj.r, 0);
      if (obj.weapon) {
        var weaponObj = obj.weapon;
        weaponObj.angle = 0;
        weaponObj.x = obj.r;
        weaponObj.y = 0;
        weaponObj.hide = false;
        drawObject(weaponObj);
      }
      break;
    case 'weapon':
      rotate(obj.angle);
      fill(obj.colour);
      stroke(0);
      strokeWeight(1);
      rect(0, 0, obj.w, obj.h)
      break;
    case 'bullet':
      rotate(obj.angle)
      fill(255, 255, 0);
      noStroke();
      rect(-obj.r * 1.5, 0, obj.r * 15, obj.r)
      // fill(255);
      // rect(0, 0, obj.r, obj.r);
      break;
  }

  pop();
}
