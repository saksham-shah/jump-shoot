// Initialise variables
const baseWidth = 900, baseHeight = 600, buffer = 0.9;

const SERVER = '_server';

let myid;
let playerName = '';
let lobbyName = null;

let screens = [];

let socket;
let pingSent = Date.now(); // Used to calculate ping
let pingTime = 0;

let lastMessage = 0;

function chatMessage(sender, message) {
    lastMessage = 0;
    let chatTxt = message;
    let bold = true;
    if (sender != SERVER) {
        chatTxt = sender + ': ' + chatTxt;
        bold = false;
    }
    // getElement('lobby chat output').addText(chatTxt, bold);
    getElement('game chat output').addText(chatTxt, bold);
    getElement('pause chat output').addText(chatTxt, bold);
}

let outdated = false;
let currentVersion = 'ui';

function setup() {
    createCanvas(windowWidth, windowHeight);

    let lastVersion = localStorage.getItem('version');
    if (lastVersion != currentVersion) {
        // localStorage.setItem('version', currentVersion);
        // outdated = true;

        localStorage.setItem('controls', JSON.stringify(controls));
        localStorage.setItem('version', currentVersion);
        // localStorage.setItem('controlKeys', JSON.stringify(controlKeys));
        // localStorage.setItem('settings', JSON.stringify(settings));
        // localStorage.setItem('name', playerName);

    }
    
    if (!(localStorage.getItem('controls') && localStorage.getItem('controlKeys') && localStorage.getItem('settings') && localStorage.getItem('name'))) {
        localStorage.setItem('controls', JSON.stringify(controls));
        localStorage.setItem('controlKeys', JSON.stringify(controlKeys));
        localStorage.setItem('settings', JSON.stringify(settings));
        localStorage.setItem('name', playerName);

    } else {
        controls = JSON.parse(localStorage.getItem('controls'));
        controlKeys = JSON.parse(localStorage.getItem('controlKeys'));
        settings = JSON.parse(localStorage.getItem('settings'));
        playerName = localStorage.getItem('name');
    }

    createUI(baseWidth, baseHeight, buffer);

    for (let screenFunc of screens) {
        screenFunc();
    }

    addStyles();

    setupUI();

    setScreen('loading');

    // Connect to the server
    socket = io.connect();

    // Redefining io() so it can't be used to create bot connections
    io = () => socket;

    // socket.on('debug', data => { debug = data; console.log(`DEBUG: ${debug}`); });

    socket.on('duplicate', () => {
        console.log("duplicate detected (may not be 100% accurate sorry). All features have been disabled for you (just to be safe). Reload the page and all should be good.");
        location.reload();
    });

    socket.on('welcome', socketid => {
        myid = socketid;

        gs.resetGame();

        closeAllOverlays();
        setScreen('loading');
    })

    // Used to calculate ping
    socket.on('pongCheck', () => {
        // Difference between the response time and the time the ping message was sent
        pingTime = Date.now() - pingSent;
    });

    socket.on('lobbies updated', function(lobbies) {
        updateLobbies(lobbies);
    });

    // Lobby is joined
    socket.on('joined lobby', function(data) {
        lobbyName = data.name;
        // scoreboard = data.scoreboard;

        getElement('game chat output').clear();
        getElement('pause chat output').clear();

        playersMap = new Map();
        gameover = false;
        updatePlayers(data.players);
        lastWinner = data.lastWinner;
        streak = data.streak;

        // Send messages in the chat to tell the player they have joined a lobby
        // chat.newMessage(SERVER, "Welcome to the lobby '" + data.name + "'");
        chatMessage(SERVER, "Welcome to the lobby '" + data.name + "'")
        if (data.gameinfo) { // Lobby is currently mid game
            chatMessage(SERVER, "Game ongoing: please wait for it to end");

            gameSize.w = data.gameinfo.width;
            gameSize.h = data.gameinfo.height;
            calculateGameSize();

            // Start displaying the game
            platforms = data.gameinfo.platforms;
            gs.newGame(data.gameinfo.platforms, data.gameinfo.bulletBounce);
        }
        // scr = gs;
        closeAllOverlays();
        setScreen('game');
        timer.time = 0;
        // filter.toggle(false);
    });

    // Lobby is left
    socket.on('left lobby', function() {
        gs.resetGame();
        // scr = ms;
        closeAllOverlays();
        setScreen('menu');
    });

    // Name updated
    socket.on('name updated', function(name) {
        playerName = name;
        localStorage.setItem('name', name);
        invalid = false;
        closeAllOverlays();
    });

    // Entered name is invalid
    socket.on('name invalid', () => invalid = true);

    // Next frame of the game
    socket.on('update', function(data) {
        if (data.type == 'updateGame') {
            gs.updateDynamic(data);
        } else if (data.type == 'startGame') {
            gameSize.w = data.width;
            gameSize.h = data.height;
            calculateGameSize();

            // Start displaying the game
            platforms = data.platforms;
            gs.newGame(data.platforms, data.bulletBounce);
            // chat.newMessage(SERVER, "New game starting");
        }

        if (data.messages) {
            for (var msg of data.messages) {
                chatMessage(SERVER, msg);
            }
        }
    });

    // New particles created
    socket.on('new particles', function(particles) {
        if (settings.particles) {
            for (var i = 0; i < particles.length; i++) {
                gs.particleExplosion(particles[i]);
            }
        }
    });

    // New sounds created
    socket.on('new sounds', function(soundsToPlay) {
        for (let soundName of soundsToPlay) {
            sounds[soundName].play();
        }
    });

    // Game ended
    socket.on('game over', function(data) {
        setTimer(60, "Next game");
        gameover = true;
        // scoreboard = data.scoreboard;
        updatePlayers(data.players);
        streak = data.streak;

        // Check if there is a winner
        if (data.winner) {
            lastWinner = data.winner;
            chatMessage(SERVER, "Winner: " + playersMap.get(data.winner).name);
        } else { // If no winner, it's a draw
            lastWinner = null;
            chatMessage(SERVER, "Winner: NONE - it's a draw");
        }
        // chat.newMessage(SERVER, "Game over");
        // Check if there is a single winner
        // if (data.winner) {
        //     chatMessage(SERVER, "Winner: " + data.winner);
        // } else { // If no winner, it's a draw
        //     chatMessage(SERVER, "Winner: NONE - it's a draw");
        // }
    });

    // New player in lobby
    socket.on('player joined', function(player) {
        chatMessage(SERVER, player.name + " joined the lobby");
        scoreboard.push({ id: player.id, name: player.name, score: 0, streak: 0, ping: 0, typing: false, paused: false });
        updatePlayers();
    });

    // Player left the lobby
    socket.on('player left', function(id) {
        for (let i = 0; i < scoreboard.length; i++) {
            let player = scoreboard[i];
            if (player.id == id) {
                scoreboard.splice(i, 1);
                chatMessage(SERVER, player.name + " left the lobby");
                updatePlayers();
                return;
            }
        }
    });

    // New message in the chat
    socket.on('chat message', function(data) {
        chatMessage(data.sender, data.message);
        if (data.sender != SERVER) {
            sounds.message.play();
        }
    });

    // A player has changed status (e.g. they started typing)
    socket.on('status change', function(change) {
        let player = playersMap.get(change.playerid);
        if (player) {
            player[change.key] = change.value;
        }
    })
}

