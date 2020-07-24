let controls = {
    up: 87, // W
    down: 83, // S
    left: 65, // A
    right: 68, // D
    shoot: "Mouse 0", // LMB
    throw: "Mouse 2", // RMB
    shield: "Mouse 0", // LMB
}

 // Keys displayed on the controls screen
 let controlKeys = {
    up: "W",
    down: "S",
    left: "A",
    right: "D",
    shoot: "LMB",
    throw: "RMB",
    shield: "LMB"
};

// Store the above controls as the default one
let defaultControls = Object.assign({}, controls);
let defaultControlKeys = Object.assign({}, controlKeys);

// Allows players to change their game controls
function addControlsOverlay() {
    let specialKeyNames = {
        " ": "SPACE",
        "ArrowUp" : "UP",
        "ArrowDown" : "DOWN",
        "ArrowLeft" : "LEFT",
        "ArrowRight" : "RIGHT",
        "Mouse 0": "LMB",
        "Mouse 1": "MMB",
        "Mouse 2": "RMB"
    };

    let controlNames = {
        up: "Jump",
        down: "Go down fast",
        left: "Move left",
        right: "Move right",
        shoot: "Shoot",
        throw: "Throw weapon",
        shield: "Shield"
    };

    let controlClicked = null;
    let buttonClicked = false;

    let offset = 30;

    let scr = addOverlay('controls', {
        width: 400,
        height: 330,
        text: 'Controls',
        draw: () => {
            let tSize = offset - 10;
            let x = 180;
            let y = 45 + tSize / 3;
            
            textAlign(RIGHT);
            textSize(tSize);
            noStroke();
            fill(0);

            for (let control in controlNames) {
                text(controlNames[control], x, y);
                y += offset;
            }
        }
    })
    .addButton({
        position: { x: 200, y: 285 },
        width: 100,
        height: offset,
        text: 'Reset',
        textSize: offset - 10,
        onClick: () => {
            for (let control in controls) {
                controls[control] = defaultControls[control];
                controlKeys[control] = defaultControlKeys[control];
                controlClicked = null;
                localStorage.setItem('controls', JSON.stringify(controls));
                localStorage.setItem('controlKeys', JSON.stringify(controlKeys));
            }
        }
    })
    .on('keyDown', e => {
        // If a control is selected
        if (controlClicked) {
            // Set this key as that control
            controls[controlClicked] = e.which;
            controlKeys[controlClicked] = specialKeyNames[e.key] ? specialKeyNames[e.key] : e.key.toUpperCase();
            controlClicked = null;
            // Store the control in cache
            localStorage.setItem('controls', JSON.stringify(controls));
            localStorage.setItem('controlKeys', JSON.stringify(controlKeys));
        }
    })
    .on('mouseUp', e => {
        // Similar to 'keyDown' above
        if (buttonClicked || !controlClicked) return;
        let text = "Mouse " + e.button;
        controls[controlClicked] = text;
        controlKeys[controlClicked] = specialKeyNames[text] ? specialKeyNames[text] : text.toUpperCase();
        controlClicked = null;
        localStorage.setItem('controls', JSON.stringify(controls));
        localStorage.setItem('controlKeys', JSON.stringify(controlKeys));
    })
    .on('mouseDown', e => {
        if (e.button != 0) {
            buttonClicked = false;
            return;
        }
        // Don't register a left mouse click if it was just clicking a button
        let mousePos = getScreen('controls').mousePos;
        buttonClicked = (mousePos.x > 220 && mousePos.x < 320 && mousePos.y > 30 && mousePos.y < 240) || mousePos.y < 0;
    });

    // Add buttons for each of the controls
    let x = 270;
    let y = 45;
    for (let control in controls) {
        scr.addButton({
            position: { x, y },
            width: 100,
            height: offset,
            style: 'controls',
            text: () => controlClicked == control ? '...' : controlKeys[control],
            textSize: offset - 10,
            onClick: () => controlClicked = controlClicked == control ? null : control
        });

        y += offset;
    }
}

screens.push(addControlsOverlay);