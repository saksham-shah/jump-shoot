let settingsText = [
    {
        name: 'Experimental',
        value: settings => settings.experimental ? 'Yes' : 'No'
    },
    {
        name: 'Teams',
        value: settings => settings.teams ? settings.numTeams : 'Disabled'
    },
    {
        name: 'Mass multiplier',
        value: settings => `${settings.mass}x`
    },
    {
        name: 'Bouncy walls chance',
        value: settings => `${settings.bounceChance * 100}%`
    }
];

function updateLobbySettingsText() {
    lobbySettingsText = [];
    for (let setting of settingsText) {
        lobbySettingsText.push({
            name: setting.name,
            value: setting.value(lobbySettings)
        });
    }
}

function addLobbySettingsOverlay() {
    addOverlay('lobby settings', {
        width: 400,
        height: 250,
        text: 'Lobby settings',
        draw: () => {
            noStroke();
            fill(255);
            
            textAlign(CENTER);
            textSize(30);
            text(lobbyName, 200, 40);

            textSize(20);
            x = 250;

            textAlign(RIGHT);
            y = 80;
            for (let setting of lobbySettingsText) {
                text(`${setting.name}: `, x, y);
                y += 30;
            }

            textAlign(LEFT);
            y = 80;
            for (let setting of lobbySettingsText) {
                text(setting.value, x, y);
                y += 30;
            }
        }
    })
    .addButton({
        position: { x: 200, y: 220 },
        width: 250,
        height: 30,
        text: 'CHANGE LOBBY SETTINGS',
        textSize: 20,
        onClick: () => {
            closeOverlay();
            if (host == myid) {
                openOverlay('change lobby settings');
            } else {
                addGameMessage('Only the host of this lobby can change the game settings.');
                sounds.message.play();
            }
        }
    })
}

screens.push(addLobbySettingsOverlay);