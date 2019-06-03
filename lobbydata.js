class LobbyData {
  constructor(users, lobbies) {
      this.users = users;
      this.lobbies = lobbies;
  }

  static getLobbyFromSocket(socketid, users, lobbies) {
    // console.log(users);
    var userData = users.get(socketid);
    var lobbyid = userData.lobbyid;
    for (var i = 0; i < lobbies.length; i++) {
      if (lobbies[i].lobbyid === lobbyid) {
        return lobbies[i];
      }
    }
    return null;
  }

  static findPlayerInGame(socketid, users, lobbies) {
    var lobby = LobbyData.getLobbyFromSocket(socketid, users, lobbies);
    if (lobby.game) {
      var player = lobby.game.players.get(socketid);
      return player;
    }
    return null;
  }

  // getLobbyFromSocket(socketid) {
  //   var userData = this.users.get(socketid);
  //   var lobbyid = userData.lobbyid;
  //   for (var i = 0; i < this.lobbies.length; i++) {
  //     if (this.lobbies[i].lobbyid === lobbyid) {
  //       return this.lobbies[i];
  //     }
  //   }
  //   return null;
  // }
  //
  // findPlayerInGame(socketid) {
  //   var lobby = this.getLobbyFromSocket(socketid);
  //   if (lobby.game) {
  //     var player = lobby.game.players.get(socketid);
  //     return player;
  //   }
  //   return null;
  // }
}

module.exports = LobbyData;
