var socket = require('socket.io');

var Game = require('./game.js');

// Game room where players can play the game
class Lobby {
  constructor(name, publicLobby) {
    this.name = name;
    this.publicLobby = publicLobby;
    this.maxPlayers = 4;
    this.players = new Map();
    this.gameCountdown = -1;
    this.game = null;
  }

  addPlayer(socketid) {
    this.players.set(socketid, { score: 0 });
    // Send data to the client
    var data = {
      name: this.name,
      myid: socketid,
      scoreboard: this.players
    }
    // Send game data so newly connected players can watch the ongoing game
    if (this.game) {
      data.gameinfo = {
        width: this.game.width,
        height: this.game.height,
        platforms: this.game.staticToSend,
        bulletBounce: this.game.bulletBounce
      }
    }
    return data;
  }

  removePlayer(socketid) {
    if (this.game) {
      // Remove the player from an ongoing game
      this.game.removePlayer(socketid);
    }
    this.players.delete(socketid);
  }

  newGame() {
    if (!this.game) {
      this.game = new Game(this.players);
      var data = this.game.startGame();
      data.type = 'startGame';
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
      if (!this.game.inGame && this.gameCountdown < 0) {
        // If a game has just ended this update cycle
        var winner = this.game.winner;
        var winnerObj = this.players.get(winner);
        if (winnerObj) {
          winnerObj.score++;
          this.players.set(winner, winnerObj);
        }

        // Next game starts in 1 second
        this.gameCountdown = 60;
        return {
          type: 'endGame',
          winner: winner,
          scoresMap: this.players
        }
      } else if (this.gameCountdown == 0) {
        // If a game ended and the 'next game' countdown is over
        this.game = null;
        this.gameCountdown = -1;
      } else {
        // Otherwise, the game is ongoing as usual
        this.gameCountdown--;
        var objects = this.game.update(users);
        return {
          type: 'updateGame',
          entities: objects[0],
          players: objects[1]
        };
      }
    }

    // Only need to start a new game if there are players in the lobby
    if (this.players.size > 0) {
      var data = this.newGame();
      data.type = 'startGame';
      return data;
    }
    return null;
  }

  getParticles() {
    if (this.game) {
      return this.game.getParticles();
    }
    return [];
  }
}

module.exports = Lobby;
