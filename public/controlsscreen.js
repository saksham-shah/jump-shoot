var specialKeyNames = {
  " ": "SPACE",
  "ArrowUp" : "UP",
  "ArrowDown" : "DOWN",
  "ArrowLeft" : "LEFT",
  "ArrowRight" : "RIGHT"
}

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

var defaultControls = Object.assign(controls, {});
var defaultControlKeys = Object.assign(controlKeys, {});

var controlClicked = null;

// Controls changing screen
class ControlsScreen {
  constructor() {
    this.controlbars = {};
    this.backButton = new Button(backButtonOptions, 'MENU', () => scr = ms, null);

    this.rmbButton = new Button({
        x: 0.85,
        y: 0.85,
        textSize: 15,
        w: 100,
        h: 50
    }, 'Right click', () => {
      if (controlClicked) {
        controls[controlClicked] = 'right';
        controlKeys[controlClicked] = 'RMB';
        controlClicked = null;
        localStorage.controls = JSON.stringify(controls);
        localStorage.controlKeys = JSON.stringify(controlKeys);
      }
    }, null);

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

    this.defaultButton = new Button({
        x: 0.5,
        y: 0.85,
        textSize: 20,
        w: 250,
        h: 50
    }, 'Reset to default', () => {
      for (var control in controls) {
        controls[control] = defaultControls[control];
        controlKeys[control] = defaultControlKeys[control];
        controlClicked = null;
        localStorage.controls = JSON.stringify(controls);
        localStorage.controlKeys = JSON.stringify(controlKeys);
      }
    }, null);
    // this.backButton = new Button(0.1, 0.055, 'MENU', () => scr = ms, null);
    this.backButton = new Button(backButtonOptions, 'MENU', () => { scr = ms; controlClicked = null }, null);

    for (var control in controls) {
      this.controlbars[control] = new ButtonBar(0.3, controlNames[control], [{
        text: control => controlClicked == control ? '...' : controlKeys[control],
        click: control => controlClicked = controlClicked == control ? null : control
      }], control, {
        w: 400,
        h: 20,
        size: 15,
        buttonW: 75,
        buttonH: 15,
        buttonSize: 10
      });
    }
  }

  update() {
    var y = 0;
    for (var control in this.controlbars) {
      this.controlbars[control].updateButtonStates(y);
      y += 30;
    }

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

    var y = 0;
    for (var control in this.controlbars) {
      this.controlbars[control].show(y);
      y += 30;
    }

    this.rmbButton.show();
    this.lmbButton.show();
    this.defaultButton.show();
    this.backButton.show();
  }
}
