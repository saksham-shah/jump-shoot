// Main menu
class LobbyScreen {
  constructor() {
    this.lobbybars = {};
    this.createButton = new Button(250, 50, 'Create private lobby', () => socket.emit('create lobby'), null, 20);
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
    var y = 200;
    for (var lobby in this.lobbybars) {
      this.lobbybars[lobby].updateButtonStates(y);
      y += 50;
    }

    this.createButton.updateState(width / 2, 480);
  }

  show() {
    push();
    // Draw the title text
    fill(255);
    noStroke();
    textAlign(CENTER);
    textSize(50);
    text("Jump & Shoot", width * 0.5, 100);

    var y = 200;
    for (var lobby in this.lobbybars) {
      this.lobbybars[lobby].show(y);
      y += 50;
    }

    this.createButton.show(width / 2, 480);
  }
}