function draw() {
    updateUI();
    drawUI();

    lastMessage++;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    resizeUI();
}

function wrapText(txt, tSize, lineWidth) {
    function resizeWord(word, lineWidth) {
        if (textWidth(word) <= lineWidth) return [word, ''];
    
        let i = 0, partialWord = '';
        while (i < word.length && textWidth(partialWord + word[i]) <= lineWidth) {
            partialWord += word[i];
            i++;
        }
    
        return [partialWord, word.substring(i)];
    }
    
    push();
    textSize(tSize);
    let words = txt.split(' ');
    let line = '', lines = [], testLine = '', testWidth;
    while (words.length > 0) {
        let word = words.splice(0, 1)[0];
        testLine = line + word;
        if (words.length > 0) testLine += ' ';
        testWidth = textWidth(testLine);
        if (testWidth > lineWidth) {
            if (line == '') {
                let [wordToAdd, remainingWord] = resizeWord(word, lineWidth);
                lines.push(wordToAdd);
                if (remainingWord.length > 0) {
                    words.unshift(remainingWord);
                }
            } else {
                lines.push(line);
                line = '';
                words.unshift(word);
            }
        } else {
            line = testLine;
        }
    }
    lines.push(line);
    pop();
    return lines;
}

function wrapTextWithNewline(txt, tSize, lineWidth) {
    let newlineSplit = txt.split('\n');
    let totalLines = [];

    for (let partialText of newlineSplit) {
        let lines = wrapText(partialText, tSize, lineWidth);

        for (let line of lines) {
            totalLines.push(line);
        }
    }

    return totalLines;
}