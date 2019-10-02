var express = require('express');
// var routes = require('./routes.js');

var app = express();
// Default port no. is 3000
var portNo = process.env.PORT || 3000;

var server = app.listen(portNo);

var pendingConnections = 0;

app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: __dirname });
  pendingConnections++;
  console.log(pendingConnections);
});

// Send files in the public folder to the client
app.use(express.static('public'));
app.use(express.json());

// app.get('/:lobbyId', (req, res) => {
//   res.sendFile('public/index.html', { root: __dirname });
// });

// routes(app, express);

console.log("Node server.js running on port " + portNo);

var socket = require('socket.io');

// Use websockets to communicate with clients
var io = socket(server);

var Lobby = require('./lobby.js');
var Command = require('./command.js');

var users = new Map();
var lobbies = [];
lobbies.push(new Lobby('Public 1', true));
lobbies.push(new Lobby('Public 2', true));
lobbies.push(new Lobby('Public 3', true));
lobbies.push(new Lobby('Public 4', true));
lobbies.push(new Lobby('Public 5', true));

// Client connects
io.sockets.on('connection', newConnection);

function newConnection(socket) {

  if (pendingConnections <= 0) {
    socket.emit('duplicate');
    socket.disconnect();
    console.log('bad connection: ' + socket.id);
    return;
  }
  
  pendingConnections--;

  console.log('new connection: ' + socket.id);
  console.log(socket.conn.remoteAddress);

  // Check for duplicate connections from the same IP address - DOES NOT WORK
  // var thisIp = socket.conn.remoteAddress;
  // var duplicate = false;
  // for (var user of users.values()) {
  //   if (user.ip == thisIp) {
  //     socket.emit('duplicate');
  //     console.log('duplicate: ' + socket.id);
  //     duplicate = true;
  //   }
  // }

  // Send confirmation message
  socket.emit('welcome', socket.id);
  var userData = {
    name: null,
    lobbyname: null
  };
  users.set(socket.id, userData);

  //Debug data
  // console.log(socket);
  // socket.emit('debug', socket.conn.remoteAddress);

  // Send a list of lobbies for the client to display
  socket.emit('lobbies updated', getLobbies());

  // Client updates their name
  socket.on('pick name', function(name) {
    if (!name) {
      return;
    }
    if (updateName(socket.id, name)) {
      // Tell the user that their name has been updated
      socket.emit('name updated', users.get(socket.id).name);
    } else {
      // Tell the user their name was invalid
      sendServerMessage(socket.id, "Invalid name");
    }
  })

  // Client joins a lobby
  socket.on('join lobby', lobbyname => {
    var lobby = getLobbyFromSocket(socket.id);
    // If player is already in a lobby, send an error message
    if (lobby) {
      sendServerMessage(socket.id, 'You are already in a lobby');
    } else if (!joinLobby(socket, lobbyname)) { // if they aren't in a lobby already
        sendServerMessage(socket.id, 'Lobby does not exist');
    }
  })

  // Client leaves their lobby
  socket.on('leave lobby', () => {
    if (!leaveLobby(socket)) {
      sendServerMessage(socket.id, 'You are not currently in a lobby');
    }
  })

  // Client creates a private lobby
  socket.on('create lobby', () => {
    var lobby = getLobbyFromSocket(socket.id);
    // If player is already in a lobby, send an error message
    if (lobby) {
      sendServerMessage(socket.id, 'You are already in a lobby');
    } else { // if they aren't in a lobby already
      // Create a random 6 character code
      const codeChars = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
      var code = '';
      for (var i = 0; i < 6; i++) {
        code += codeChars[Math.floor(Math.random() * codeChars.length)];
      }

      lobbies.push(new Lobby(code, false));
      // Once the lobby is created, add the client to it
      if (joinLobby(socket, code)) {
        sendServerMessage(socket.id, `Others can join using '/join ${code}'`);
      }
    }
  })

  // Client wants to force end a game - for debugging
  socket.on('force end', function() {
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    if (lobby) {
      lobby.game = null;
      var data = lobby.newGame();
      var room = lobby.name;
      // Restart a new game
      if (data) {
        io.in(room).emit('game start', data);
      }
    }
  })

  // New game starts
  // socket.on('start game', function() {
  //   var lobby = getLobbyFromSocket(socket.id, users, lobbies);
  //   if (lobby) {
  //     var data = lobby.newGame();
  //     var room = lobby.name;
  //     // Send game data to everyone in the lobby
  //     if (data) {
  //       io.in(room).emit('game start', data);
  //     }
  //   }
  // })

  // The following three functions process user inputs (key and mouse presses, mouse movements)
  // Only process events if the player is in a lobby
  socket.on('update', function(data) {
    if (!data) {
      return;
    }
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    if (lobby) {
      lobby.updateMousePos(socket.id, data);
    }
  })

  socket.on('press', function(control) {
    if (!control) {
      return;
    }
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    if (lobby) {
      lobby.keyPressed(socket.id, control);
    }
  })

  socket.on('release', function(control) {
    if (!control) {
      return;
    }
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    if (lobby) {
      lobby.keyReleased(socket.id, control);
    }
  })

  // Player types in a chat message
  // Also processes any chat commands - probably the most important event
  socket.on('chat message', function(message) {
    if (!message) {
      return;
    }
    var command = Command.getCommand(message);
    if (command) {
      switch (command.operator) {
        case "join":
          var lobby = getLobbyFromSocket(socket.id);
          // If player is already in a lobby, send an error message
          if (lobby) {
            sendServerMessage(socket.id, "You are already in a lobby");
          } else if (!joinLobby(socket, command.operand)) { // if they aren't in a lobby already
              // If the lobby requested to join doesn't exist, send an error message
              sendServerMessage(socket.id, "Lobby does not exist");
          }
          break;
        case "leave":
          if (!leaveLobby(socket)) {
            sendServerMessage(socket.id, "You are not currently in a lobby");
          }
          break;
        case "name":
          var lobby = getLobbyFromSocket(socket.id);
          if (!lobby) {
            if (updateName(socket.id, command.operand)) {
              // Tell the user that their name has been updated
              var newName = users.get(socket.id).name;
              socket.emit('name updated', newName);
              sendServerMessage(socket.id, "Name changed to " + newName);
            } else {
              // Tell the user their name was invalid
              sendServerMessage(socket.id, "Invalid name");
            }
          } else {
            // You can only change name if you aren't in a lobby
            sendServerMessage(socket.id, "You can't change your name while in a lobby");
          }
          break;
        default:
        // Default error message if a command will be implemented later
        sendServerMessage(socket.id, "The command '" + command.operator + "' hasn't been implemented yet");
      }
    } else {
      // If the message isn't a command, send it to all players in the lobby
      var lobby = getLobbyFromSocket(socket.id);
      if (lobby) {
        var data = {
          sender: users.get(socket.id).name,
          message: message
        }
        io.in(lobby.name).emit('chat message', data);
      }
    }
  })

  // Client disconnects
  socket.on('disconnect', function() {
    leaveLobby(socket);
    console.log("disconnect: " + socket.id);
    users.delete(socket.id);
  })
}

