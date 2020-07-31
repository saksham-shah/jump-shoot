var express = require('express');

var app = express();
// Default port no. is 3000
var portNo = process.env.PORT || 3000;

var server = app.listen(portNo);

var pendingConnections = 0;

app.get('/', (req, res) => {
  // Sends the file to the client
  res.sendFile('public/index.html', { root: __dirname });
  pendingConnections++;
});

// Send files in the public folder to the client
app.use(express.static('public'));

app.use(express.json());

console.log("Node server.js running on port " + portNo);

var socket = require('socket.io');

// Use websockets to communicate with clients
var io = socket(server);

var Lobby = require('./lobby.js');
var Command = require('./command.js');

var users = new Map();
var lobbies = [];

lobbies.push(new Lobby('Public 1', '', 4, false, { experimental: false }, true));
lobbies.push(new Lobby('Public 2', '', 8, false, { experimental: false }, true));
lobbies.push(new Lobby('Public 3', '', 16, false, { experimental: false }, true));
lobbies.push(new Lobby('Public 4', '', 8, false, { experimental: true }, true));
lobbies.push(new Lobby('Public 5', '', 16, false, { experimental: true }, true));
lobbies.push(new Lobby('secret', 'secret', 16, true, { experimental: true }, true));

// Client connects
io.sockets.on('connection', newConnection);

// Get the IP address of a client
// https://stackoverflow.com/questions/14382725/how-to-get-the-correct-ip-address-of-a-client-into-a-node-socket-io-app-hosted-o
function getClientIP(socket) {
  let ipAddress;
  // Amazon EC2 / Heroku workaround to get real client IP
  let forwardedIpsStr = socket.request.headers['x-forwarded-for']; 
  if (forwardedIpsStr && forwardedIpsStr != undefined) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    let forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
    console.log('x-forwarded-for');
  }
  if (!ipAddress) {
    // Ensure getting client IP address still works in
    // development environment
    ipAddress = socket.request.connection.remoteAddress;
    console.log('remoteAddress');
  }
  return ipAddress;
}

