// Buttons used in ButtonBars
class Button {
  constructor(w, h, txt, clickFunc, objOfClick, size) {
    this.w = w;
    this.h = h;
    this.txt = txt;
    this.pressed = false;
    this.click = clickFunc;
    // What object the button operates on
    this.objOfClick = objOfClick;

    this.size = size || this.h * 0.75;
  }

  isHovered(x, y) {
    return mouseX > x - this.w * 0.5 && mouseX < x + this.w * 0.5 && mouseY > y - this.h * 0.5 && mouseY < y + this.h * 0.5;
  }

  updateState(x, y) {
    // Check if the mouse has clicked the button
    if (this.isHovered(x, y)) {
      if (mouseIsPressed) {
        this.pressed = true;
      } else if (this.pressed) {
        this.click(this.objOfClick);
        this.pressed = false;
      }
    } else {
      this.pressed = false;
    }
  }

  show(x, y) {
    // this.updateState(x, y);
    push();
    translate(x, y);

    noStroke();
    // Change colour when hovered over
    if (this.isHovered(x, y)) {
      fill(150);
    } else {
      fill(100);
    }

    rect(0, 0, this.w, this.h);

    textAlign(CENTER);
    textSize(this.size);
    noStroke();
    fill(255);

    var t = this.txt;
    if (t instanceof Function) {
      t = t(this.objOfClick);
    }

    text(t, 0, this.size / 3);
    pop();
  }
}

class ButtonBar {
  constructor(txt, obj, buttons) {
    this.txt = txt;
    this.buttons = [];
    for (var b of buttons) {
      this.buttons.push(new Button(50, 30, b.txt, b.clickFunc, obj));
    }

    // Hardcoded numbers for this right now
    this.w = width - 100;
    this.h = 40;
  }

  updateButtonStates(y) {
    var x = this.w + 50;
    // Update the state of each of its buttons
    for (var b of this.buttons) {
      x -= 60;
      b.updateState(x, y);
    }
  }

  show(y) {
    // this.updateButtonStates(y);
    push();
    translate(50, y);
    noStroke();
    fill(170);
    rect(this.w * 0.5, 0, this.w, this.h);

    // Draw the text
    textAlign(LEFT);
    textSize(30);
    noStroke();
    fill(255);
    text(this.txt, 10, 10);
    pop();

    // Draw each of its buttons
    var x = this.w + 50;
    for (var b of this.buttons) {
      x -= 60;
      b.show(x, y);
    }
  }
}
