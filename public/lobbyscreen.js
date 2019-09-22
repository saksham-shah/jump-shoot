// Main menu
class LobbyScreen {
  constructor() {
    this.lobbybars = {};
    this.createButton = new Button(0.3125, 0.1, 'Create private lobby', () => socket.emit('create lobby'), null, 0.037);
  }

  updateLobbies(lobbies) {
    this.lobbybars = [];
    for (var lobby of lobbies) {
      this.lobbybars[lobby.name] = new ButtonBar(lobby.name, lobby, [{
        txt: 'Join',
        clickFunc: lobby => socket.emit('join lobby', lobby.name)
      }, {
        txt: lobby => lobby.players.length,// + '/' + lobby.maxPlayers,
        clickFunc: lobby => {
          var text = 'Players:\n';
          if (lobby.players.length == 0) {
            text += '\nThis lobby is empty.';
          } else {
            for (var player of lobby.players) {
              text += '\n' + player.name;
            }
          }
          popupMessage(text)
        }
      }]);
    }
  }

  addLobby(lobby) {
    this.lobbybars[lobby.name] = new ButtonBar(lobby.name, lobby, [{
      txt: 'Join',
      clickFunc: lobby => socket.emit('join lobby', lobby.name)
    }])
  }

  removeLobby(lobbyName) {
    this.lobbybars[lobbyname] = undefined;
  }

  update() {
    var y = height * 0.3;
    for (var lobby in this.lobbybars) {
      this.lobbybars[lobby].updateButtonStates(y);
      y += height * 0.1;
    }

    this.createButton.updateState(width * 0.5, height * 0.85);
  }

  show() {
    push();
    // Draw the title text
    fill(255);
    noStroke();
    textAlign(CENTER);
    textSize(height * 0.15);
    text("Jump & Shoot", width * 0.5, height * 0.2);

    var y = height * 0.3;
    for (var lobby in this.lobbybars) {
      this.lobbybars[lobby].show(y);
      y += height * 0.1;
    }

    this.createButton.show(width * 0.5, height * 0.85);
  }
}