// Returns the lobby that a particular player is in, or null if the player is not in a lobby
function getLobbyFromSocket(socketid) {
  var userData = users.get(socketid);
  if (!userData) {
    console.log("Unlogged user: " + socketid);
    return null;
  }
  var lobbyname = userData.lobbyname;
  return getLobbyFromName(lobbyname);
}

// Searches for a lobby by id - unused (?)
function getLobbyFromId(lobbyid) {
  for (var i = 0; i < lobbies.length; i++) {
    if (lobbies[i].lobbyid === lobbyid) {
      return lobbies[i];
    }
  }
  return null;
}

// Searches for a lobby by name
function getLobbyFromName(lobbyname) {
  for (var i = 0; i < lobbies.length; i++) {
    if (lobbies[i].name === lobbyname) {
      return lobbies[i];
    }
  }
  return null;
}

// Sends a server message to a player
function sendServerMessage(socketid, message) {
  var data = {
    sender: "_server",
    message: message
  }
  io.to(`${socketid}`).emit('chat message', data);
}

// Gets the status of all current lobbies
function getLobbies() {
  var lobbyObjects = [];
  for (var lobby of lobbies) {
    // Only sends details of public lobbies
    if (lobby.publicLobby) {
      var players = [];
      for (var player of lobby.players.keys()) {
        players.push({
          name: users.get(player).name
        });
      }

      lobbyObjects.push({
        name: lobby.name,
        players: players,
        maxPlayers: lobby.maxPlayers
      });
    }
  }
  return lobbyObjects;
}

