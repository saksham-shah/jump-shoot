var express = require('express');
var app = express();
// Default port no. is 3000
var portNo = process.env.PORT || 3000;

var server = app.listen(portNo);

// Send files in the public folder to the client
app.use(express.static('public'));

console.log("Node server.js running on port " + portNo);

var socket = require('socket.io');

// Use websockets to communicate with clients
var io = socket(server);

var Lobby = require('./lobby.js');
var Command = require('./command.js');

var users = new Map();
var lobbies = [];
lobbies.push(new Lobby("lobby", "abc"));
lobbies.push(new Lobby("secret", "def"));

// Client connects
io.sockets.on('connection', newConnection);

function newConnection(socket) {
  console.log("new connection: " + socket.id);

  // Send confirmation message
  socket.emit('welcome');
  var userData = {
    name: null,
    lobbyid: null
  };
  users.set(socket.id, userData);

  // Client updates their name
  socket.on('pick name', function(name) {
    // Update user data to also save lobbyid
    var userData = users.get(socket.id);
    userData.name = name;
    users.set(socket.id, userData);
    // var userData = {
    //   name: name
    // }
    // users.set(socket.id, userData);
  })

  // Client joins a lobby - UNUSED
  // socket.on('join lobby', function(lobbyid) {
  //   var lobby = getLobbyFromId(lobbyid);
  //   var sendData = lobby.addPlayer(socket.id);
  //   socket.emit('joined lobby', sendData);
  //   socket.join(lobbyid);
  //   var userData = users.get(socket.id);
  //   userData.lobbyid = lobbyid;
  //   users.set(socket.id, userData);
  //
  //   socket.broadcast.to(lobby.lobbyid).emit('player joined', users.get(socket.id).name);
  // })

  // Client wants to force end a game - for debugging
  socket.on('force end', function(data) {
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    if (lobby) {
      lobby.game = null;
      var data = lobby.newGame();
      var room = lobby.lobbyid;
      // Restart a new game
      if (data) {
        io.in(room).emit('game start', data);
      }
    }
  })

  // New game starts
  socket.on('start game', function(data) {
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    if (lobby) {
      var data = lobby.newGame();
      var room = lobby.lobbyid;
      // Send game data to everyone in the lobby
      if (data) {
        io.in(room).emit('game start', data);
      }
    }
  })

  // The following three functions process user inputs (key and mouse presses, mouse movements)
  // Only process events if the player is in a lobby
  socket.on('update', function(data) {
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
      if (lobby) {
        lobby.updateMousePos(socket.id, data);
      }
  })

  socket.on('press', function(control) {
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    if (lobby) {
      lobby.keyPressed(socket.id, control);
    }
  })

  socket.on('release', function(control) {
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    if (lobby) {
      lobby.keyReleased(socket.id, control);
    }
  })

  // Probably the most important event - player types in a chat message
  // Also processes any chat commands
  socket.on('chat message', function(message) {
    var command = Command.getCommand(message);
    if (command) {
      switch (command.operator) {
        case "join":
          var lobby = getLobbyFromSocket(socket.id);
          // If player is already in a lobby, send an error message
          if (lobby) {
            var data = {
              sender: "_server",
              message: "You are already in a lobby"
            }
            socket.emit('chat message', data);
          } else { // if they aren't in a lobby already
            var lobby = getLobbyFromName(command.operand);
            if (lobby) {
              // If the lobby exists, add the player to it
              var sendData = lobby.addPlayer(socket.id);
              // Send player any data about the lobby
              socket.emit('joined lobby', sendData);
              // Add player to socket room
              socket.join(lobby.lobbyid);
              // Update user data to also save lobbyid
              var userData = users.get(socket.id);
              userData.lobbyid = lobby.lobbyid;
              users.set(socket.id, userData);
              // Notify players in the lobby
              socket.broadcast.to(lobby.lobbyid).emit('player joined', users.get(socket.id).name);
            } else {
              // If the lobby requested to join doesn't exist, send an error message
              var data = {
                sender: "_server",
                message: "Lobby does not exist"
              }
              socket.emit('chat message', data);
              // NOTE: in the future I'll make this command create a lobby if it doesn't already exist
            }
          }
          break;
        default:
        // Default error message if a command will be implemented later
        var data = {
          sender: "_server",
          message: "The command '" + command.operator + "' hasn't been implemented yet"
        }
        socket.emit('chat message', data);
      }
    } else {
      // If the message isn't a command, send it to all players in the lobby
      var lobby = getLobbyFromSocket(socket.id);
      if (lobby) {
        var data = {
          sender: users.get(socket.id).name,
          message: message
        }
        io.in(lobby.lobbyid).emit('chat message', data);
      }
    }
  })

  // Client disconnects
  socket.on('disconnect', function() {
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    if (lobby) {
      // Remove from lobby and notify players in the lobby
      lobby.removePlayer(socket.id);
      socket.broadcast.to(lobby.lobbyid).emit('player left', users.get(socket.id).name);
    }
    console.log("disconnect: " + socket.id);
  })

  // Returns the lobby that a particular player is in, or null if the player is not in a lobby
  function getLobbyFromSocket(socketid) {
    var userData = users.get(socketid);
    if (!userData) {
      console.log("Unlogged user: " + socketid);
      return null;
    }
    var lobbyid = userData.lobbyid;
    return getLobbyFromId(lobbyid);
  }

  // Searches for a lobby by id
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
}

// Update the game and send data to clients at 60 FPS
setInterval(updateGame, 1000 / 60);

function updateGame() {
  for (var i = 0; i < lobbies.length; i++) {
    var room = lobbies[i].lobbyid;
    var data = lobbies[i].update(users);
    if (data) {
      if (data.inGame) {
        // Send game data to players in the lobby
        io.in(room).emit('update', data.gameData);
      } else {
        // Send the winner to the players (if there is one)
        var sendData = {};
        if (data.winner) {
          sendData.winner = users.get(data.winner).name;
        }
        io.in(room).emit('game over', sendData);
      }
    }
  }
}
