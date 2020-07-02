// let controls = {
//     up: "KeyW", // W
//     down: "KeyS", // S
//     left: "KeyA", // A
//     right: "KeyD", // D
//     shoot: "Mouse 0", // LMB
//     throw: "Mouse 2", // RMB
//     shield: "Mouse 0", // LMB
// }

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

let defaultControls = Object.assign({}, controls);
let defaultControlKeys = Object.assign({}, controlKeys);

// let cs = {
//     specialKeyNames: {
//         " ": "SPACE",
//         "ArrowUp" : "UP",
//         "ArrowDown" : "DOWN",
//         "ArrowLeft" : "LEFT",
//         "ArrowRight" : "RIGHT",
//         "Mouse 0": "LMB",
//         "Mouse 1": "MMB",
//         "Mouse 2": "RMB"
//     },
//     controlNames: {
//         up: "Jump",
//         down: "Go down fast",
//         left: "Move left",
//         right: "Move right",
//         shoot: "Shoot",
//         throw: "Throw weapon",
//         shield: "Shield"
//     },
//     // Keys displayed on the controls screen
//     controlKeys: {
//         up: "W",
//         down: "S",
//         left: "A",
//         right: "D",
//         shoot: "LMB",
//         throw: "RMB",
//         shield: "RMB"
//     },
//     controlClicked: null,
//     buttonClicked: false
// }

// Store the above controls as the default ones
// cs.defaultControls = Object.assign({}, controls);
// cs.defaultControlKeys = Object.assign({}, cs.controlKeys);

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
        if (controlClicked) {
            controls[controlClicked] = e.which;
            controlKeys[controlClicked] = specialKeyNames[e.key] ? specialKeyNames[e.key] : e.key.toUpperCase();
            controlClicked = null;
            localStorage.setItem('controls', JSON.stringify(controls));
            localStorage.setItem('controlKeys', JSON.stringify(controlKeys));
        }
    })
    .on('mouseUp', e => {
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
        let mousePos = getScreen('controls').mousePos;
        buttonClicked = (mousePos.x > 220 && mousePos.x < 320 && mousePos.y > 30 && mousePos.y < 240) || mousePos.y < 0;
    });

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
            // target: control,
            onClick: () => controlClicked = controlClicked == control ? null : control
        });

        y += offset;
    }
}

screens.push(addControlsOverlay);