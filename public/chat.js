class Chat {
  constructor(maxMessages) {
    this.maxMessages = maxMessages;
    this.messages = [];
    this.timeSinceMsg = 0;
  }

  newMessage(sender, message) {
    this.messages.push(new ChatMessage(sender, message));
    if (this.messages.length > this.maxMessages) {
      this.messages.splice(0, 1); // only shows the latest messages
    }
    this.timeSinceMsg = 0;
  }

  show(x, y) { // Bottom left of the chat area
    if (this.timeSinceMsg < 240 || textTarget == chatTextBox) {
      this.timeSinceMsg++;
      var bigness = 14; // bigness refers to text size in the whole project
      var currentY = y; // because size is already a property (I think)

      for (var i = this.messages.length - 1; i >= 0; i--) { // Loops through in reverse
        this.messages[i].show(x, currentY, bigness);
        currentY -= bigness + 2;
      }
    }
  }
}

class ChatMessage {
  constructor(sender, message) {
    this.sender = sender;
    this.message = message;
  }

  show(x, y, bigness) { // Bottom left of the text
    push();

    textAlign(LEFT);
    textSize(bigness);
    fill(255);
    noStroke();
    var showText = this.message;
    if (this.sender == SERVER) {
      textStyle(BOLD);
    } else {
      showText = this.sender + ": " + showText;
    }
    text(showText, x, y);

    pop();
  }
}

class TextBox {
  constructor(charLimit, defaultText, enterFunc) {
    this.charLimit = charLimit;
    this.typedText = "";
    this.defaultText = defaultText;
    this.enterFunc = enterFunc;
  }

  addChar(charToAdd) {
    if (this.typedText.length < this.charLimit) {
      this.typedText += charToAdd;
      return true;
    }
    return false;
  }

  removeChar() {
    if (this.typedText.length > 0) {
      this.typedText = this.typedText.substring(0, this.typedText.length - 1);
      return true;
    }
    return false;
  }

  pressEnter() {
    if (this.typedText.length > 0) {
      this.enterFunc(this.typedText);
    }
  }

  target() {
    // textInput.focus();
    textTarget = this;
    this.typedText = "";
  }

  updateText(txt) {
    this.typedText = txt;
  }

  show(x, y, w, h, showRect) {
    push();

    noFill();
    stroke(255);
    if (showRect) {
      rect(x + w * 0.5, y - h * 0.5, w, h);
    }

    var padding = 5;
    var textX = x;// + padding;
    var textY = y - padding;
    var textBigness = h - 2 * padding;

    textAlign(LEFT);
    textSize(textBigness);
    noStroke();
    if (this.typedText.length == 0) {
      fill(150);
      text(this.defaultText, textX, textY);
    } else {
      fill(255);
      text(this.typedText, textX, textY);
    }

    pop();
  }
}
