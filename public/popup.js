function popupMessage(message, size) {
  popup = new Popup(message, size);
}

// Message that pops up with information for the player
class Popup {
  constructor(message, size) {
    this.message = message;
    this.size = size || 0.0625;

    this.closeButton = new Button(0.1, 0.055, 'CLOSE', () => popup = null, null);
  }

  show() {
    push();
    fill(0, 200);
    noStroke();
    rect(width / 2, height / 2, width, height);

    this.closeButton.updateState(width * 0.9, height * 0.075);
    this.closeButton.show(width * 0.9, height * 0.075);

    push();
    textSize(this.size * height);
    textAlign(CENTER, CENTER);
    fill(255);
    text(this.message, width / 2, height / 2);
    pop();

    // Disable any typing
    textTarget = null;

    pop();
  }
}
