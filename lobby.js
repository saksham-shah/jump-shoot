var socket = require('socket.io');

var Game = require('./game.js');

const teamNames = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Cyan', 'Grey'];

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
    if (this.settings.teams == undefined) this.settings.teams = false;
    if (this.settings.numTeams == undefined) this.settings.numTeams = 2;
    // this.experimental = experimental;

    this.maxPlayers = maxPlayers;
    this.players = new Map();
    this.gameCountdown = -1;
    this.game = null;
    this.host = null;

    this.currentStreak = 0;
    this.lastWinner = null;
    this.scoreOrder = [];

    this.teams = [];
    for (let i = 0; i < 4; i++) {
      this.teams.push({
        score: 0,
        players: []
      });
    }
    this.teamOrder = [];

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

    this.players.set(socketid, { id: socketid, name, colour, team: 0, score: 0, streak: 0, ping: 0, spectate: false, timeLeft: 10800, typing: false, paused: false });
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
      scoreboard: this.scoreboard(this.settings.teams),
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
      for (let team of this.teams) {
        team.players = [];
      }

      // Record which players are on each team in this game
      for (let player of this.players.values()) {
        if (player.spectate) continue;

        this.teams[player.team].players.push(player.id);
      }

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
      failure('Cannot spectate - At least one player must be playing.');
      return;
    }

    // Reset the idle timer
    if (!wasSpectating) {
      player.timeLeft = 10800;
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

  changeTeam(playerid, success, failure) {
    if (!this.settings.teams) {
      failure('Teams are disabled.');
      return;
    }

    let player = this.players.get(playerid);
    let previousTeam = player.team;
    player.team = (previousTeam + 1) % this.settings.numTeams;

    success(player.team);
  }

  newSettings(playerid, settings = {}, newSettingsCallback, teamChangeCallback, messageCallback) {
    if (playerid != this.host) return;
    if (typeof settings.experimental != 'boolean') return;
    if (typeof settings.mass != 'number') return;
    if (typeof settings.bounceChance != 'number') return;
    if (typeof settings.teams != 'boolean') return;
    if (settings.teams && typeof settings.numTeams != 'number') return;

    if (settings.mass < 0.25) settings.mass = 0.25;
    if (settings.mass > 2) settings.mass = 2;
    if (settings.bounceChance < 0) settings.bounceChance = 0;
    if (settings.bounceChance > 1) settings.bounceChance = 1;

    settings.mass = Math.round(settings.mass / 0.25) * 0.25;
    settings.bounceChance = Math.round(settings.bounceChance / 0.25) * 0.25;

    this.settings.experimental = settings.experimental;
    this.settings.mass = settings.mass;
    this.settings.bounceChance = settings.bounceChance;

    if (settings.teams) {
      if (settings.numTeams < 2) settings.numTeams = 2;
      if (settings.numTeams > 4) settings.numTeams = 4;
      settings.numTeams = Math.round(settings.numTeams);

      if (!this.settings.teams) {
        messageCallback('Teams have been enabled.');

        this.teams = [];
        for (let i = 0; i < 4; i++) {
          this.teams.push({
            score: 0,
            players: []
          });
        }
        this.teamOrder = [];
        for (let i = 0; i < settings.numTeams; i++) {
          // this.teams.push(0);
          this.teamOrder.push(i);
        }
      } else if (settings.numTeams > this.settings.numTeams) {
        for (let i = this.settings.numTeams; i < settings.numTeams; i++) {
          this.teams[i].score = 0;
          this.teamOrder.push(i);
        }

      } else if (settings.numTeams < this.settings.numTeams) {
        for (let i = this.teamOrder.length - 1; i >= 0; i--) {
          if (this.teamOrder[i] >= settings.numTeams) {
            this.teamOrder.splice(i, 1);
          }
        }

        // this.teams.splice(settings.numTeams, this.settings.numTeams - settings.numTeams);
      }

      this.reassignTeams(settings.numTeams, teamChangeCallback);
      
      this.settings.numTeams = settings.numTeams;
    } else if (this.settings.teams) {
      messageCallback('Teams have been disabled.');
    }

    this.settings.teams = settings.teams;

    newSettingsCallback(this.settings);
  }

  reassignTeams(numTeams, teamChangeCallback) {
    for (let player of this.players.values()) {
      if (player.team >= numTeams) {
        player.team = 0;
        teamChangeCallback(player);
      }
    }
  }

  // Update the game state
  update() {

    if (this.game) {
      if (!this.game.inGame && this.gameCountdown < 0) {
        // If a game has just ended this update cycle
        var winner = this.game.winner;

        if (winner != null) {
          if (winner == this.lastWinner) {
            this.currentStreak++;
          } else {
            this.currentStreak = 1;
          }

          this.lastWinner = winner;
        }

        var winnerObj = this.players.get(winner);
        if (winnerObj) {
          winnerObj.score++;

          // Reorder scoreboard
          this.scoreOrder.sort((a, b) => {
            return this.players.get(b).score - this.players.get(a).score;
          });

          // let i = this.scoreOrder.length - 1;
          // while (i >= 0) {
          //   if (this.scoreOrder[i] == winner) {
          //     this.scoreOrder.splice(i, 1);
          //     do {
          //       i--;
          //     } while (i >= 0 && this.players.get(this.scoreOrder[i]).score < winnerObj.score);

          //     this.scoreOrder.splice(i + 1, 0, winner);
          //     i = 0;
          //   }
          //   i--;
          // }

          // if (winner == this.lastWinner) {
          //   this.currentStreak++;
          // } else {
          //   this.currentStreak = 1;
          // }

          if (winnerObj.streak < this.currentStreak) winnerObj.streak = this.currentStreak;

          // this.lastWinner = winner;
        // } else {
        //   this.currentStreak = 0;
        } else if (winner != null) {
          if (typeof winner == 'number' && winner < this.settings.numTeams) {
            this.teams[winner].score++;

            // Reorder scoreboard
            this.teamOrder.sort((a, b) => {
              return this.teams[b].score - this.teams[a].score;
            });

            for (let playerid of this.teams[winner].players) {
              let playerObj = this.players.get(playerid);
              if (playerObj) {
                playerObj.score++;
              }
            }

            // Reorder scoreboard
            this.scoreOrder.sort((a, b) => {
              return this.players.get(b).score - this.players.get(a).score;
            });

            // let i = this.teamOrder.length - 1;
            // while (i >= 0) {
            //   if (this.teamOrder[i] == winner) {
            //     this.teamOrder.splice(i, 1);
            //     do {
            //       i--;
            //     } while (i >= 0 && this.teams[this.teamOrder[i]] < this.teams[winner]);

            //     this.teamOrder.splice(i + 1, 0, winner);
            //     i = 0;
            //   }
            //   i--;
            // }
          }
        }

        // this.lastWinner = winner;

        // Next game starts in 90 frames
        this.gameCountdown = 90;
        return {
          type: 'endGame',
          winner: winner,
          // scoresMap: this.players,
          players: this.playersArray(),
          scoreboard: this.scoreboard(this.settings.teams),
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
        // colour: player.colour,
        team: player.team,
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

  scoreboard(teams) {
    let scoreboard = [];

    if (teams) {
      for (let teamID of this.teamOrder) {
        scoreboard.push({
          name: 'Team ' + teamNames[teamID],
          score: this.teams[teamID].score
        });
      }
  
      return scoreboard;
    }

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
