let gameTime;

let gameSize = {
    x: 0,
    y: 0,
    z: 1,
    w: 54,
    h: 36
};

function calculateGameSize() {
    let screenRatio = baseWidth / baseHeight;
    let gameRatio = gameSize.w / gameSize.h;

    if (screenRatio > gameRatio) {
        // The screen is wider than required
        gameSize.z = baseHeight / gameSize.h;
    } else {
        // The screen is taller than required
        gameSize.z = baseWidth / gameSize.w;
    }

    gameSize.x = (baseWidth - gameSize.w * gameSize.z) * 0.5;
    gameSize.y = (baseHeight - gameSize.h * gameSize.z) * 0.5;
}

let timer = {
    time: -1,
    maxTime: 0,
    text: ""
}

let scoreboard = [];
let playersMap = new Map();
let playersArray = [];
let host = null;
let lobbySettings = {};
let lobbySettingsText = [];

let lastWinner = null;
let gameover = false;
let streak = 0;

// Sets the timer up
function setTimer(time, text) {
    timer.maxTime = time;
    timer.time = time;
    timer.text = text;
}

let gameMessageLines = ['', '', '', '', '', '', '', '', '', '', '', ''];
let gameMessageTimes = [180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180];
let nextGameMessage = 0;
// const MAXGAMEMESSAGES = 5;

function addGameMessage(msg) {
    let lines = wrapText(msg, 30, 700);
    lines.push('');

    let allDone = true;
    for (let time of gameMessageTimes) {
        if (time < 180) allDone = false; 
    }
    if (allDone) nextGameMessage = 0;

    if (nextGameMessage + lines.length > gameMessageLines.length) {
        let count = nextGameMessage + lines.length - gameMessageLines.length;
        for (let i = 0; i < count; i++) {
            gameMessageLines.splice(0, 1);
            gameMessageTimes.splice(0, 1);
            gameMessageLines.push('');
            gameMessageTimes.push(180);
            nextGameMessage--;
        }
    }

    for (let line of lines) {
        gameMessageLines[nextGameMessage] = line;
        gameMessageTimes[nextGameMessage] = 0;
        nextGameMessage++;
    }
}

function updateGameMessages() {
    for (let i = gameMessageLines.length - 1; i >= 0; i--) {
        gameMessageTimes[i]++;
        if (gameMessageTimes[i] >= 180) {
            gameMessageLines[i] = '';
        }
    }
}

function drawGameMessages() {
    push();
    textSize(30);
    textAlign(CENTER);
    noStroke();

    for (let i = 0; i < gameMessageTimes.length; i++) {
        if (gameMessageLines[i] == '') continue;

        let a = 1;
        if (gameMessageTimes[i] >= 170) {
            a = (180 - gameMessageTimes[i]) / 10;
        }

        let y = 100 + i * 40;
        fill(0, 100 * a);
        rect(450, y, textWidth(gameMessageLines[i]) + 10, 40);

        fill(255, 255 * a);
        text(gameMessageLines[i], 450, y + 10);
    }

    pop();
}

let chatHidden = false;
let textboxHidden = true;
let typing = false;
let paused = false;

// let RECORDMODE = false;

