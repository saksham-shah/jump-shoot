// Initialise variables

var ss, gs; // Various screens used in the game

var inGame = false; // Whether the player is currently in a lobby/game
var inLobby = false;

var playerName = ""; // Starts as empty

var SERVER = "_server"; // Server name in chat messages

var chat, chatTextBox; // Variables storing the chat and chat text box

var textTarget = null; // Any text typed will be added to the text box stored here
var shiftPressed = false; // Used to type upper case characters
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
    // Send chat messages
    socket.emit('chat message', txt);
  });

  // Connect to the server
  socket = io.connect();

  // First connecting
  socket.on('welcome', function() {
    inLobby = false;
    inGame = false;
  })

  // Lobby is joined
  socket.on('joined lobby', function(data) {
    inLobby = true;
    // Send messages in the chat to tell the player they have joined a lobby
    chat.newMessage(SERVER, "Welcome to the lobby '" + data.name + "'");
    chat.newMessage(SERVER, "Click to start a new game");
    if (data.gameinfo) { // Lobby is currently mid game
      inGame = true;
      chat.newMessage(SERVER, "Game ongoing: please wait for it to end");
      // Game zooming scale depends on the size of the screen relative to the game map
      gameSize.z = width / data.gameinfo.width
      // Start displaying the game
      platforms = data.gameinfo.platforms;
      gs.newGame(data.gameinfo.platforms);
    }
  })

  // New game starts
  socket.on('game start', function(data) {
    inGame = true;
    // Game zooming scale depends on the size of the screen relative to the game map
    gameSize.z = width / data.width
    // Start displaying the game
    platforms = data.platforms;
    gs.newGame(data.platforms);
    chat.newMessage(SERVER, "New game starting");
  })

  // Next frame of the game
  socket.on('update', function(data) {
    dynamic = data;
    gs.update(dynamic);
  })

  // Game ended
  socket.on('game over', function(data) {
    inGame = false;
    chat.newMessage(SERVER, "Game over");
    // Check if there is a single winner
    if (data.winner) {
      chat.newMessage(SERVER, "Winner: " + data.winner);
    } else { // If no winner, it's a draw
      chat.newMessage(SERVER, "Winner: NONE - it's a draw");
    }
    chat.newMessage(SERVER, "Click to start a new game");
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
  // Only emit to server if the player is in a lobby
  if (inLobby) {
    if (!inGame) {
      // Can start a game if there is no game going on right now
      socket.emit('start game');
    }

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
      textTarget.addChar(charToAdd)
    };
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
  if (inLobby) {
    gs.show(gameSize.x, gameSize.y, gameSize.z);
  } else {
    ss.update();
    ss.show();
  }

  if (inGame) {
    // Send the mouse position to the server to aim weapons
    var data = mouseToGamePos();
    socket.emit('update', data);
  }

  // Draw chat in the bottom left corner
  chat.show(20, height - 50);

  // Only show chat text box if it is selected
  if (textTarget == chatTextBox) {
    chatTextBox.show(20, height - 24, 200, 26);
  }

}
