class StartScreen {
  constructor() {
    this.playerName = "";
    this.nameTextBox = new TextBox(12, "Enter name", function(txt) {
      if (txt.length > 0) {
        playerName = txt;
        var data = {
          name: playerName,
          lobbyid: "abc"
        }
        socket.emit('pick name', playerName);
        // socket.emit('join lobby', "abc");
      }
    }) // place to type in the player name
  }

  update() {
    if (this.nameTextBox && textTarget != this.nameTextBox) {
      textTarget = this.nameTextBox; // can't do anything else until you type the name
    }
    if (playerName != "") {
      if (textTarget == this.nameTextBox) {
        textTarget = null;
      }
      this.nameTextBox = null; // no longer needed as name has been decided
    }
  }

  show() {
    push();
    fill(255);
    noStroke();
    textAlign(CENTER);
    textSize(50);
    text("Jump & Shoot", width * 0.5, 100);
    // pop();

    if (this.nameTextBox) {
      var w = 300;
      var h = 50;
      var x = (width - w) * 0.5;
      var y = (height + h) * 0.5;
      this.nameTextBox.show(x, y, w, h, true);
    } else {
      // fill(255);
      // noStroke();
      textSize(20);
      text("Press enter to type in the chat\nType '/join lobby' to begin", width * 0.5, height * 0.5);
    }

    pop();
  }


}