let gs = {
    // Properties about the game currently being shown
    platforms: [],
    entities: [],
    players: [],
    particles: [],
    // nextWeaponX: null,
    nextWeapon: { x: null, time: 0 },
    bulletBounce: false,

    // Reset arrays and store static platforms
    newGame: function(platforms, bulletBounce) {
        this.resetGame();
        this.platforms = platforms;
        this.bulletBounce = bulletBounce;
        gameTime = 0;
        gameover = false;
        chatHidden = false;
        textboxHidden = true;
        getElement('game chat output').hide(false);
        getElement('game chat input').hide(true);
    },

    // Reset arrays and store static platforms
    resetGame: function() {
        this.platforms = [];
        this.dynamic = [];
        this.players = [];
        this.particles = [];
        // this.nextWeaponX = null;
        this.nextWeapon = { x: null, time: 0 };
        this.bulletBounce = false;
    },

    // Update arrays when the server sends data
    updateDynamic: function(data) {
        this.entities = data.entities;
        this.players = data.players;
        // this.nextWeaponX = data.nextWeaponX;
        this.nextWeapon = data.nextWeapon;

        // Update particles at the same rate as the server sends data
        for (var i = 0; i < this.particles.length; i++) {
            if (this.particles[i].update()) {
                this.particles.splice(i, 1);
                i--;
            }
        }

        gameTime++;
    },

    // Create several particles which will move around
    particleExplosion: function(options) {
        for (var i = 0; i < options.num; i++) {
            if (options.velErr) {
                options.vel += (Math.random() - 0.5) * 2 * options.velErr;
            }
            if (options.angleErr) {
                options.angle += (Math.random() - 0.5) * 2 * options.angleErr;
            }
            if (options.lifeErr) {
                options.life += (Math.random() - 0.5) * 2 * options.lifeErr;
            }
            if (!options.gravity) {
                options.gravity = 0;
            }

            let p = new Particle(options.x, options.y, options.vel, options.angle, options.gravity, options.r, options.col, options.life);
            this.particles.push(p);
        }
    },

    show: function() {
        push();
        translate(gameSize.x, gameSize.y);
        // Zoom in/out depending on the scale
        scale(gameSize.z);
        translate(0, gameSize.h * 0.5);
        scale(1, -1);
        translate(0, - gameSize.h * 0.5);
    
        for (var i = 0; i < this.platforms.length; i++) {
            drawObject(this.platforms[i]);
        }
    
        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].hide !== true) {
                drawObject(this.entities[i]);
            }
        }
    
        for (var i = 0; i < this.players.length; i++) {
            drawPlayer(this.players[i]);
        }
    
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].show();
        }
    
        for (var i = 0; i < this.players.length; i++) {
            drawNameTag(this.players[i]);
        }
    
        for (var i = 0; i < this.players.length; i++) {
            drawPlayerWeapon(this.players[i]);
        }
    
        for (var i = 0; i < this.players.length; i++) {
            drawOffScreenPlayer(this.players[i]);
        }
    
        // Draw arrow for next weapon drop
        if (this.nextWeapon.x !== null) {
            let a = 150;
            if (this.nextWeapon.time < 75) {
                a = a / 2 * (Math.sin((this.nextWeapon.time - 15) / 15 * Math.PI + Math.PI / 2) + 1);
            }
            fill(200, a);
            noStroke();
        
            // Draw the triangle
            push();
            translate(0, gameSize.h * 0.5);
            scale(1, -1);
            translate(0, -gameSize.h * 0.5);
            translate(this.nextWeapon.x, 2);
            beginShape();
            vertex(0, 0);
            vertex(1.33, -2);
            vertex(-1.33, -2);
            endShape(CLOSE);
            pop();
        }
    
        pop();

        // Draw the border of the game screen
        noFill();
        if (gameover && !settings.recordmode) fill(0, 100);
        stroke(200);
        strokeWeight(4);
        // Thicker border is bullet bounce is active
        if (this.bulletBounce) {
            let sin = Math.sin((gameTime / 60 - 0.5) * Math.PI);
            stroke(200 + (sin + 1) * 27.5);
            strokeWeight(4 + (sin + 1) * 5);
        }
        rect(baseWidth * 0.5, baseHeight * 0.5, gameSize.w * gameSize.z, gameSize.h * gameSize.z);
    
        // Draw rectangles around the game screen so all players have equal vision
        fill(60);
        noStroke();
        rect(baseWidth * 0.5, gameSize.y * 0.5, baseWidth, gameSize.y + 1);
        rect(baseWidth * 0.5, baseHeight - gameSize.y * 0.5, baseWidth, gameSize.y + 1);
        rect(gameSize.x * 0.5, baseHeight * 0.5, gameSize.x + 1, baseHeight);
        rect(baseWidth - gameSize.x * 0.5, baseHeight * 0.5, gameSize.x + 1, baseHeight);

        // if (this.bulletBounce) {
        //     // stroke(255);
        //     // strokeWeight(4);
        //     let size = 2 + (Math.sin((gameTime / 60 - 0.5) * Math.PI) + 1) * 2;
        //     fill(255);
        //     noStroke();

        //     rect(baseWidth * 0.5, size * 0.5, baseWidth, size);
        //     rect(baseWidth * 0.5, baseHeight - size * 0.5, baseWidth, size);
        //     rect(size * 0.5, baseHeight * 0.5, size, baseHeight);
        //     rect(baseWidth - size * 0.5, baseHeight * 0.5, size, baseHeight);
        // }
    
        // Draw the lobby name in the top left
        // drawText(lobbyName, {
        //     x: 25,
        //     y: 25,
        //     textSize: 20,
        //     xEdge: true
        // });
        // push();
        // fill(255);
        // noStroke();
        // textSize(20);
        // textAlign(LEFT);
        // text(lobbyName, 25, 25);
        // pop();
    
        if (gameover && !settings.recordmode) {
            fill(255);
            noStroke();
            textSize(150);
            textAlign(CENTER);
            if (lastWinner != null) {
                text('WINS', 450, 300);

                let name;
                if (typeof lastWinner != 'number') {
                    name = playersMap.get(lastWinner).name;
                } else {
                    name = 'Team ' + colourOrder[lastWinner][0].toUpperCase() + colourOrder[lastWinner].slice(1);
                }

                let tSize = Math.min(100, 500 / 0.54 / name.length);
                textSize(tSize);
                text(name, 450, 150);
                
                // Win streak
                if (streak >= 2) {
                    push();
                    translate(450 + Math.max(0.5 * textWidth(name), 250), 140 - tSize * 2/3);
                    rotate(0.3);

                    // Different effects based on how high the win streak is
                    // if (streak >= 3) {
                        textSize(27.5 + 2.5 * Math.sin(gameTime / 7.5));
                    // } else {
                    //     textSize(27.5);
                    // }

                    if (streak >= 3) {
                        fill(255, 127.5 * (Math.sin(gameTime / 5) + 1), 0);
                    } else {
                        fill(255, 255, 0);
                    }

                    if (streak >= 5) {
                        rotate(0.2 * Math.sin(gameTime / 10));
                    }

                    if (streak >= 10) {
                        let angle = -gameTime / 5;
                        translate(10 * Math.cos(angle), 10 * Math.sin(angle));
                    }

                    text(`${streak}x streak!`, 0, 0);    
                    pop();
                }

            } else {
                text('DRAW', 450, 300);
            }
        }

        // Scoreboard
        if ((gameover && !settings.recordmode) || keyIsDown(9)) {
            textSize(30);
            fill(255);
            noStroke();
            let len = Math.min(5, scoreboard.length);
            // Puts the hyphen exactly in the middle of the screen
            let x = 425.7;
            // Puts the leaderboard exactly in the middle of the screen
            let y = gameover ? 375 : 330 - len * 20;
            let tempY;

            textAlign(RIGHT);
            // y = 375;
            tempY = y;
            for (let i = 0; i < len; i++) {
                text(scoreboard[i].name, x, tempY);
                tempY += 40;
            }

            textAlign(LEFT);
            tempY = y;
            for (let i = 0; i < len; i++) {
                text(` - ${scoreboard[i].score}`, x, tempY);
                tempY += 40;
            }

            if (scoreboard.length > 5) {
                textSize(25);
                textAlign(CENTER);
                text(`and ${scoreboard.length - 5} more`, 450, tempY);
            }
        }
    
        // if (timer.time > 0 && timer.maxTime > 0) {
        //     timer.time--;
        
        //     // Draw the timer
        //     push();
        //     var progress = 1 - (timer.time / timer.maxTime);
        
        //     // var { x, y, w } = getPosSize({
        //     //     type: 'circle',
        //     //     x: 0.5,
        //     //     y: 0.2,
        //     //     w: 50
        //     // });
        
        //     fill(255);
        //     noStroke();
        //     translate(450, 120);
        //     textAlign(CENTER);
        //     textSize(25);
        //     if (timer.text) {
        //         text(timer.text, 0, -65);
        //     }
        //     rotate(-HALF_PI);
        //     arc(0, 0, 75, 75, 0, progress * TWO_PI, PIE);
        //     pop();
        
        //     // fill(255);
        //     // noStroke();
        //     // translate(width * 0.5, 100);
        //     // textAlign(CENTER);
        //     // textSize(15);
        //     // var timerR = 50;
        //     // if (timer.text) {
        //     //   text(timer.text, 0, -timerR * 0.5 - 15);
        //     // }
        //     // rotate(-HALF_PI);
        //     // arc(0, 0, timerR, timerR, 0, progress * TWO_PI, PIE);
        //     // pop();
        // }
    
        // if ((timer.time > 0 && timer.maxTime > 0) || (keyIsDown(76) && !typing)) {
        //     // Draw the scoreboard
        //     push()
        //     var txt = '';
        //     for (var i = 0; i < scoreboard.length; i++) {
        //         txt += `${scoreboard[i].name}: ${scoreboard[i].score}`;
        //         if (i < scoreboard.length - 1) {
        //         txt += '\n';
        //         }
        //     }
        
        //     fill(255);
        //     noStroke();
        //     textAlign(CENTER, CENTER);
        //     textSize(40);
        //     text(txt, 450, 300);
        //     pop();
        // }

        // Calculate ping every 2000ms (2 seconds)
        if (Date.now() - pingSent > 2000) {
            // Update the last time that a ping was sent
            pingSent = Date.now();
            socket.emit('pingCheck');
        }
    
        // Show the ping time if 'P' is pressed
        if (keyIsDown(9)) {
            textAlign(LEFT);
            textSize(24);
            fill(255);
            noStroke();
            text('Ping: ' + pingTime + 'ms', 25, 45);
        }
    }
}

