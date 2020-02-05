function popupMessage(message, size) {
  popup = new Popup(message, size);
}

// Message that pops up with information for the player
class Popup {
  constructor(message, size) {
    this.message = message;
    // this.size = size || 0.0625;
    this.size = size || 40;

    // this.closeButton = new Button(0.1, 0.055, 'CLOSE', () => popup = null, null);
    this.closeButton = new Button(backButtonOptions, 'CLOSE', () => popup = null, null);
  }

  show() {
    push();
    fill(0, 200);
    noStroke();
    rect(width / 2, height / 2, width, height);

    // this.closeButton.updateState(width * 0.9, height * 0.075);
    // this.closeButton.show(width * 0.9, height * 0.075);
    this.closeButton.updateState();
    this.closeButton.show();

    push();
    // textSize(this.size * height);
    textAlign(CENTER, CENTER);
    // fill(255);
    // text(this.message, width / 2, height / 2);
    drawText(this.message, {
      x: 0.5,
      y: 0.5,
      xEdge: true,
      textSize: this.size
    })
    pop();

    // Disable any typing
    textTarget = null;

    pop();
  }
}
