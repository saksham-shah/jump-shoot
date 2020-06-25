function addMenuScreen() {
    addScreen('menu', {
        draw: () => {
            fill(200);
            stroke(45);
            strokeWeight(1);
            rect(775, 555, 250, 30);

            textAlign(CENTER);
            textSize(100);
            fill(255);
            noStroke();
            text('Jump & Shoot', 450, 150);

            fill(20);
            textSize(20);
            text(playerName, 775, 555 + 20 / 3);
        },
        update: () => {
            if (outdated) {
                localStorage.setItem('version', currentVersion);
                outdated = false;
                openOverlay('alert', 'Controls changed', 'The control for the shield has been changed from the right mouse button to the left mouse button. Feel free to change it back in Settings.', true);
            }
        }
    })
    .addButton({
        position: { x: 450, y: 300 },
        width: 200,
        height: 100,
        textSize: 50,
        text: 'PLAY',
        onClick: () => openOverlay('lobbies')
    })
    .addButton({
        position: { x: 450, y: 450 },
        width: 150,
        height: 75,
        textSize: 25,
        text: 'SETTINGS',
        onClick: () => openOverlay('settings')
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