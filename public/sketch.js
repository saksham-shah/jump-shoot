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
        outdated = true;

        localStorage.setItem('controls', JSON.stringify(controls));
        localStorage.setItem('controlKeys', JSON.stringify(controlKeys));
        localStorage.setItem('settings', JSON.stringify(settings));
        localStorage.setItem('name', playerName);

    } else if (!(localStorage.getItem('controls') && localStorage.getItem('controlKeys') && localStorage.getItem('settings') && localStorage.getItem('name'))) {
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
        updatePlayers(data.scoreboard);
        lastWinner = null;
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

        getElement('game chat output').clear();
        getElement('pause chat output').clear();
    });

    // Name updated
    socket.on('name updated', function(name) {
        playerName = name;
        localStorage.setItem('name', name);
    });

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
        // scoreboard = data.scoreboard;
        updatePlayers(data.scoreboard);
        if (data.winnerId) {
            lastWinner = data.winnerId;
        }
        // chat.newMessage(SERVER, "Game over");
        // Check if there is a single winner
        if (data.winner) {
            chatMessage(SERVER, "Winner: " + data.winner);
        } else { // If no winner, it's a draw
            chatMessage(SERVER, "Winner: NONE - it's a draw");
        }
    });

    // New player in lobby
    socket.on('player joined', function(name) {
        chatMessage(SERVER, name + " joined the lobby");
    });

    // Player left the lobby
    socket.on('player left', function(name) {
        chatMessage(SERVER, name + " left the lobby");
    });

    // New message in the chat
    socket.on('chat message', function(data) {
        chatMessage(data.sender, data.message);
        if (data.sender != SERVER) {
            sounds.message.play();
        }
    });

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