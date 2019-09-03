// Main menu
class MenuScreen {
  constructor() {
    this.buttons = [];

    this.buttons.push({
      obj: new Button(200, 100, 'PLAY', () => {
        // socket.emit('join lobby', 'lobby');
        scr = ls;
      }, null, 60),
      x: width / 2,
      y: height / 2
    });
  }

  update() {
    for (var b of this.buttons) {
      b.obj.updateState(b.x, b.y);
    }
  }

  show() {
    push();
    // Draw the title text
    fill(255);
    noStroke();
    textAlign(CENTER);
    textSize(50);
    text("Jump & Shoot", width * 0.5, 100);

    for (var b of this.buttons) {
      b.obj.show(b.x, b.y);
    }
  }
}
