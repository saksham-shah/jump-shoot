// Special cases where the key name shouldn't be displayed
var specialKeyNames = {
  " ": "SPACE",
  "ArrowUp" : "UP",
  "ArrowDown" : "DOWN",
  "ArrowLeft" : "LEFT",
  "ArrowRight" : "RIGHT"
}

// The user friendly names of the controls
var controlNames = {
  up: "Jump",
  down: "Go down really fast",
  left: "Left",
  right: "Right",
  shoot: "Shoot",
  throw: "Throw",
  shield: "Shield"
}

// Controls of the game
var controls = {
  up: 87, // W
  down: 83, // S
  left: 65, // A
  right: 68, // D
  shoot: "left", // LMB
  throw: "right", // RMB
  shield: "right", // RMB
}

// Keys displayed on the controls screen
var controlKeys = {
  up: "W",
  down: "S",
  left: "A",
  right: "D",
  shoot: "LMB",
  throw: "RMB",
  shield: "RMB"
}

// Store the above controls as the default ones
var defaultControls = Object.assign(controls, {});
var defaultControlKeys = Object.assign(controlKeys, {});

var controlClicked = null;

// Controls changing screen
class ControlsScreen {
  constructor() {
    this.controlbars = {};

    // Used to set a control as the right mouse button
    this.rmbButton = new Button({
        x: 0.85,
        y: 0.85,
        textSize: 15,
        w: 100,
        h: 50
    }, 'Right click', () => {
      // If a control is currently being changed
      if (controlClicked) {
        // Change the control
        controls[controlClicked] = 'right';
        controlKeys[controlClicked] = 'RMB';
        controlClicked = null;
        // Store the controls in cache
        localStorage.controls = JSON.stringify(controls);
        localStorage.controlKeys = JSON.stringify(controlKeys);
      }
    }, null);

    // Same as above but for the left mouse button
    this.lmbButton = new Button({
        x: 0.15,
        y: 0.85,
        textSize: 15,
        w: 100,
        h: 50
    }, 'Left click', () => {
      if (controlClicked) {
        controls[controlClicked] = 'left';
        controlKeys[controlClicked] = 'LMB';
        controlClicked = null;
        localStorage.controls = JSON.stringify(controls);
        localStorage.controlKeys = JSON.stringify(controlKeys);
      }
    }, null);

    // Resets all of the controls
    this.defaultButton = new Button({
        x: 0.5,
        y: 0.85,
        textSize: 20,
        w: 250,
        h: 50
    }, 'Reset to default', () => {
      // Loop through each control
      for (var control in controls) {
        // Reset the controls
        controls[control] = defaultControls[control];
        controlKeys[control] = defaultControlKeys[control];
        controlClicked = null;
        // Store the controls in cache
        localStorage.controls = JSON.stringify(controls);
        localStorage.controlKeys = JSON.stringify(controlKeys);
      }
    }, null);

    this.backButton = new Button(backButtonOptions, 'MENU', () => { scr = ms; controlClicked = null }, null);

    var colourPattern = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple'];
    var colourCount = 0;
    // Make button bars for each control
    for (var control in controls) {
      this.controlbars[control] = new ButtonBar(0.3, controlNames[control], [{
        // If the control is clicked, display '...'
        // Otherwise display the key
        text: control => controlClicked == control ? '...' : controlKeys[control],
        // Set controlClicked to this control (or set it to null if already selected)
        click: control => controlClicked = controlClicked == control ? null : control
      }], control, colourPattern[colourCount], {
        w: 400,
        h: 20,
        size: 15,
        buttonW: 75,
        buttonH: 15,
        buttonSize: 10
      });
      colourCount = (colourCount + 1) % colourPattern.length;
    }
  }

  update() {
    // Update each button bar
    var y = 0;
    for (var control in this.controlbars) {
      this.controlbars[control].updateButtonStates(y);
      y += 30;
    }

    // Update all of the buttons
    this.rmbButton.updateState();
    this.lmbButton.updateState();
    this.defaultButton.updateState();
    this.backButton.updateState();
  }

  show() {
    push();

    drawText('Jump & Shoot', {
      x: 0.5,
      y: 0.15,
      textSize: 65
    });

    // Draw each button bar
    var y = 0;
    for (var control in this.controlbars) {
      this.controlbars[control].show(y);
      y += 30;
    }

    // Draw all of the buttons
    this.rmbButton.show();
    this.lmbButton.show();
    this.defaultButton.show();
    this.backButton.show();
  }
}
