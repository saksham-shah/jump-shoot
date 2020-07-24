// Allows players to join a lobby by entering a password
function addJoinOverlay() {
    let joiningLobby = '';
    let joinError = '';

    addOverlay('join lobby', {
        width: 400,
        height: 150,
        text: 'Joining lobby',
        onDisplay: (lobby, err) => {
            joiningLobby = lobby;
            joinError = err;
            errorText = '';
            
            let passwordTextbox = getElement('password enter input');
            passwordTextbox.clear();

            if (err == 'password needed' || err == 'password incorrect') {
                // If a password is needed, display the textbox
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