function newConnection(socket) {

  // if (pendingConnections <= 0) {
  //   socket.emit('duplicate');
  //   socket.disconnect();
  //   console.log('bad connection: ' + socket.id);
  //   return;
  // }

  pendingConnections--;

  console.log('new connection: ' + socket.id);

  console.log(`${getClientIP(socket)}`);

  // Send confirmation message
  socket.emit('welcome', socket.id);

  // Create the user object and add it to the map
  var userData = {
    name: null,
    lobbyname: null,
    pingSent: null
  };
  users.set(socket.id, userData);

  // Send a list of lobbies for the client to display
  socket.emit('lobbies updated', getLobbies());

  // Used to calculate ping
  socket.on('pongCheck', () => {
    // Difference between the response time and the time the ping message was sent
    let pingTime = Date.now() - users.get(socket.id).pingSent;

    var lobby = getLobbyFromSocket(socket.id);
    if (lobby) {
      lobby.statusChange(socket.id, { key: 'ping', value: pingTime }, () => {
        // Callback if the status change is accepted

        // Notify the other players of the change
        io.in(lobby.name).emit('status change', {
          playerid: socket.id,
          key: 'ping',
          value: pingTime
        });
      });
    }
  });

  // Client updates their name
  socket.on('pick name', name => {
    if (typeof name != 'string') {
      return;
    }
    updateName(socket, name);
  });

  // Client resets their name - UNUSED
  // socket.on('reset name', () => {
  //   var lobby = getLobbyFromSocket(socket.id);
  //   if (lobby) {
  //     console.log('Tried to reset name while in lobby: ' + socket.id);
  //   } else {
  //     var userData = users.get(socket.id);
  //     userData.name = null;
  //     users.set(socket.id, userData);
  //   }
  // })

  // Client joins a lobby
  socket.on('join lobby', joinReq => {
    if (!joinReq || typeof joinReq.name != 'string') return;
    joinLobby(socket, joinReq.name, joinReq.password);
  });

  // Client leaves their lobby
  socket.on('leave lobby', () => {
    leaveLobby(socket);
  });

  // Client creates a private lobby
  socket.on('create lobby', lobbyOptions => {
    if (!lobbyOptions) return;
    if (typeof lobbyOptions.name != 'string') return;
    if (typeof lobbyOptions.password != 'string') return;
    if (typeof lobbyOptions.maxPlayers != 'number') return;
    if (typeof lobbyOptions.unlisted != 'boolean') return;
    createLobby(socket, lobbyOptions);
  });

  // Client wants to force end a game - for debugging - UNUSED
  // socket.on('force end', function() {
  //   var lobby = getLobbyFromSocket(socket.id, users, lobbies);
  //   if (lobby) {
  //     lobby.game.inGame = false;
  //     // lobby.game = null;
  //     // var data = lobby.newGame();
  //     // var room = lobby.name;
  //     // // Restart a new game
  //     // if (data) {
  //     //   io.in(room).emit('game start', data);
  //     // }
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
  });

  socket.on('press', function(control) {
    if (!control) {
      return;
    }
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    if (lobby) {
      lobby.keyPressed(socket.id, control);
    }
  });

  socket.on('release', function(control) {
    if (!control) {
      return;
    }
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    if (lobby) {
      lobby.keyReleased(socket.id, control);
    }
  });

  // Player status change (e.g. typing, paused)
  socket.on('status change', function(change) {
    if (!change) return;
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    if (lobby) {
      lobby.statusChange(socket.id, change, () => {
        // Callback if the status change is accepted

        // Notify the other players of the change
        io.in(lobby.name).emit('status change', {
          playerid: socket.id,
          key: change.key,
          value: change.value
        });
      });
    }
  });

  // Player wants to toggle spectate
  socket.on('spectate', function() {
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    if (lobby) {
      lobby.spectate(socket.id, spectate => {
        // Callback if the spectate request is accepted

        // Notify the other players of the change
        io.in(lobby.name).emit('status change', {
          playerid: socket.id,
          key: 'spectate',
          value: spectate
        });
      }, err => {
        // Callback if the spectate request is rejected

        // sendServerMessage(socket.id, `Cannot spectate - ${err}`);
        socket.emit('game message', err);
      });
    }
  });

  // Player wants to change team
  socket.on('change team', function() {
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    if (lobby) {
      lobby.changeTeam(socket.id, team => {
        // Callback if the team change request is accepted

        // Notify the other players of the change
        io.in(lobby.name).emit('status change', {
          playerid: socket.id,
          key: 'team',
          value: team
        });
      }, err => {
        // Callback if the team change request is rejected

        socket.emit('game message', err);
      });
    }
  });

  // Player wants to change the lobby settings
  socket.on('new settings', function(settings) {
    if (!settings) return;
    var lobby = getLobbyFromSocket(socket.id, users, lobbies);
    if (lobby) {
      lobby.newSettings(socket.id, settings, newSettings => {
        // Callback if the new settings are accepted

        io.in(lobby.name).emit('new settings', newSettings);
        
        io.emit('lobbies updated', getLobbies());
      }, player => {
        // Callback if the number of teams has reduced so some players need to change teams

        // Notify the other players of the change
        io.in(lobby.name).emit('status change', {
          playerid: player.id,
          key: 'team',
          value: 0
        });

        // Notify the specfic player that they are the new host
        io.to(player.id).emit('game message', 'Teams reduced - you have automatically been assigned to a new team.');
      }, message => {
        // Callback if a message needs to be sent
        io.in(lobby.name).emit('game message', message);
      });
    }
  });

  // Player types in a chat message
  // Also processes any chat commands - probably the most important event
  // Note from the future: Not anymore
  socket.on('chat message', function(message) {
    if (!message || typeof message != 'string') {
      return;
    }

    // Send the message to all players in the lobby
    var lobby = getLobbyFromSocket(socket.id);
    if (lobby) {
      var data = {
        sender: users.get(socket.id).name,
        message: message
      }
      io.in(lobby.name).emit('chat message', data);
    }
    return;

    // Chat commands have now been removed
  });

  // Client disconnects
  socket.on('disconnect', function() {
    leaveLobby(socket);
    console.log("disconnect: " + socket.id);
    // users.delete(socket.id);
    removePlayerAfterTimeout(socket.id);
  });
}