function addGameScreen() {
    let showY = 20;
    let hideY = -5;
    let y = hideY;
    let onScreen = false;

    addScreen('game', {
        style: 'game',
        getCursorState: () => {
            if (settings.crosshair && !typing) return 'game';
        },
        update: () => {
            // Send the mouse position to the server to aim weapons
            var data = mouseToGamePos();
            socket.emit('update', data);

            // // Calculate ping every 2000ms (2 seconds)
            // if (Date.now() - pingSent > 2000) {
            //     // Update the last time that a ping was sent
            //     pingSent = Date.now();
            //     socket.emit('pingCheck');
            // }

            if (chatHidden == ((lastMessage < 240 && !settings.recordmode) || typing)) {
                chatHidden = !chatHidden;
                getElement('game chat output').hide(chatHidden);
            }

            if (textboxHidden == (!settings.recordmode || typing)) {
                textboxHidden = !textboxHidden;
                getElement('game chat input').hide(textboxHidden);
            }
        },
        draw: () => {
            gs.show();

            updateGameMessages();
            drawGameMessages();

            fill(255);
            noStroke();
            textSize(15);
            textAlign(CENTER);

            text("Press ESC to open menu", 450, y);

            // let mousePos = getScreen('game').mousePos;

            // if (onScreen && mousePos.y < 50) {
            if ((gameover && !settings.recordmode) || keyIsDown(9)) {
                if (y < showY) y += 7
            } else {
                if (y > hideY) y -= 7
            }
        },
        changeScreen: (leavingScreen, oldScr, newScr) => {
            if (leavingScreen) {
                // filter.toggle(false);
                onScreen = false;
                setFilter(false);

                let gameInput = getElement('game chat input');
                let pauseInput = getElement('pause chat input');

                pauseInput.setValue(gameInput.value);
                // pauseInput.value = gameInput.value;
                // pauseInput.cursorPos = gameInput.cursorPos;
                // pauseInput.selectionStart = gameInput.selectionStart;
                // pauseInput.clipText();
            } else {
                onScreen = true;
                paused = false;
                socket.emit('status change', { key: 'paused', value: false });
                // filter.toggle(true);
                setFilter(true);
            }
        }
    })
    .on('keyDown', e => {
        if (e.key == 'Enter') {
            getElement('game chat input').focus();

        } else if (e.key == 'Escape') {
            paused = true;
            socket.emit('status change', { key: 'paused', value: true });
            openOverlay('pause');
        }

        if (!typing) {
            for (let key in controls) {
                // If found control matching the key/button pressed, emit a press event to the server
                if (e.which == controls[key]) {
                    socket.emit('press', key);
                }
            }
        }
    })
    .on('keyUp', e => {
        for (let key in controls) {
            // If found control matching the key/button pressed, emit a press event to the server
            if (e.which == controls[key]) {
                socket.emit('release', key);
            }
        }
    })
    .on('mouseDown', e => {
        let txt = 'Mouse ' + e.button;
        for (let key in controls) {
            // If found control matching the key/button pressed, emit a press event to the server
            if (txt == controls[key]) {
                socket.emit('press', key);
            }
        }
    })
    .on('mouseUp', e => {
        let txt = 'Mouse ' + e.button;
        for (let key in controls) {
            // If found control matching the key/button pressed, emit a press event to the server
            if (txt == controls[key]) {
                socket.emit('release', key);
            }
        }
    })
    .addTextbox({
        position: { x: 20, y: 580 },
        width: 300,
        height: 25,
        default: 'Press enter to send a message',
        onSubmit: txt => {
            socket.emit('chat message', txt);
        },
        clickToFocus: false,
        maxLength: 100,
        onFocus: () => setTyping(true),
        onBlur: () => setTyping(false),
        label: 'game chat input'
    })
    .addChatbox({
        position: { x: 20, y: 555 },
        width: 300,
        height: 110,
        lineHeight: 22,
        label: 'game chat output'
    });
}

