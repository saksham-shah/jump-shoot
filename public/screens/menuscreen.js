function addMenuScreen() {
    let alertOrder = ['shield control', 'crosshair', 'show mass'];
    let alertCounter = -1;

    let latestAlert = localStorage.getItem('alert');

    // Work out if the player needs to see any alerts they haven't already seen
    for (let i = alertOrder.length - 1; i >= 0; i--) {
        if (latestAlert == alertOrder[i]) {
            alertCounter = i;
        }
    }

    addScreen('menu', {
        draw: () => {
            fill(200);
            stroke(45);
            strokeWeight(1);
            rect(775, 555, 250, 30);

            logo(450, 125, 1.3);

            textAlign(CENTER);
            noStroke();
            fill(20);
            textSize(20);
            text(playerName, 775, 555 + 20 / 3);
        },
        update: () => {
            // Open any required alerts
            if (alertCounter != alertOrder.length - 1) {
                alertCounter++;
                openOverlay('alert', alertOrder[alertCounter]);
            }
        }
    })
    .addButton({
        position: { x: 450, y: 300 },
        width: 200,
        height: 100,
        textSize: 50,
        text: 'PLAY',
        onClick: () => setScreen('lobbies')
    })
    .addButton({
        position: { x: 350, y: 437.5 },
        width: 150,
        height: 75,
        textSize: 25,
        text: 'SETTINGS',
        onClick: () => openOverlay('settings')
    })
    .addButton({
        position: { x: 550, y: 437.5 },
        width: 150,
        height: 75,
        textSize: 25,
        text: 'HELP',
        onClick: () => openOverlay('help')
    })
    .addButton({
        position: { x: 450, y: 545 },
        width: 150,
        height: 40,
        textSize: 20,
        text: 'CREDITS',
        onClick: () => openOverlay('credits')
    })
    .addButton({
        position: { x: 775, y: 585 },
        width: 250,
        height: 30,
        textSize: 20,
        text: 'CHANGE NAME',
        onClick: () => openOverlay('name')
    })
}

screens.push(addMenuScreen);