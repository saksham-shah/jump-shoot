let playerTable;

function updatePlayers(players) {
    scoreboard = players;
    playerTable.clear();
    for (let player of players) {
        playerTable.addItem({
            name: player.name,
            score: player.score,
            streak: '',
            ping: ''
        });
    }
}

function addPauseOverlay() {
    addOverlay('pause', {
        changeScreen: (leavingScreen, oldScr, newScr) => {
            if (leavingScreen) {
                let gameInput = getElement('game chat input');
                let pauseInput = getElement('pause chat input');

                gameInput.value = pauseInput.value;
                gameInput.cursorPos = pauseInput.cursorPos;
                gameInput.selectionStart = pauseInput.selectionStart;
                gameInput.clipText();
            }
        }
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
        columnWidths: [390, 150, 150, 150],
        columnTitles: ['Player', 'Wins', 'Best streak', 'Ping'],
        columnData: ['name', 'score', 'streak', 'ping'],
        label: 'player table'
    })
    .addButton({
        position: { x: 480, y: 395 },
        width: 200,
        height: 40,
        text: 'RESUME',
        textSize: 30,
        onClick: () => closeOverlay()
    })
    .addButton({
        position: { x: 740, y: 395 },
        width: 200,
        height: 40,
        text: 'SETTINGS',
        textSize: 30,
        onClick: () => openOverlay('settings')
    })
    .addButton({
        position: { x: 480, y: 495 },
        width: 200,
        height: 40,
        text: 'CONTROLS',
        textSize: 30,
        onClick: () => openOverlay('controls')
    })
    .addButton({
        position: { x: 740, y: 495 },
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