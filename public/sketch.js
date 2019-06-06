var actionQueue = [];

var scr;
var gs;

var inGame = false;
var inLobby = false;

var playerName = "";

var platforms = [];
var dynamic = [];

var SERVER = "_server";

var chat, chatTextBox;

var textTarget = null;
var textInput;
var shiftPressed = false;
//

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

var socket;
var gameSize = {
  x: 0,
  y: 0,
  w: 800,
  h: 540,
  z: 1
}

function setup() {

  createCanvas(800, 540);

  ss = new StartScreen();
  gs = new GameScreen();

  chat = new Chat(5);

  chatTextBox = new TextBox(30, "Enter to send", function(txt) {
    if (txt.length > 0) {
      socket.emit('chat message', txt);
    }
  });

  socket = io.connect();//'http://192.168.1.211:3000');
  //console.log(io.connect());

  socket.on('welcome', function() {
    inLobby = false;
    inGame = false;
    // this.playerName = "";
    // var data = {
    //   lobbyid: "abc"
    // }
    // socket.emit('join lobby', data);
  })

  socket.on('joined lobby', function(data) {
    inLobby = true;
    console.log("Welcome to the lobby '" + data.name + "'");
    chat.newMessage(SERVER, "Welcome to the lobby '" + data.name + "'");
    // console.log("You are " + data.myid);
    // chat.newMessage(SERVER, "You are " + data.myid);
    console.log("Click to start a new game");
    chat.newMessage(SERVER, "Click to start a new game");
    if (data.gameinfo) {
      inGame = true;
      console.log("Game ongoing: please wait for it to end");
      chat.newMessage(SERVER, "Game ongoing: please wait for it to end");
      gameSize.z = width / data.gameinfo.width
      platforms = data.gameinfo.platforms;
      gs.newGame(data.gameinfo.platforms);
      // inGame = true;
    }
  })

  socket.on('lobby update', function(data) {
    console.log("Lobby name: " + data.name);
    console.log(data.players);
  })

  socket.on('game start', function(data) {
    gameSize.z = width / data.width
    platforms = data.platforms;
    inGame = true;
    gs.newGame(data.platforms);
    console.log("New game starting")
    chat.newMessage(SERVER, "New game starting");
  })

  socket.on('update', function(data) {
    dynamic = data;
    gs.update(dynamic);
    //console.log(data);
  })

  socket.on('game over', function(data) {
    inGame = false;
    console.log("Game over");
    chat.newMessage(SERVER, "Game over");
    if (data.winner) {
      console.log("Winner: " + data.winner);
      chat.newMessage(SERVER, "Winner: " + data.winner);
    } else {
      console.log("Winner: NONE - it's a draw");
      chat.newMessage(SERVER, "Winner: NONE - it's a draw");
    }
    console.log("Click to start a new game");
    chat.newMessage(SERVER, "Click to start a new game");
  })

  socket.on('player joined', function(name) {
    console.log(name + " joined the lobby");
    chat.newMessage(SERVER, name + " joined the lobby");
  })

  socket.on('player left', function(name) {
    console.log(name + " left the lobby");
    chat.newMessage(SERVER, name + " left the lobby");
  })

  socket.on('chat message', function(data) {
    chat.newMessage(data.sender, data.message);
  })

  //createCanvas(400, 400);
  rectMode(CENTER);
}

function initTextInput() {
  textInput = document.getElementById('textInput');
}

function forceEndGame() {
  socket.emit('force end');
}

function mousePressed() {
  // circles.push(new Circle(mouseX, mouseY, 20));

  if (inLobby) {
    if (!inGame) {
      var data = {

      }
      socket.emit('start game', data);
    }

    var keys = Object.keys(controls);
    for (var i = 0; i < keys.length; i++) {
      if (controls[keys[i]] == mouseButton) {
        socket.emit('press', keys[i]);
      }
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
  if (inLobby) {
    var keys = Object.keys(controls);
    for (var i = 0; i < keys.length; i++) {
      if (controls[keys[i]] == mouseButton) {
        socket.emit('release', keys[i]);
        // console.log(keys[i]);
      }
    }
  }

  return false;
  // socket.emit('mouseRelease', {});
}

function keyPressed() {
  if (keyCode == 16) { // shift keys
   shiftPressed = true;
 } else if (keyCode == 13) { // enter key
   if (textTarget) {
     textTarget.pressEnter();
     textTarget = null;
   } else {
     chatTextBox.target();
     // chat.timeSinceMsg = 0;
   }
 } else if (keyCode == 8 && textTarget) {
   textTarget.removeChar();
 }
  if (!textTarget) {
    if (inLobby) {
      var control;
      var keys = Object.keys(controls);
      for (var i = 0; i < keys.length; i++) {
        if (keyCode == controls[keys[i]]) {
          // control = keys[i]
          socket.emit('press', keys[i]);
        }
      }
    }
  } else {
    if ((keyCode >= 65 && keyCode <= 90) || keyCode == 32 || keyCode == 191) { // checking if it's a valid character
      var charToAdd;
      if (keyCode == 191) { // forward slash, needed for chat commands
        charToAdd = '/';
      } else {
        var code = keyCode;
        if (!shiftPressed && keyCode >= 65 && keyCode <= 90) {
          code += 32;
        }
        charToAdd = String.fromCharCode(code);
      }
      textTarget.addChar(charToAdd)
    };
  }
  // socket.emit('startPress', control);
}

function keyReleased() {
  if (keyCode == 16) { // shift keys
   shiftPressed = false;
  }
  if (inLobby) {
    var control;
    var keys = Object.keys(controls);
    for (var i = 0; i < keys.length; i++) {
      if (keyCode == controls[keys[i]]) {
        // control = keys[i]
        socket.emit('release', keys[i]);
      }
    }
  }
  // socket.emit('endPress', control);
}

function mouseToGamePos() {
  var x = (mouseX - gameSize.x) / gameSize.z;
  var y = (mouseY - gameSize.y) / gameSize.z;
  return {
    x: x,
    y: y
  }
}

function draw() {
  background(51);

  if (inLobby) {
    gs.show(gameSize.x, gameSize.y, gameSize.z);
  } else {
    ss.update();
    ss.show();
  }

  if (inGame) {
    var data = mouseToGamePos();
    socket.emit('update', data);
  }

  var data = mouseToGamePos();

  chat.show(20, height - 50);

  if (textTarget == chatTextBox) {
    chatTextBox.show(20, height - 24, 200, 26);
  }

}
