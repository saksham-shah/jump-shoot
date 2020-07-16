function addChangeSettingsOverlay() {
    addOverlay('change lobby settings', {
        width: 400,
        height: 400,
        text: 'Change lobby settings',
        onDisplay: () => {
            getElement('lobby settings mass').setValue(lobbySettings.mass);
            getElement('lobby settings bounceChance').setValue(lobbySettings.bounceChance * 100);
            getElement('lobby settings experimental').setValue(lobbySettings.experimental);
        },
        draw: () => {
            fill(255);
            noStroke();
            textAlign(CENTER);
            textSize(30);
            text(lobbyName, 200, 40);

            textSize(20);

            text('Player mass multiplier', 200, 100);
            text('Bouncy walls (% chance)', 200, 175);

            textAlign(RIGHT);
            text('Experimental', 175, 275 + 20/3);
        }
    })
    .addSlider({
        position: { x: 200, y: 130 },
        width: 200,
        min: 0.25,
        max: 2,
        value: 1,
        increment: 0.25,
        textSize: 15,
        label: 'lobby settings mass'
    })
    .addSlider({
        position: { x: 200, y: 205 },
        width: 200,
        min: 0,
        max: 100,
        value: 25,
        increment: 25,
        textSize: 20,
        label: 'lobby settings bounceChance'
    })
    .addCheckbox({
        position: { x: 235, y: 275 },
        size: 20,
        value: false,
        label: 'lobby settings experimental'
    })
    .addButton({
        position: { x: 200, y: 370 },
        width: 100,
        height: 30,
        text: 'APPLY',
        textSize: 20,
        onClick: () => {
            closeOverlay();
            addGameMessage('Settings applied. They will come into effect in the next round.')
            sounds.message.play();

            let experimental = getElement('lobby settings experimental').value;
            let mass = getElement('lobby settings mass').value;
            let bounceChance = getElement('lobby settings bounceChance').value / 100;

            socket.emit('new settings', { experimental, mass, bounceChance });
        }
    });
}

screens.push(addChangeSettingsOverlay);