screens.push(addGameScreen);

function setTyping(value) {
    typing = value;
    socket.emit('status change', { key: 'typing', value });
}

// Convert a client-side mouse position into a position in the game map
function mouseToGamePos() {
    let mousePos = getScreen('game').mousePos;
    var x = (mousePos.x - gameSize.x) / gameSize.z;
    var y = gameSize.h - (mousePos.y - gameSize.y) / gameSize.z;
    return { x, y };
}

function drawPlayer(obj) {
    // let colourIndex = obj.colour % colourOrder.length;
    // let colour = playerColours[colourOrder[colourIndex]];
    let colour = getPlayerColour(obj);
    push();
    translate(obj.x, obj.y);
    rotate(obj.angle); // Rotate to draw the gun in the right place
    fill(colour);
    stroke(0);
    strokeWeight(1 / 15);
    ellipse(0, 0, obj.r * 2); // Draw player circle
    line(0, 0, obj.r, 0); // Draw direction the player is aiming
    pop();
}

function drawPlayerWeapon(obj) {
    push();
    translate(obj.x, obj.y);
    rotate(obj.angle);
    if (obj.weapon) { // Draw player's weapon
        var weaponObj = obj.weapon;
        weaponObj.angle = 0; // Relative to player's angle and position
        weaponObj.x = obj.r;
        weaponObj.y = 0;
        weaponObj.hide = false;
        drawObject(weaponObj);
    } else {
        if (obj.shield) { // Draw player's shield
            fill(200);
            noStroke();
            rect(obj.r + 0.5, 0, 0.5, obj.shieldWidth);
        } else if (obj.id == myid && !settings.recordmode) {
            fill(200, 50);
            noStroke();
            rect(obj.r + 0.5, 0, 0.5, obj.shieldWidth);
        }
    }
    pop();
}

