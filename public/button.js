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

  // Check if the cursor is hovering over the button
  isHovered(x, y) {
    var w = width * this.w;
    var h = height * this.h;
    return mouseX > x - w * 0.5 && mouseX < x + w * 0.5 && mouseY > y - h * 0.5 && mouseY < y + h * 0.5;
  }

  // Check if the mouse has clicked the button
  updateState(x, y) {
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
    push();
    translate(x, y);

    noStroke();
    // Change colour when hovered over
    if (this.isHovered(x, y)) {
      fill(150);
    } else {
      fill(100);
    }

    rect(0, 0, width * this.w, height * this.h);

    textAlign(CENTER);
    textSize(height * this.size);
    noStroke();
    fill(255);

    // If the txt property is actually a function, the button has dynamic text
    var t = this.txt;
    if (t instanceof Function) {
      t = t(this.objOfClick);
    }

    text(t, 0, height * this.size / 3);
    pop();
  }
}

// Used in menus
class ButtonBar {
  constructor(txt, obj, buttons) {
    this.txt = txt;
    this.buttons = [];
    for (var b of buttons) {
      this.buttons.push(new Button(0.0625, 0.055, b.txt, b.clickFunc, obj));
    }

    // Hardcoded numbers for this right now
    this.w = width - 100;
    this.h = height * 0.075;
  }

  updateButtonStates(y) {
    var w = width - 100;
    var h = height * 0.075;

    var x = w + 50;
    // Update the state of each of its buttons
    for (var b of this.buttons) {
      x -= 0.075 * width;
      b.updateState(x, y);
    }
  }

  show(y) {
    push();
    translate(50, y);
    noStroke();
    fill(170);

    var w = width - 100;
    var h = height * 0.075;

    rect(w * 0.5, 0, w, h);

    // Draw the text
    textAlign(LEFT);
    textSize(height * 0.055);
    noStroke();
    fill(255);
    text(this.txt, h * 0.25, h * 0.25);
    pop();

    // Draw each of its buttons right to left
    var x = w + 50;
    for (var b of this.buttons) {
      x -= 0.075 * width;
      b.show(x, y);
    }
  }
}
