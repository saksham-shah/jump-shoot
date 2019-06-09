var socket = require('socket.io');

var Game = require('./game.js');

// Game room where players can play the game
class Lobby {
  constructor(name, lobbyid, maxPlayers) {
    this.name = name;
    this.lobbyid = lobbyid;
    this.maxPlayers = 4;
    this.players = [];
  }

  addPlayer(socketid) {
    this.players.push(socketid);
    // Send data to the client
    var data = {
      name: this.name,
      lobbyid: this.lobbyid,
      myid: socketid
    }
    // Send game data so newly connected players can watch the ongoing game
    if (this.game) {
      data.gameinfo = {
        width: this.game.width,
        height: this.game.height,
        platforms: this.game.statics
      }
    }
    return data;
  }

  removePlayer(socketid) {
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i] === socketid) {
        if (this.game) {
          // Remove the player from an ongoing game
          this.game.disconnectPlayer(socketid);
        }
        this.players.splice(i, 1);
        i--;
      }
    }
  }

  newGame() {
    if (!this.game) {
      this.game = new Game(this.players);
      var data = this.game.startGame();
      return data;
    }
  }

  // The following three functions process user inputs (key and mouse presses, mouse movements)
  // Only process events if a game is ongoing
  updateMousePos(playerid, mousePos) {
    if (this.game) {
      this.game.updateMousePos(playerid, mousePos);
    }
  }

  keyPressed(playerid, control) {
    if (this.game) {
      this.game.keyPressed(playerid, control);
    }
  }

  keyReleased(playerid, control) {
    if (this.game) {
      this.game.keyReleased(playerid, control);
    }
  }

  // Update the game state
  update(users) {
    if (this.game) {
      if (this.game.inGame) {
        return {
          inGame: true,
          gameData: this.game.update(users)
        }
      } else {
        // Send winner data to the players
        var winData = {
          winner: this.game.winner
        }
        var winner = this.game.winner;
        // End the game
        this.game = null;
        return {
          inGame: false,
          winner: winner
        }
      }
    }
    return null;
  }
}

module.exports = Lobby;