// Draws the names of all players below them, as well as a crown on the previous winner
function drawNameTag(obj) {
    let player = playersMap.get(obj.id);
    push();
    translate(obj.x, obj.y);
    scale(1, -1)
    fill(255);
    noStroke();
    textAlign(CENTER);
    scale(1 / 15);

    push();
    textSize(12);
    if (obj.id == myid) {
        // textStyle(BOLD);
        textSize(14);
        translate(0, 2/3);
    }

    if (settings.shownames) {
        // let name = playersMap.get(obj.id).name;
        text(player.name, 0, 15 * obj.r + 14);
        // pop();
    }

    // Show mass
    if (settings.showmass) {
        // push();
        if (obj.id == lastWinner && !settings.recordmode) translate(0, -15);
        text(obj.stat, 0, -15 * obj.r - 6);
    }
    pop();

    scale(15);

    // Draw circle around local player at the start of the game
    if (gameTime < 180 && obj.id == myid && !settings.recordmode) {
        noFill();
        // let colourIndex = obj.colour % colourOrder.length;
        // let colour = playerColours[colourOrder[colourIndex]];
        let colour = getPlayerColour(obj);
        var c = color(colour);
        c.setAlpha(75 + 75 * Math.cos(gameTime * 2 * Math.PI / 40));
        stroke(c);
        strokeWeight(obj.r);
        ellipse(0, 0, obj.r * 4, obj.r * 4);
    }

    // Draw crown on previous winner
    if (obj.id == lastWinner && !settings.recordmode) {
        fill(255, 150, 0);
        stroke(255, 255, 0);
        strokeWeight(1 / 15);
        var r = obj.r;
        beginShape();
        vertex(-r, -r - 0.33);
        vertex(-r, -r - 1);
        vertex(-r * 0.5, -r - 0.67);
        vertex(0, -r - 1);
        vertex(r * 0.5, -r - 0.67);
        vertex(r, -r - 1);
        vertex(r, -r - 0.33);
        endShape(CLOSE);
    }

    // Icons
    if ((player.ping > 500 || player.typing || player.paused) && !settings.recordmode) {
        translate(0, -0.75 - obj.r);
        noStroke();

        if (settings.showmass) translate(0, -1.33);
        if (obj.id == lastWinner) translate(0, -1);

        if (player.ping > 500) {
            noFill();
            strokeWeight(0.2);
            let framePosition = gameTime % 60;
            if (framePosition >= 50) {
                stroke(255, 127.5 * (Math.sin((framePosition - 50) / 10 * Math.PI + Math.PI / 2) + 1));
            } else {
                stroke(255);
            }

            for (let i = 0; i < 3; i++) {
                if (framePosition < 30) {
                    if (framePosition < i * 10) {
                        noStroke();
                    } else if (framePosition < 10 + i * 10) {
                        let rel = framePosition - i * 10;
                        stroke(255, 127.5 * (Math.sin(rel / 10 * Math.PI - Math.PI / 2) + 1));
                    } else {
                        stroke(255);
                    }
                }

                let r = 0.5 + i * 0.75;
                arc(0, 0.5, r, r, - Math.PI * 3 / 4, - Math.PI / 4);
            }
        } else if (player.typing) {
            fill(255);
            for (let i = -1; i < 2; i++) {
                let size = Math.sin(gameTime / 20 - i * Math.PI / 3) + 1;
                ellipse(i * 0.75, 0, 0.3 * size);
            }
        } else {
            fill(255, 127.5 * (Math.sin(gameTime / 10) + 1));
            rect(-0.3, 0, 0.3, 0.75);
            rect(0.3, 0, 0.3, 0.75);
        }
    }

    pop();
}

