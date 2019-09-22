// Displayed when the game is first opened, handles player name selection
class StartScreen {
  constructor() {
    // this.playerName = "";
    // Text box to enter name
    this.nameTextBox = new TextBox(12, "Enter name", function(txt) {
      // Send the name to the server
      // playerName = txt;
      // var data = {
      //   name: playerName,
      // }
      socket.emit('pick name', txt);
    });
  }

  update() {
    // Make sure the name text box is selected until a name is picked
    if (this.nameTextBox && textTarget != this.nameTextBox) {
      textTarget = this.nameTextBox;
    }
    // Once a name is picked, remove the name text box as it isn't needed
    if (playerName != "") {
      if (textTarget == this.nameTextBox) {
        textTarget = null;
      }
      scr = ms;
    }
  }

  show() {
    push();
    // Draw the title text
    fill(255);
    noStroke();
    textAlign(CENTER);
    textSize(height * 0.15);
    text("Jump & Shoot", width * 0.5, height * 0.2);

    if (this.nameTextBox) {
      // Draw the name text box in the centre of the screen
      var w = width * 0.375;
      var h = height * 0.1;
      var x = (width - w) * 0.5;
      var y = (height + h) * 0.5;
      this.nameTextBox.show(x, y, w, h, true); // Box should be drawn, so the final arg is true
     }// else {
    //   // Guide message
    //   textSize(20);
    //   text("Press enter to type in the chat\nType '/join lobby' to begin", width * 0.5, height * 0.5);
    // }
    pop();
  }


}
