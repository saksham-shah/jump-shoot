var socket = require('socket.io');

var Game = require('./game.js');

class Lobby {
  constructor(name, lobbyid, maxPlayers) {
    this.name = name;
    this.lobbyid = lobbyid;
    this.maxPlayers = 4;
    this.players = [];
  }

  // startGame() {
  //   this.initGame();
  //   this.createMap();
  // }

  addPlayer(socketid) {
    // var player = new Player(100, 200, socketID, this.colours[this.colourCount], this.engine);
    // this.colourCount++;
    // if (this.colourCount >= this.colours.length) {
    //   this.colourCount = 0;
    // }
    // this.players.set(player.id, player);
    this.players.push(socketid);
    var data = {
      name: this.name,
      lobbyid: this.lobbyid,
      myid: socketid
    }
    if (this.game) {
      data.gameinfo = {
        width: this.game.width,
        height: this.game.height,
        platforms: this.game.statics
      }
    }
    return data;
    //console.log(socket.broadcast);
    //socket.broadcast.to(socketid).emit('joined lobby', data);
  }

  removePlayer(socketid) {
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i] === socketid) {
        if (this.game) {
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

  update() {
    if (this.game) {
      if (this.game.inGame) {
        return {
          inGame: true,
          gameData: this.game.update()
        }
      } else {
        var winData = {
          winner: this.game.winner
        }
        // console.log(winData);
        this.game = null;
        // console.log(winData);
        return {
          inGame: false,
          gameData: winData
        }
      }
    }
    return null;
  }
}

module.exports = Lobby;