function drawOffScreenPlayer(obj) {
    if (obj.x - obj.r > gameSize.w || obj.x + obj.r < 0 || obj.y - obj.r > gameSize.h || obj.y + obj.r < 0) {
        push();
        // Player is offscreen and an offscreen arrow needs to be drawn
        var x = obj.x;
        var y = obj.y;
        var buffer = obj.r * 2;

        if (x < buffer) {
            x = buffer;
        } else if (x > gameSize.w - buffer) {
            x = gameSize.w - buffer;
        }
        if (y < buffer) {
            y = buffer;
        } else if (y > gameSize.h - buffer) {
            y = gameSize.h - buffer;
        }
        translate(x, y);
        // let colourIndex = obj.colour % colourOrder.length;
        // let colour = playerColours[colourOrder[colourIndex]].slice();
        let colour = getPlayerColour(obj).slice();
        // var colour = obj.colour;
        colour.push(50);
        fill(colour);
        stroke(0, 50);
        strokeWeight(1 / 15);
        ellipse(0, 0, obj.r * 2);

        if (settings.showmass) {
            scale(1 / 15);
            scale(1, -1);
            fill(255, 150);
            noStroke();
            textSize(15);
            textAlign(CENTER);
            text(obj.stat, 0, 5);
        }

        pop();
    }
}

