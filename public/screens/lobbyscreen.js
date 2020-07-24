let lobbyTable;

// Update the lobby table
function updateLobbies(lobbies) {
    lobbyTable.clear();
    for (let lobby of lobbies) {
        lobbyTable.addItem({
            name: lobby.name,
            players: lobby.players.length + '/' + lobby.maxPlayers,
            mode: lobby.experimental ? 'Experimental' : 'Classic',
            password: lobby.password ? 'Yes' : 'No'
        });
    }
}

function addLobbyScreen() {
    addScreen('lobbies', {
        text: 'Lobbies'
    })
    .addTable({
        position: { x: 45, y: 110 },
        width: 810,
        height: 300,
        rowHeight: 30,
        scrollbarWidth: 10,
        columnWidths: [350, 100, 250, 100],
        columnTitles: ['Name', 'Players', 'Mode', 'Password'],
        columnData: ['name', 'players', 'mode', 'password'],
        onClick: obj => socket.emit('join lobby', { name: obj.name }),
        label: 'lobby table'
    })
    .addButton({
        position: { x: 315, y: 450 },
        width: 250,
        height: 40,
        text: 'CREATE LOBBY',
        textSize: 25,
        onClick: () => openOverlay('create lobby')
    })
    .addButton({
        position: { x: 585, y: 450 },
        width: 250,
        height: 40,
        text: 'JOIN PRIVATE',
        textSize: 25,
        onClick: () => openOverlay('join private lobby')
    })
    .addButton({
        position: { x: 450, y: 545 },
        width: 150,
        height: 40,
        text: 'BACK',
        textSize: 20,
        onClick: () => setScreen('menu')
    });

    lobbyTable = getElement('lobby table');
}

screens.push(addLobbyScreen);