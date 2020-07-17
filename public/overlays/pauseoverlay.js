let playerTable;

function getPlayerPing(player) {
    let ping = playersMap.get(player.id).ping;
    if (ping == 0) {
        return '';
    }
    
    if (ping > 999) {
        return '>999ms';
    }

    return ping + 'ms';
}

function getPlayerStatus(player) {
    let playerObj = playersMap.get(player.id);
    if (playerObj.spectate) return 'Spectating';
    if (lobbySettings.teams) {
        let teamName = colourOrder[playerObj.team];
        return 'Team ' + teamName[0].toUpperCase() + teamName.slice(1);
    }
    return '';
}

function updatePlayers(players) {
    // if (players != undefined) {
    //     scoreboard = players;
    // }

    playerTable.clear();
    for (let player of playersArray) {
        let name = player.name;
        if (player.id == host) {
            name = '[HOST] ' + name;
        }
        
        if (player.id == myid) {
            name = '[YOU] ' + name;
        }
        
        playerTable.addItem({
            id: player.id,
            name: name,
            status: getPlayerStatus,
            score: player.score,
            streak: player.streak,
            ping: getPlayerPing
        });

        playersMap.set(player.id, player);
    }
}

function addPauseOverlay() {
    addOverlay('pause', {
        changeScreen: (leavingScreen, oldScr, newScr) => {
            if (leavingScreen) {
                let gameInput = getElement('game chat input');
                let pauseInput = getElement('pause chat input');

                gameInput.setValue(pauseInput.value);
                // gameInput.value = pauseInput.value;
                // gameInput.cursorPos = pauseInput.cursorPos;
                // gameInput.selectionStart = pauseInput.selectionStart;
                // gameInput.clipText();
            }
        },
        postDraw: () => drawGameMessages()
    })
    .on('keyDown', e => {
        if (e.key == 'Enter') {
            getElement('pause chat input').focus();
        }
    })
    .addContainer({
        position: { x: 20, y: 335 },
        width: 300,
        height: 245,
        text: 'Chat',
        header: 25,
        label: 'pause chat container',
        style: 'pause',
        tooltip: 'Talk to the other players in this lobby!'
    })
    .addTable({
        position: { x: 20, y: 50 },
        width: 860,
        height: 240,
        rowHeight: 30,
        scrollbarWidth: 20,
        columnWidths: [310, 130, 125, 150, 125],
        columnTitles: ['Player', '', 'Wins', 'Best streak', 'Ping'],
        columnData: ['name', 'status', 'score', 'streak', 'ping'],
        label: 'player table'
    })
    .addButton({
        position: { x: 480, y: 380 },
        width: 200,
        height: 40,
        text: 'RESUME',
        textSize: 30,
        onClick: () => closeOverlay()
    })
    .addButton({
        position: { x: 740, y: 380 },
        width: 200,
        height: 40,
        text: 'SETTINGS',
        textSize: 30,
        onClick: () => openOverlay('settings')
    })
    .addButton({
        position: { x: 480, y: 445 },
        width: 200,
        height: 40,
        text: () => playersMap.get(myid).spectate ? 'JOIN' : 'SPECTATE',
        textSize: 30,
        onClick: () => socket.emit('spectate')
    })
    .addButton({
        position: { x: 740, y: 445 },
        width: 200,
        height: 40,
        text: 'LOBBY INFO',
        textSize: 30,
        onClick: () => openOverlay('lobby settings')
    })
    .addButton({
        position: { x: 480, y: 510 },
        width: 200,
        height: 40,
        text: 'CHANGE TEAM',
        textSize: 30,
        onClick: () => socket.emit('change team')
    })
    .addButton({
        position: { x: 740, y: 510 },
        width: 200,
        height: 40,
        text: 'LEAVE',
        textSize: 30,
        onClick: () => {
            socket.emit('leave lobby');
        }
    })

    getElement('pause chat container')
    .addTextbox({
        position: { x: 0, y: 245 },
        width: 300,
        height: 25,
        default: 'Press enter to send a message',
        onSubmit: txt => {
            socket.emit('chat message', txt);
        },
        maxLength: 100,
        style: 'game',
        onFocus: () => setTyping(true),
        onBlur: () => setTyping(false),
        label: 'pause chat input',
        tooltip: () => {
            if (!getElement('pause chat input').focused) return 'Press enter to start typing';
            return null;
        }
    })
    .addChatbox({
        position: { x: 0, y: 220 },
        width: 300,
        height: 220,
        lineHeight: 22,
        style: 'chatbox',
        scrollbarWidth: 10,
        label: 'pause chat output'
    });

    playerTable = getElement('player table');
}

screens.push(addPauseOverlay);