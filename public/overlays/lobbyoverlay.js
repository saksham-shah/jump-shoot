let lobbyTable;

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
    addOverlay('lobbies', {
        width: 810,
        height: 330,
        text: 'Lobbies'
    })
    // .addButton({
    //     position: { x: 175, y: 440 },
    //     width: 250,
    //     height: 40,
    //     text: 'Controls',
    //     textSize: 30,
    //     onClick: () => openOverlay('controls')
    // })
    // .addButton({
    //     position: { x: 725, y: 440 },
    //     width: 250,
    //     height: 40,
    //     text: 'Join private',
    //     textSize: 30,
    //     onClick: () => setScreen('game')
    // })
    .addTable({
        position: { x: 0, y: 30 },
        width: 810,
        height: 300,
        rowHeight: 30,
        scrollbarWidth: 10,
        columnWidths: [350, 100, 250, 100],
        columnTitles: ['Name', 'Players', 'Mode', 'Password'],
        columnData: ['name', 'players', 'mode', 'password'],
        onClick: obj => socket.emit('join lobby', obj.name),
        label: 'lobby table'
    });

    lobbyTable = getElement('lobby table');
}

screens.push(addLobbyScreen);