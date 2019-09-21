// Initialise variables
var myid;

var ss, gs, ms, ls, cs; // Various screens used in the game

var scr; // Current screen

var popup;

var inLobby = false; // Whether the player is currently in a lobby
var lobbyName = null;

var playerName = ""; // Starts as empty

var SERVER = "_server"; // Server name in chat messages

var chat, chatTextBox; // Variables storing the chat and chat text box

var textTarget = null; // Any text typed will be added to the text box stored here
var shiftPressed = false; // Used to type upper case characters

var timer = {
  time: -1,
  maxTime: 0,
  text: ""
}

// Sets the timer up
function setTimer(time, text) {
  timer.maxTime = time;
  timer.time = time;
  timer.text = text;
}
//

// Controls of the game
var controls = {
  up: 87, // W
  down: 83, // S
  left: 65, // A
  right: 68, // D
  shoot: "left", // LMB
  equip: "right", // RMB - UNUSED
  throw: "right", // RMB
  shield: "right", // RMB
  bouncy: 69 // E
}

var gameSize = {
  x: 0,
  y: 0,
  w: 800,
  h: 540,
  z: 1
}

var socket;

console.log("You are playing on the EU server. There are no other servers, this is just a random test console message. Enjoy!")

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  calculateGameSize();
}

function calculateGameSize(gameWidth, gameHeight) {
  var screenRatio = width / height;
  var gameRatio = gameSize.w / gameSize.h;

  if (screenRatio > gameRatio) {
    // The screen is wider than required
    gameSize.z = height / gameSize.h * 0.9;
  } else {
    gameSize.z = width / gameSize.w * 0.9
  }

  gameSize.x = (width - gameSize.w * gameSize.z) * 0.5;
  gameSize.y = (height - gameSize.h * gameSize.z) * 0.5;
}

function setup() {

  // createCanvas(800 * 1.5, 540 * 1.5);
  createCanvas(windowWidth, windowHeight);

  // b = new Button(100, 30, "Join", () => console.log("click!"));
  // b = new ButtonBar("lobby", {test: 4}, [{txt: "Join", clickFunc: lobby => console.log(lobby.test)}, {txt: "Join", clickFunc: lobby => console.log(lobby.test)}]);

  // popup = new Popup('Hello there');

  ss = new StartScreen();
  gs = new GameScreen();
  ms = new MenuScreen();
  ls = new LobbyScreen();

  scr = ss;

  chat = new Chat(5);

  chatTextBox = new TextBox(0, "Enter to send", function(txt) {
    // Send chat messages
    socket.emit('chat message', txt);
  });

  // Connect to the server
  socket = io.connect();

  // First connecting
  socket.on('welcome', function(socketid) {
    myid = socketid;

    inLobby = false;
    gs.resetGame();

    scr = ss;

    if (playerName != "") {
      var data = {
        name: playerName,
      }
      socket.emit('pick name', playerName);

      scr = ms;
    }

    // for (var lobby of lobbies) {
    //   ls.addLobby(lobby);
    // }
  })

  socket.on('lobbies updated', function(lobbies) {
    ls.updateLobbies(lobbies);
  })

  // Lobby is joined
  socket.on('joined lobby', function(data) {
    inLobby = true;
    lobbyName = data.name;
    // Send messages in the chat to tell the player they have joined a lobby
    chat.newMessage(SERVER, "Welcome to the lobby '" + data.name + "'");
    if (data.gameinfo) { // Lobby is currently mid game
      chat.newMessage(SERVER, "Game ongoing: please wait for it to end");
      // Game zooming scale depends on the size of the screen relative to the game map
      // gameSize.z = width / data.gameinfo.width

      gameSize.w = data.gameinfo.width;
      gameSize.h = data.gameinfo.height;
      calculateGameSize();

      // Start displaying the game
      platforms = data.gameinfo.platforms;
      gs.newGame(data.gameinfo.platforms);
    }
    scr = gs;
  })

  // Lobby is left
  socket.on('left lobby', function() {
    inLobby = false;
    gs.resetGame();
    scr = ms;
  });

  // Name updated
  socket.on('name updated', function(name) {
    playerName = name;
  })

  // New game starts
  socket.on('game start', function(data) {
    // Game zooming scale depends on the size of the screen relative to the game map
    // gameSize.z = width / data.width

    gameSize.w = data.gameinfo.width;
    gameSize.h = data.gameinfo.height;
    calculateGameSize();

    // Start displaying the game
    platforms = data.platforms;
    gs.newGame(data.platforms);
    chat.newMessage(SERVER, "New game starting");
  })

  // Next frame of the game
  socket.on('update', function(data) {
    if (data.type == 'updateGame') {
      // dynamic = data.entities;
      gs.updateDynamic(data.entities, data.players);
    } else if (data.type == 'startGame') {
      // Game zooming scale depends on the size of the screen relative to the game map
      // gameSize.z = width / data.width

      gameSize.w = data.width;
      gameSize.h = data.height;
      calculateGameSize();

      // Start displaying the game
      platforms = data.platforms;
      gs.newGame(data.platforms);
      chat.newMessage(SERVER, "New game starting");
    }
  })

  // Game ended
  socket.on('game over', function(data) {
    setTimer(60, "Next game");
    chat.newMessage(SERVER, "Game over");
    // Check if there is a single winner
    if (data.winner) {
      chat.newMessage(SERVER, "Winner: " + data.winner);
    } else { // If no winner, it's a draw
      chat.newMessage(SERVER, "Winner: NONE - it's a draw");
    }
  })

  // New player in lobby
  socket.on('player joined', function(name) {
    chat.newMessage(SERVER, name + " joined the lobby");
  })

  // Player left the lobby
  socket.on('player left', function(name) {
    chat.newMessage(SERVER, name + " left the lobby");
  })

  // New message in the chat
  socket.on('chat message', function(data) {
    chat.newMessage(data.sender, data.message);
  })

  // Rect mode changed to match the way rectangles are represented in matter.js
  rectMode(CENTER);
}

