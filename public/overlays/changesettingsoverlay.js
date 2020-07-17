function addChangeSettingsOverlay() {
    addOverlay('change lobby settings', {
        width: 400,
        height: 400,
        text: 'Change lobby settings',
        onDisplay: () => {
            getElement('lobby settings mass').setValue(lobbySettings.mass);
            getElement('lobby settings bounceChance').setValue(lobbySettings.bounceChance * 100);
            getElement('lobby settings experimental').setValue(lobbySettings.experimental);
            getElement('lobby settings teams').setValue(lobbySettings.teams);
            getElement('lobby settings numTeams').setValue(lobbySettings.numTeams);

            if (lobbySettings.teams) {
                disableSlider(false);
            } else {
                disableSlider(true);
            }
        },
        draw: () => {
            fill(255);
            noStroke();
            textAlign(CENTER);
            textSize(30);
            text(lobbyName, 200, 40);

            textSize(20);

            text('Player mass multiplier', 200, 80);
            text('Bouncy walls (% chance)', 200, 155);

            textAlign(RIGHT);
            text('Experimental', 175, 230 + 20/3);
            text('Teams', 175, 270 + 20/3);
        },
        postDraw: () => {
            if (numTeamsDisabled) {
                fill(150, 150);
                noStroke();
                rect(200, 310 + 20 / 3, 165, 40);
            }
        }
    })
    .addSlider({
        position: { x: 200, y: 110 },
        width: 200,
        min: 0.25,
        max: 2,
        value: 1,
        increment: 0.25,
        textSize: 15,
        label: 'lobby settings mass'
    })
    .addSlider({
        position: { x: 200, y: 185 },
        width: 200,
        min: 0,
        max: 100,
        value: 25,
        increment: 25,
        textSize: 20,
        label: 'lobby settings bounceChance'
    })
    .addCheckbox({
        position: { x: 235, y: 230 },
        size: 20,
        value: false,
        label: 'lobby settings experimental'
    })
    .addCheckbox({
        position: { x: 235, y: 270 },
        size: 20,
        value: false,
        onClick: v => disableSlider(!v),
        label: 'lobby settings teams'
    })
    .addSlider({
        position: { x: 200, y: 310 + 20/3 },
        width: 125,
        min: 2,
        max: 4,
        value: 2,
        textSize: 20,
        label: 'lobby settings numTeams'
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
            let teams = getElement('lobby settings teams').value;
            
            let settings = { experimental, mass, bounceChance, teams };

            if (teams) {
                settings.numTeams = getElement('lobby settings numTeams').value;
            }

            socket.emit('new settings', settings);
        }
    });

    let numTeamsSlider = getElement('lobby settings numTeams');
    let numTeamsDisabled = false;
    function disableSlider(v) {
        numTeamsSlider.disable(v);
        numTeamsDisabled = v;
    }
}

screens.push(addChangeSettingsOverlay);