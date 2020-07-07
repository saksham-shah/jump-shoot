var socket = require('socket.io');

var Game = require('./game.js');

// Game room where players can play the game
class Lobby {
  constructor(name, publicLobby, experimental = false, info = '') {
    this.name = name;
    this.publicLobby = publicLobby;
    this.experimental = experimental;
    this.info = info;

    this.maxPlayers = 4;
    this.players = new Map();
    this.gameCountdown = -1;
    this.game = null;

    this.currentStreak = 0;
    this.lastWinner = null;
    this.scoreOrder = [];
  }

  addPlayer(socketid, name) {
    this.players.set(socketid, { name, score: 0, streak: 0, ping: 0, timeLeft: 10800, typing: false, paused: false });
    this.scoreOrder.push(socketid);
    // Send data to the client
    var data = {
      name: this.name,
      myid: socketid,
      // scoreboard: this.players,
      players: this.playersArray(),
      lastWinner: this.lastWinner,
      streak: this.currentStreak
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
      this.game.queueRemovePlayer(socketid);
    }
    this.players.delete(socketid);

    for (let i = 0; i < this.scoreOrder.length; i++) {
      if (this.scoreOrder[i] == socketid) {
        this.scoreOrder.splice(i, 1);
        return;
      }
    }
  }

  newGame() {
    if (!this.game) {
      this.game = new Game(this.players, this.experimental);
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

      // Update player's idle time
      var player = this.players.get(playerid);
      player.timeLeft = 10800; // 3 minutes
    }
  }

  keyReleased(playerid, control) {
    if (this.game) {
      this.game.keyReleased(playerid, control);
    }
  }

  statusChange(playerid, change) {
    var player = this.players.get(playerid);
    player[change.key] = change.value;
  }

  // Update the game state
  update() {

    if (this.game) {
      if (!this.game.inGame && this.gameCountdown < 0) {
        // If a game has just ended this update cycle
        var winner = this.game.winner;
        var winnerObj = this.players.get(winner);
        if (winnerObj) {
          winnerObj.score++;

          // Reorder scoreboard
          let i = this.scoreOrder.length - 1;
          while (i >= 0) {
            if (this.scoreOrder[i] == winner) {
              this.scoreOrder.splice(i, 1);
              do {
                i--;
              } while (i >= 0 && this.players.get(this.scoreOrder[i]).score < winnerObj.score);

              this.scoreOrder.splice(i + 1, 0, winner);
              i = 0;
            }
            i--;
          }

          if (winner == this.lastWinner) {
            this.currentStreak++;
          } else {
            this.currentStreak = 1;
          }

          if (winnerObj.streak < this.currentStreak) winnerObj.streak = this.currentStreak;
        } else {
          this.currentStreak = 0;
        }

        this.lastWinner = winner;

        // Next game starts in 90 frames
        this.gameCountdown = 90;
        return {
          type: 'endGame',
          winner: winner,
          // scoresMap: this.players,
          players: this.playersArray(),
          streak: this.currentStreak
        }
      } else if (this.gameCountdown == 0) {
        // If a game ended and the 'next game' countdown is over
        this.game = null;
        this.gameCountdown = -1;
      } else {
        // Otherwise, the game is ongoing as usual
        this.gameCountdown--;
        // var { entities, players, nextWeaponX } = this.game.update();
        var data = this.game.update();
        data.type = 'updateGame';

        // Increment idle time of all alive players
        for (var playerid of this.game.players.keys()) {
          var player = this.players.get(playerid);
          player.timeLeft--;
        }

        return data;
        // return {
        //   type: 'updateGame',
        //   entities: entities,
        //   players: players,
        //   nextWeaponX: nextWeaponX
        // };
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

  playersArray() {
    let array = [];
    for (let id of this.scoreOrder) {
      let player = this.players.get(id);
      array.push({
        id,
        name: player.name,
        score: player.score,
        streak: player.streak,
        ping: player.ping,
        typing: player.typing,
        paused: player.paused
      });
    }
    return array;
  }

  getEffects() {
    if (this.game) {
      return this.game.getEffects();
    }
    return { particles: [], sounds: [] };
  }
}

module.exports = Lobby;