// Debug function used if a game is stuck forever because someone left the game open in a browser
function forceEndGame() {
  socket.emit('force end');
}

function mousePressed() {
  // setTimer(120);
  // Only emit to server if the player is in a lobby
  if (inLobby) {

    // Searches through controls list
    var keys = Object.keys(controls);
    for (var i = 0; i < keys.length; i++) {
      // If found control matching the key/button pressed, emit a press event to the server
      if (controls[keys[i]] == mouseButton) {
        socket.emit('press', keys[i]);
      }
    }
  }

  // Prevent default browser behaviour for mouse presses
  return false;
}

function mouseReleased() {
  // Only emit to server if the player is in a lobby
  if (inLobby) {
    var keys = Object.keys(controls);
    for (var i = 0; i < keys.length; i++) {
      // If found control matching the key/button pressed, emit a release event to the server
      if (controls[keys[i]] == mouseButton) {
        socket.emit('release', keys[i]);
      }
    }
  }

  return false;
}

function keyPressed() {
  // First check various keys relating to text boxes
  if (keyCode == 16) { // shift keys
    shiftPressed = true;
  } else if (keyCode == 13) { // enter key
    // If a text box was selected, run its enter function
    if (textTarget) {
      textTarget.pressEnter();
      // Deselect the text box
      textTarget = null;
    } else {
      // If no text box was selected, open the chat text box
      chatTextBox.target();
    }
  } else if (keyCode == 8 && textTarget) { // Backspace, only if a text box is selected
   textTarget.removeChar();
  }
  // If no text box is selected, check through the controls list for game key presses
  if (!textTarget) {
    // Only emit to server if the player is in a lobby
    if (inLobby) {
      var control;
      var keys = Object.keys(controls);
      for (var i = 0; i < keys.length; i++) {
        // If found control matching the key/button pressed, emit a press event to the server
        if (keyCode == controls[keys[i]]) {
          socket.emit('press', keys[i]);
        }
      }
    }
  } else { // Type into the selected text box
    // Check if it's a valid character
    if ((keyCode >= 65 && keyCode <= 90) || keyCode == 32 || keyCode == 191) {
      var charToAdd;
      if (keyCode == 191) { // forward slash, needed for chat commands
        charToAdd = '/';
      } else {
        var code = keyCode;
        if (!shiftPressed && keyCode >= 65 && keyCode <= 90) {
          // Change alphabet character to lower case if shift isn't pressed
          code += 32;
        }
        charToAdd = String.fromCharCode(code);
      }
      // textTarget.addChar(charToAdd)
    };
    if (key.length == 1) {
      textTarget.addChar(key);
    }
  }
}

function keyReleased() {
  if (keyCode == 16) { // shift keys
   shiftPressed = false;
  }
  // Only emit to server if the player is in a lobby
  if (inLobby) {
    var control;
    var keys = Object.keys(controls);
    for (var i = 0; i < keys.length; i++) {
      // If found control matching the key/button pressed, emit a release event to the server
      if (keyCode == controls[keys[i]]) {
        socket.emit('release', keys[i]);
      }
    }
  }
}

// Convert a client-side mouse position into a position in the game map
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

  // Show game screen if in a lobby, otherwise show the start screen
  // if (inLobby) {
  //   gs.show(gameSize.x, gameSize.y, gameSize.z);
  // } else {
  //   ss.update();
  //   ss.show();
  // }

  if (!popup && scr.update) {
    scr.update();
  }

  scr.show();

  if (inLobby) {
    // Send the mouse position to the server to aim weapons
    var data = mouseToGamePos();
    socket.emit('update', data);
  }

  if (popup) {
    popup.show();
  }

  // Draw chat in the bottom left corner
  chat.show(20, height - 50);

  // Only show chat text box if it is selected
  if (textTarget == chatTextBox) {
    chatTextBox.show(20, height - 24, 200, 26);
  }

  // b.updateButtonStates(y);
  // b.show(y);//, b.isHovered(300, 200));
  // y ++;

  if (timer.time > 0 && timer.maxTime > 0) {
    timer.time--;

    // Draw the timer
    push();
    var progress = 1 - (timer.time / timer.maxTime);
    fill(255);
    noStroke();
    translate(width * 0.5, 100);
    textAlign(CENTER);
    textSize(15);
    var timerR = 50;
    if (timer.text) {
      text(timer.text, 0, -timerR * 0.5 - 15);
    }
    rotate(-HALF_PI);
    arc(0, 0, timerR, timerR, 0, progress * TWO_PI, PIE);
    pop();
  }

}