//How to draw every possible game object - may split this into seperate functions as more game objects are added
function drawObject(obj) {
    push();
    switch (obj.type) {
    case 'platform': // Simple rectangle
        // translate(obj.x, obj.y);
        // rotate(obj.angle);
        fill(platformColours[obj.colour].fill);
        stroke(platformColours[obj.colour].edge);
        strokeWeight(platformColours[obj.colour].weight || 1 / 15);
        translate(obj.x, obj.y);
        rotate(obj.angle);
        beginShape();
        for (var v of obj.vertices) {
            vertex(v.x, v.y);
        }
        endShape(CLOSE);
        // rect(0, 0, obj.w, obj.h);
        break;
    case 'weapon': // Rectangle for now - may add graphics
        translate(obj.x, obj.y);
        rotate(obj.angle);
        fill(100);
        stroke(0);
        strokeWeight(1 / 15);
        rect(0, 0, obj.w, obj.h);
        break;
    case 'bullet': // Long thin rectangle to show it is a fast bullet
        translate(obj.x, obj.y);
        rotate(obj.angle)
        fill(obj.reflected ? [255, 155, 0] : [255, 255, 0]);
        noStroke();
        rect(-obj.r * 1.5, 0, obj.r * 15, obj.r);
        break;
    }
    pop();
}

function getPlayerColour(player) {
    let colourIndex = player.colour % colourOrder.length;
    return playerColours[colourOrder[colourIndex]];
}

let colourOrder = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'cyan', 'grey'];
let playerColours = {
    red: [255, 0, 0],
    orange: [255, 153, 0],
    yellow: [255, 255, 0],
    green: [0, 255, 0],
    cyan: [0, 255, 255],
    blue: [0, 0, 255],
    purple: [255, 0, 255],
    grey: [200]
};

var platformColours = {
    default: {
        fill: 200,
        edge: 150,
        weight: 1 / 15
    },
    spike: {
        fill: 25,
        edge: 75
        // weight: 0.2
    },
    red: {
        fill: [200, 0, 0],
        edge: [150, 0, 0]
    },
    orange: {
        fill: [200, 120, 0],
        edge: [150, 90, 0]
    },
    yellow: {
        fill: [200, 200, 0],
        edge: [150, 150, 0]
    },
    green: {
        fill: [0, 200, 0],
        edge: [0, 150, 0]
    },
    cyan: {
        fill: [0, 200, 200],
        edge: [0, 150, 150]
    },
    blue: {
        fill: [0, 0, 200],
        edge: [0, 0, 150]
    },
    purple: {
        fill: [200, 0, 200],
        edge: [150, 0, 150]
    },
    grey: {
        fill: 150,
        edge: 100
    }
};