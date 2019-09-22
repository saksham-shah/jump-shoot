// Main menu
class MenuScreen {
  constructor() {
    this.buttons = [];

    this.buttons.push({
      obj: new Button(0.25, 0.2, 'PLAY', () => {
        // socket.emit('join lobby', 'lobby');
        scr = ls;
      }, null, 0.1),
      xRel: 0.5,
      yRel: 0.5
    });
  }

  update() {
    for (var b of this.buttons) {
      b.obj.updateState(width * b.xRel, height * b.yRel);
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

    for (var b of this.buttons) {
      b.obj.show(width * b.xRel, height * b.yRel);
    }
  }
}
