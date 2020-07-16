var socket = require('socket.io');

var Game = require('./game.js');

// Game room where players can play the game
class Lobby {
  constructor(name, password, maxPlayers, unlisted, settings = {}, permanent = false) {
    this.name = name;
    this.password = password;
    this.permanent = permanent;
    this.unlisted = unlisted;
    this.settings = settings;

    if (this.settings.experimental == undefined) this.settings.experimental = false;
    if (this.settings.mass == undefined) this.settings.mass = 1;
    if (this.settings.bounceChance == undefined) this.settings.bounceChance = 0.25;
    // this.experimental = experimental;

    this.maxPlayers = maxPlayers;
    this.players = new Map();
    this.gameCountdown = -1;
    this.game = null;
    this.host = null;

    this.currentStreak = 0;
    this.lastWinner = null;
    this.scoreOrder = [];

    this.freeColours = [];
  }

  joinAttempt(password) {
    if (this.players.size >= this.maxPlayers) return 'lobby full';
    if (this.password != '') {
      if (password == undefined) return 'password needed';
      if (password != this.password) return 'password incorrect';
    }
    return 'success';
  }

  addPlayer(socketid, name) {
    let colour;
    if (this.freeColours.length > 0) {
      colour = this.freeColours.shift();
    } else {
      colour = this.players.size;
    }

    this.players.set(socketid, { id: socketid, name, colour, score: 0, streak: 0, ping: 0, spectate: false, timeLeft: 10800, typing: false, paused: false });
    this.scoreOrder.push(socketid);

    // Check if a host is needed
    if (this.host == null) {
      this.host = socketid;
    }

    // Send data to the client
    var data = {
      name: this.name,
      myid: socketid,
      // scoreboard: this.players,
      host: this.host,
      players: this.playersArray(),
      scoreboard: this.scoreboard(),
      lastWinner: this.lastWinner,
      streak: this.currentStreak,
      settings: this.settings
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

  removePlayer(socketid, newSpectatorCallback, newHostCallback) {
    if (this.game) {
      // Remove the player from an ongoing game
      this.game.queueRemovePlayer(socketid);
    }
    this.freeColours.push(this.players.get(socketid).colour);
    this.freeColours.sort((a, b) => a - b);
    this.players.delete(socketid);

    // Check if it was the host;
    if (this.host == socketid) {
      this.host = null;
    }

    if (this.players.size > 0) {
      let player = this.players.values().next().value;
      if (this.getNonSpectators() == 0) {
        player.spectate = false;
        newSpectatorCallback(player);
      }

      if (this.host == null) {
        this.host = player.id;
        newHostCallback(player);
      }
    }

    for (let i = 0; i < this.scoreOrder.length; i++) {
      if (this.scoreOrder[i] == socketid) {
        this.scoreOrder.splice(i, 1);
        return;
      }
    }
  }

  newGame() {
    if (!this.game) {
      this.game = new Game(this.players, this.settings);
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

  statusChange(playerid, change, changeCallback) {
    switch (change.key) {
      case 'ping':
        if (typeof change.value != 'number') return;
        break;
      case 'paused':
        if (typeof change.value != 'boolean') return;
        break;
      case 'typing':
        if (typeof change.value != 'boolean') return;
        break;
      default:
        return;
    }

    var player = this.players.get(playerid);
    player[change.key] = change.value;
    changeCallback();
  }

  spectate(playerid, success, failure) {
    let player = this.players.get(playerid);
    let wasSpectating = player.spectate;

    // if (wasSpectating) {
    //   player.spectate = false;
    //   success(false);
    // }

    if (!wasSpectating && this.getNonSpectators() == 1) {
      failure('At least one player must be playing.');
      return;
    }

    player.spectate = !wasSpectating;
    success(!wasSpectating);
  }

  getNonSpectators() {
    let total = 0;
    for (let player of this.players.values()) {
      if (!player.spectate) total++;
    }
    return total;
  }

  newSettings(playerid, settings = {}, newSettingsCallback) {
    if (playerid != this.host) return;
    if (typeof settings.experimental != 'boolean') return;
    if (typeof settings.mass != 'number') return;
    if (typeof settings.bounceChance != 'number') return;

    if (settings.mass > 2) settings.mass = 2;
    if (settings.mass < 0.25) settings.mass = 0.25;
    if (settings.bounceChance > 1) settings.bounceChance = 1;
    if (settings.bounceChance < 0) settings.bounceChance = 0;

    settings.mass = Math.round(settings.mass / 0.25) * 0.25;
    settings.bounceChance = Math.round(settings.bounceChance / 0.25) * 0.25;

    this.settings = settings;
    newSettingsCallback(this.settings);
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

          this.lastWinner = winner;
        // } else {
        //   this.currentStreak = 0;
        }

        // this.lastWinner = winner;

        // Next game starts in 90 frames
        this.gameCountdown = 90;
        return {
          type: 'endGame',
          winner: winner,
          // scoresMap: this.players,
          players: this.playersArray(),
          scoreboard: this.scoreboard(),
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
          if (!player.spectate) player.timeLeft--;
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
        colour: player.colour,
        score: player.score,
        streak: player.streak,
        ping: player.ping,
        spectate: player.spectate,
        typing: player.typing,
        paused: player.paused
      });
    }
    return array;
  }

  scoreboard() {
    let scoreboard = [];
    for (let id of this.scoreOrder) {
      let player = this.players.get(id);
      scoreboard.push({
        name: player.name,
        score: player.score
      });
    }

    return scoreboard;
  }

  getEffects() {
    if (this.game) {
      return this.game.getEffects();
    }
    return { particles: [], sounds: [] };
  }
}

module.exports = Lobby;
