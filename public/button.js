class Button {
  constructor(options, text, click, obj) {
    this.options = options;
    if (this.options.type == undefined) this.options.type = 'rect';

    this.text = text;
    this.click = click;
    // What object the button operates on
    this.objOfClick = obj;

    this.pressed = false;
  }

  // Check if the cursor is hovering over the button
  isHovered(offsetX, offsetY, options) {
    if (options) {
      var { x, y, w, h } = options;
    } else {
      var { x, y, w, h } = getPosSize(this.options);
    }

    // Add any offsets (used in button bars)
    if (offsetY !== undefined) {
      x += offsetX * ratio;
      y += offsetY * ratio;
    }

    var relX = mouseX - x;
    var relY = mouseY - y;
    return relX > - w / 2 && relX < w / 2 && relY > - h / 2 && relY < h / 2;
  }

  // Check if the mouse has clicked the button
  updateState(offsetX, offsetY, options) {
    if (this.isHovered(offsetX, offsetY, options)) {
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

  show(offsetX, offsetY, options) {
    if (options) {
      var { x, y, w, h, size } = options;
    } else {
      var { x, y, w, h, size } = getPosSize(this.options);
    }

    if (offsetY !== undefined) {
      x += offsetX * ratio;
      y += offsetY * ratio;
    }


    push();
    translate(x, y);

    noStroke();
    fill(100);

    // Change colour when hovered over
    if (this.isHovered(offsetX, offsetY, options)) fill(150);

    rect(0, 0, w, h);

    fill(255);
    textAlign(CENTER);
    textSize(size);

    // If the text property is actually a function, the button has dynamic text
    var t = this.text;
    if (t instanceof Function) t = this.text(this.objOfClick);

    text(t, 0, size / 3);

    pop();
  }
}

// Used in menus
class ButtonBar {
  constructor(y, txt, buttons, obj, options) {
    this.y = y;
    this.w = options && options.w || 100;
    this.h = options && options.h || 30;
    this.size = options && options.size || 25;

    this.buttonW = options && options.buttonW || 50;
    this.buttonH = options && options.buttonH || 20;
    this.buttonSize = options && options.buttonSize || 20;

    this.text = txt;

    // Hardcoded numbers
    this.buttons = [];
    var x = 0.5;
    for (var b of buttons) {
      this.buttons.push(new Button({
        x: x,
        y: y,
        w: this.buttonW,
        h: this.buttonH,
        textSize: this.buttonSize
      }, b.text, b.click, obj));
    }
  }

  updateButtonStates(offsetY) {
    // Update the state of each of its buttons
    var x = width - this.w * ratio / 2 - 5 * ratio - this.buttonW * ratio;
    for (var b of this.buttons) {
      b.updateState(0, offsetY, {
        x: x,
        y: this.y * height,
        w: this.buttonW * ratio,
        h: this.buttonH * ratio
      });
      // Each button is slightly to the left of the previous one
      x -= 10 * ratio + this.buttonW * ratio;
    }
  }

  show(offsetY) {
    var w = width - this.w * ratio;
    var y = this.y * height;
    if (offsetY !== undefined) y += offsetY * ratio;

    push();
    translate(width / 2, y);

    noStroke();
    fill(170);

    rect(0, 0, w, this.h * ratio);

    // Draw the text
    textAlign(LEFT);
    fill(255);
    textSize(this.size * ratio);

    // If the text property is actually a function, the button has dynamic text
    var t = this.text;
    if (t instanceof Function) t = this.text(this.objOfClick);

    text(t, 20 * ratio - w / 2, this.size * ratio / 3);

    pop();

    // Draw each of its buttons right to left
    var x = width - this.w * ratio / 2 - 5 * ratio - this.buttonW * ratio;
    for (var b of this.buttons) {
      b.show(0, offsetY, {
        x: x,
        y: this.y * height,
        w: this.buttonW * ratio,
        h: this.buttonH * ratio,
        size: this.buttonSize * ratio
      });
      x -= 10 * ratio + this.buttonW * ratio;
    }
  }
}