function removePlayerAfterTimeout(socketid) {
  setTimeout(id => { users.delete(id) }, 1000, socketid);
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
    // Don't send details of unlisted lobbies
    if (!lobby.unlisted) {
      var players = [];
      for (var player of lobby.players.keys()) {
        players.push({
          name: users.get(player).name
        });
      }

      lobbyObjects.push({
        name: lobby.name,
        players: players,
        experimental: lobby.settings.experimental,
        maxPlayers: lobby.maxPlayers,
        password: lobby.password != ''
      });
    }
  }
  return lobbyObjects;
}

// Adds a player to a lobby
function joinLobby(socket, lobbyname, password) {
  var userData = users.get(socket.id);
  if (!userData) {
    console.log("Unlogged user: " + socket.id);
    return false;
  }
  if (!userData.name) {
    console.log("User hasn't picked name: " + socket.id);
    return false;
  }
  var lobby = getLobbyFromSocket(socket.id);
  // If player is already in a lobby, send an error message
  if (lobby) {
    sendServerMessage(socket.id, "You are already in a lobby");
    return false;
  }
  var lobby = getLobbyFromName(lobbyname);
  if (lobby) {
    // If the lobby exists, check if the player can be added
    var joinResult = lobby.joinAttempt(password);
    if (joinResult != 'success') {
      socket.emit('join error', lobbyname, joinResult);
      return false;
    }

    // If the lobby accepts the player, add the player to it
    var sendData = lobby.addPlayer(socket.id, userData.name);
    // Send player any data about the lobby
    socket.emit('joined lobby', sendData);
    // Add client to socket room
    socket.join(lobby.name);
    // Update user data to also save lobbyname
    userData.lobbyname = lobby.name;
    users.set(socket.id, userData);
    // Notify players in the lobby
    socket.broadcast.to(lobby.name).emit('player joined', { id: socket.id, name: userData.name });
    io.emit('lobbies updated', getLobbies());
    return true;
  }
  socket.emit('error message', 'Lobby does not exist');
  return false;
}

function createLobby(socket, lobbyOptions) {
  var lobby = getLobbyFromSocket(socket.id);
  // If player is already in a lobby, send an error message
  if (lobby) {
    sendServerMessage(socket.id, 'You are already in a lobby');
    return false;
  } else {
    // If they aren't in a lobby already
    let validName = validateName(lobbyOptions.name, 20);
    if (validName.length == 0) {
      // Name is invalid
      socket.emit('error message', 'Invalid name');
      return false;
  }

    for (var lobby of lobbies) {
      if (lobby.name == validName) {
        socket.emit('error message', 'Lobby name is taken');
        return false;
      }
    }

    lobbies.push(new Lobby(validName, lobbyOptions.password, lobbyOptions.maxPlayers, lobbyOptions.unlisted, { experimental: true }));

    // Once the lobby is created, add the client to it
    if (joinLobby(socket, validName, lobbyOptions.password)) {
      return true;
    }
  }
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
    lobby.removePlayer(socket.id, player => {
      // Callback if everyone is currently spectating so one player needs to be forced into not spectating

      // Notify the other players of the change
      io.in(lobby.name).emit('status change', {
        playerid: player.id,
        key: 'spectate',
        value: false
      });

      // Notify the specfic player that they are no longer spectating
      io.to(player.id).emit('game message', 'Last non-spectator left, you are no longer spectating.');
    }, player => {
      // Callback if the host left so a new host has been chosen

      // Notify the other players of the change
      io.in(lobby.name).emit('new host', player.id);

      // Notify the specfic player that they are the new host
      io.to(player.id).emit('game message', 'Host left, you are the new host.');
    });

    // Notify players in the lobby
    socket.broadcast.to(lobby.name).emit('player left', socket.id);
    io.emit('lobbies updated', getLobbies());
    return true;
  }
  sendServerMessage(socket.id, 'You are not currently in a lobby');
  return false;
}

