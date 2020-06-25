// Lobby selection screen
class LobbyScreen {
  constructor() {
    this.lobbybars = {};
    // this.createButton = new Button(0.3125, 0.1, 'Create private lobby', () => socket.emit('create lobby'), null, 0.037);
    this.createButton = new Button({
        x: 0.5,
        y: 0.85,
        textSize: 20,
        w: 250,
        h: 50
    }, 'Create private lobby', () => socket.emit('create lobby'), null, 'blue');
    // this.backButton = new Button(0.1, 0.055, 'MENU', () => scr = ms, null);
    this.backButton = new Button(backButtonOptions, 'MENU', () => scr = ms, null);

  }

  // Called when a lobby update is sent by the server
  updateLobbies(lobbies) {
    var colourPattern = ['green', 'cyan'];
    var colourCount = 0;
    this.lobbybars = {};
    for (var lobby of lobbies) {
      // this.lobbybars[lobby.name] = new ButtonBar(lobby.name, lobby, [{
      //   txt: 'Join',
      //   clickFunc: lobby => socket.emit('join lobby', lobby.name)
      // }, {
      //   txt: lobby => lobby.players.length,// + '/' + lobby.maxPlayers,
      //   clickFunc: lobby => {
      //     // Shows which players are in the lobby
      //     var text = 'Players:\n';
      //     if (lobby.players.length == 0) {
      //       text += '\nThis lobby is empty.';
      //     } else {
      //       for (var player of lobby.players) {
      //         text += '\n' + player.name;
      //       }
      //     }
      //     popupMessage(text)
      //   }
      // }]);

      var buttons = [{
        text: 'Join',
        click: lobby => socket.emit('join lobby', lobby.name)
      }, {
        text: lobby => lobby.players.length,
        click: lobby => {
          // Shows which players are in the lobby
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
      }];

      if (lobby.info) {
        buttons.push({
          text: 'Info',
          click: lobby => {
            popupMessage(lobby.info);
          }
        })
      }

      this.lobbybars[lobby.name] = new ButtonBar(0.3, lobby.name, buttons, lobby, colourPattern[colourCount]);
      colourCount = (colourCount + 1) % colourPattern.length;
    }
  }

  update() {
    // var y = height * 0.3;
    // for (var lobby in this.lobbybars) {
    //   this.lobbybars[lobby].updateButtonStates(y);
    //   y += height * 0.1;
    // }

    var y = 0;
    for (var lobby in this.lobbybars) {
      this.lobbybars[lobby].updateButtonStates(y);
      y += 40;
    }

    // this.createButton.updateState(width * 0.5, height * 0.85);
    this.createButton.updateState();
    // this.backButton.updateState(width * 0.9, height * 0.075);
    this.backButton.updateState();
  }

  show() {
    push();
    // Draw the title text
    // fill(255);
    // noStroke();
    // textAlign(CENTER);
    // textSize(height * 0.15);
    // text("Jump & Shoot", width * 0.5, height * 0.2);

    drawText('Jump & Shoot', {
      x: 0.5,
      y: 0.15,
      textSize: 65
    });

    // var y = height * 0.3;
    // for (var lobby in this.lobbybars) {
    //   this.lobbybars[lobby].show(y);
    //   y += height * 0.1;
    // }

    var y = 0;
    for (var lobby in this.lobbybars) {
      this.lobbybars[lobby].show(y);
      y += 40;
    }

    // this.createButton.show(width * 0.5, height * 0.85);
    this.createButton.show();
    // this.backButton.show(width * 0.9, height * 0.075);
    this.backButton.show();

    pop();
  }
}