// Adds a player to a lobby
function joinLobby(socket, lobbyname) {
  var userData = users.get(socket.id);
  if (!userData) {
    console.log("Unlogged user: " + socket.id);
    return false;
  }
  if (!userData.name) {
    console.log("User hasn't picked name: " + socket.id);
    return false;
  }
  var lobby = getLobbyFromName(lobbyname);
  if (lobby) {
    // If the lobby exists, add the player to it
    var sendData = lobby.addPlayer(socket.id);
    // Send player any data about the lobby
    socket.emit('joined lobby', sendData);
    // Add client to socket room
    socket.join(lobby.name);
    // Update user data to also save lobbyname
    // var userData = users.get(socket.id);
    userData.lobbyname = lobby.name;
    users.set(socket.id, userData);
    // Notify players in the lobby
    socket.broadcast.to(lobby.name).emit('player joined', users.get(socket.id).name);
    io.emit('lobbies updated', getLobbies());
    return true;
  }
  return false;
}

// Removes a player from a lobby
function leaveLobby(socket) {
  var lobby = getLobbyFromSocket(socket.id);
  if (lobby) {
    // Tell player they have left the lobby
    socket.emit('left lobby');
    // Remove client from socket room
    socket.leave(lobby.name);
    // Update user data
    var userData = users.get(socket.id);
    userData.lobbyname = null;
    users.set(socket.id, userData);
    // Remove from lobby
    lobby.removePlayer(socket.id);
    // Delete lobby if it is empty
    if (lobby.players.size == 0) {
      for (var i = 0; i < lobbies.length; i++) {
        if (lobbies[i] === lobby && !lobby.publicLobby) {
          lobbies.splice(i, 1);
          return true;
        }
      }
    }
    // Notify players in the lobby
    socket.broadcast.to(lobby.name).emit('player left', users.get(socket.id).name);
    io.emit('lobbies updated', getLobbies());
    return true;
  }
  return false;
}

// Validates and updates the players name
function updateName(socketid, name) {
  // Validate the name
  var validName = lettersOnly(name, 12);
  if (validName.length == 0) {
    // Name is invalid
    return false;
  }
  // Update user data to also save name
  var userData = users.get(socketid);
  userData.name = validName;
  users.set(socketid, userData);
  return true;
}

// Filters out non-alphabet characters (keeps spaces)
function lettersOnly(word, maxChars) {
  var output = "";
  // A regular expression that matches with all upper and lower case alphabet letters
  var lettersRegex = /^[a-zA-Z]+$/;
  for (var i = 0; i < word.length; i++) {
    var letter = word[i];
    // Can't begin the text with a space
    if (letter == " " && output.length > 0) {
      // No more than two spaces in a row
      if (output[output.length - 1] != " ") {
        output += " ";
      }
    } else if (letter.match(lettersRegex)) {
      output += letter;
    }
    // The text can't be longer than the max length
    if (output.length == maxChars) {
      return output;
    }
  }
  return output;
}

// Update the game and send data to clients at 60 FPS
setInterval(updateGame, 1000 / 60);

function updateGame() {
  for (var i = 0; i < lobbies.length; i++) {
    var room = lobbies[i].name;
    var data = lobbies[i].update(users);
    if (data) {
      if (data.type !== 'endGame') {
        // Send game data to players in the lobby
        io.in(room).emit('update', data);
      } else {
        // Send the winner to the players (if there is one) as well as the scoreboard
        var sendData = {
          scoreboard: []
        };
        if (data.winner) {
          sendData.winner = users.get(data.winner).name;
          sendData.winnerId = data.winner
        }
        for (var [id, scoreObj] of data.scoresMap) {
          sendData.scoreboard.push({
            name: users.get(id).name,
            score: scoreObj.score
          })
        }
        io.in(room).emit('game over', sendData);
      }
      var particleExplosions = lobbies[i].getParticles();
      if (particleExplosions.length > 0) {
        io.in(room).emit('new particles', particleExplosions);
      }
    }
  }
}