// Validates and updates the player's name
function updateName(socket, name) {
    var lobby = getLobbyFromSocket(socket.id);
    if (lobby) {
        sendServerMessage(socket.id, 'You cannot change your name while in a lobby');
        return false;
    }
    // Validate the name (max character length is 20)
    var validName = validateName(name, 20);
    if (validName.length == 0) {
        // Name is invalid
        socket.emit('error message', 'Invalid name');
        return false;
    }
    // Update user data to also save name
    var userData = users.get(socket.id);
    userData.name = validName;
    users.set(socket.id, userData);
    // Tell the user that their name has been updated
    socket.emit('name updated', validName);
    return true;
}

// Filters out non-alphanumeric characters (keeps spaces)
function validateName(word, maxChars) {
  var output = "";
  // A regular expression that matches with all upper and lower case alphabet letters and numbers
  var lettersRegex = /^[a-zA-Z0-9]+$/;
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
      // Remove last character if it is a space
      if (output[output.length - 1] == " ") {
        // New substring without last characer
        output = output.substring(0, output.length - 1);
      }
      return output;
    }
  }

  // Remove last character if it is a space
  if (output[output.length - 1] == " ") {
    // New substring without last characer
    output = output.substring(0, output.length - 1);
  }
  return output;
}

// Update the game and send data to clients at 60 FPS
setInterval(updateGame, 1000 / 60);

function updateGame() {
  // Remove empty lobbies
  var deleted = false;
  for (var i = lobbies.length - 1; i >= 0; i--) {
    var lobby = lobbies[i];
    // Delete lobby if it is empty and not permanent
    if (lobby.players.size == 0 && !lobby.permanent) {
      lobbies.splice(i, 1);
      deleted = true;
    }
  }

  if (deleted) io.emit('lobbies updated', getLobbies());

  for (var i = 0; i < lobbies.length; i++) {
    var room = lobbies[i].name;
    var data = lobbies[i].update();

    for (var [playerid, player] of lobbies[i].players.entries()) {
      if (player.timeLeft == 600) {
        io.to(playerid).emit('game message', 'You are idle. Move or you will be kicked in 10 seconds!');
      } else if (player.timeLeft <= 0) {
        leaveLobby(io.sockets.connected[playerid]);
        io.to(playerid).emit('alert', 'Kicked!', 'You were kicked because you were idle for too long!');
      }
    }

    if (data) {
      if (data.type !== 'endGame') {
        // Send game data to players in the lobby
        io.in(room).emit('update', data);
      } else {
        io.in(room).emit('game over', data);
      }

      // Send particle and sound effects to players in the lobby
      var { particles, sounds } = lobbies[i].getEffects();
      if (particles.length > 0) {
        io.in(room).emit('new particles', particles);
      }

      if (sounds.length > 0) {
        io.in(room).emit('new sounds', sounds);
      }
    }
  }
}

// Update player pings every 2 seconds
setInterval(updatePing, 2000);

function updatePing() {
  for (var i = 0; i < lobbies.length; i++) {
    for (var playerid of lobbies[i].players.keys()) {
      io.to(playerid).emit('pingCheck');

      // Update the last time that a ping was sent
      users.get(playerid).pingSent = Date.now();
    }
  }
}
