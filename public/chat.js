// Wrapper class for an array of chat messages
class Chat {
  constructor(maxMessages) {
    this.maxMessages = maxMessages;
    this.messages = [];
    this.timeSinceMsg = 0;
  }

  newMessage(sender, message) {
    this.messages.push(new ChatMessage(sender, message));
    if (this.messages.length > this.maxMessages) {
      // Only show the latest messages
      this.messages.splice(0, 1);
    }
    this.timeSinceMsg = 0;
  }

  show(x, y) { // Bottom left of the chat area
    // Show chat if currently typing in the chat
    if (this.timeSinceMsg < 240 || textTarget == chatTextBox) {
      this.timeSinceMsg++; // Disappears after inactivity
      var bigness = 14; // bigness refers to text size in the whole project
      var currentY = y; // because size is already a property (I think)

      // Loop through chat messages in reverse
      for (var i = this.messages.length - 1; i >= 0; i--) {
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

    textAlign(LEFT, BOTTOM);
    textSize(bigness);
    fill(255);
    noStroke();
    var showText = this.message;
    if (this.sender == SERVER) {
      // Server messages are bold
      textStyle(BOLD);
    } else {
      // Normal messages show the sender
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
    this.defaultText = defaultText; // Text shown when text box is empty
    this.enterFunc = enterFunc;
  }

  // Character typed
  addChar(charToAdd) {
    if (this.typedText.length < this.charLimit || this.charLimit <= 0) {
      this.typedText += charToAdd;
      return true;
    }
    return false;
  }

  // Backspace pressed
  removeChar() {
    if (this.typedText.length > 0) {
      this.typedText = this.typedText.substring(0, this.typedText.length - 1);
      return true;
    }
    return false;
  }

  // Run when text is entered
  pressEnter() {
    // Doesn't accept an empty message
    if (this.typedText.length > 0) {
      this.enterFunc(this.typedText);
    }
  }

  target() {
    // When keys are typed now, chars will be added to this textbox
    textTarget = this;
    // Reset text box message
    this.typedText = "";
  }

  // UNUSED
  updateText(txt) {
    this.typedText = txt;
  }

  show(x, y, w, h, showRect) { // Bottom left of box
    push();

    noFill();
    stroke(255);
    // Some text boxes need a box to be drawn
    if (showRect) {
      rect(x + w * 0.5, y - h * 0.5, w, h);
    }

    var padding = 5;
    var textX = x;
    var textY = y - padding;
    var textBigness = h - 2 * padding;

    textAlign(LEFT);
    textSize(textBigness);
    noStroke();
    if (this.typedText.length == 0) {
      fill(150);
      // Draw default text if empty
      text(this.defaultText, textX, textY);
    } else {
      fill(255);
      // Otherwise draw normal text
      text(this.typedText, textX, textY);
    }

    pop();
  }
}
