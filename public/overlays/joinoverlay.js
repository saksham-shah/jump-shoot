function addJoinOverlay() {
    // let joining = false;
    let joiningLobby = '';
    let joinError = '';

    addOverlay('join lobby', {
        width: 400,
        height: 150,
        text: 'Joining lobby',
        onDisplay: (lobby, err) => {
            joiningLobby = lobby;
            joinError = err;
            // console.log(lobby, err);
            errorText = '';
            
            let passwordTextbox = getElement('password enter input');
            passwordTextbox.clear();

            if (err == 'password needed' || err == 'password incorrect') {
                getElement('password enter button').hide(false);
                passwordTextbox.hide(false);
                passwordTextbox.focus();

                if (err == 'password incorrect') errorText = 'Password incorrect';
            } else {
                getElement('password enter button').hide(true);
                passwordTextbox.hide(true);
            }
        },
        draw: () => {
            // textSize(20);
            // textAlign(CENTER);
            // noStroke();
            // fill(255);

            // if (joining) {  
            //     text('Joining lobby', 200, 50);
    
            //     let numCircles = 2, r = 10, gap = 30;
            //     for (let i = -numCircles; i <= numCircles; i++) {
            //         let size = 0.5 * (Math.sin(frameCount / 20 + i * Math.PI / (numCircles * 2 + 1)) + 1)
            //         ellipse(200 - i * gap, 62.5, 2 * r * size);
            //     }
            // }

            textAlign(CENTER);
            noStroke();

            if (joinError == 'password needed' || joinError == 'password incorrect') {
                textSize(20);
                fill(255);
                text('Enter password', 200, 40);

                if (errorText.length > 0) {
                    fill(255, 0, 0);
                    textSize(15);
                    text(errorText, 200, 95);
                } 
            } else if (joinError == 'lobby full') {
                fill(255);
                textSize(20);
                text('Lobby full.', 200, 50 + 20 / 3);
                text('Try again later.', 200, 100 + 20 / 3);
            }
        }
    })
    .addButton({
        position: { x: 200, y: 120 },
        width: 75, 
        height: 25,
        text: 'JOIN',
        textSize: 15,
        onClick: b => {
            let passwordTextbox = getElement('password enter input');

            let pass = passwordTextbox.value;
            if (pass.length == 0) {
                errorText = 'Enter password';
                return;
            }

            // let lobbyName = joiningLobby;
            // console.log(`Password entered: '${pass}' to join lobby '${lobbyName}'`);

            // passwordTextbox.clear();
            // passwordTextbox.hide(true);
            // b.hide(true);
            // joining = true;

            socket.emit('join lobby', { name: joiningLobby, password: pass });
        },
        hidden: true,
        label: 'password enter button'
    })
    .addTextbox({
        position: { x: 75, y: 75 },
        width: 250,
        height: 25,
        default: 'Enter password',
        onSubmit: txt => {
            getElement('password enter button').click();
        },
        maxLength: 32,
        allowEmptySubmit: true,
        blurOnSubmit: false,
        clearOnSubmit: false,
        hidden: true,
        label: 'password enter input'
    });
}

screens.push(addJoinOverlay);