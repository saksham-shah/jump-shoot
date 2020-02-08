// Main menu
class MenuScreen {
  constructor() {
    this.buttons = [];

    // this.buttons.push({
    //   obj: new Button(0.25, 0.2, 'PLAY', () => { scr = ls }, null, 0.1),
    //   xRel: 0.5,
    //   yRel: 0.5
    // });
    // this.buttons.push({
    //   obj: new Button(0.1, 0.055, 'RENAME', () => {
    //     playerName = "";
    //     scr = ss;
    //     socket.emit('reset name');
    //   }, null),
    //   xRel: 0.9,
    //   yRel: 0.075
    // })

    this.buttons.push(new Button({
      x: 0.5,
      y: 0.5,
      w: 200,
      h: 100,
      textSize: 50
    }, 'PLAY', () => scr = ls, null));

    this.buttons.push(new Button({
      x: 0.25,
      y: 0.75,
      w: 150,
      h: 75,
      textSize: 20
    }, 'CONTROLS', () => { scr = cs; controlClicked = null }, null));

    this.buttons.push(new Button({
      x: 0.75,
      y: 0.75,
      w: 150,
      h: 75,
      textSize: 20
    }, 'HELP', () => console.log('heeelp'), null));

    this.buttons.push(new Button(backButtonOptions, 'RENAME', () => {
      playerName = "";
      scr = ss;
      socket.emit('reset name');
    }, null));
    // new Button(backButtonOptions, 'MENU', () => scr = ms, null)
  }

  update() {
    for (var b of this.buttons) {
      // b.obj.updateState(width * b.xRel, height * b.yRel);
      b.updateState();
    }
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

    for (var b of this.buttons) {
      // b.obj.show(width * b.xRel, height * b.yRel);
      b.show();
    }
  }
}
