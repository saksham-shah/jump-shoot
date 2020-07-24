// Allows players to join a private lobby by entering the lobby name
function addJoinPrivateOverlay() {
    addOverlay('join private lobby', {
        width: 400,
        height: 150,
        text: 'Joining lobby',
        onDisplay: () => {
            let nameTextbox = getElement('lobby private input');
            nameTextbox.clear();
            nameTextbox.focus();
            errorText = '';
        },
        draw: () => {
            textAlign(CENTER);
            noStroke();
            textSize(20);
            fill(255);
            text('Enter lobby name', 200, 40);

            if (errorText.length > 0) {
                textSize(15);
                fill(255, 0, 0);
    
                text(errorText, 200, 95);
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
            let nameTextbox = getElement('lobby private input');

            let name = nameTextbox.value;
            if (name.length == 0) {
                errorText = 'Name cannot be empty';
                return;
            }

            socket.emit('join lobby', { name });
        },
        label: 'lobby private button'
    })
    .addTextbox({
        position: { x: 75, y: 75 },
        width: 250,
        height: 25,
        default: 'Enter lobby name',
        onSubmit: txt => {
            getElement('lobby private button').click();
        },
        maxLength: 20,
        allowEmptySubmit: true,
        blurOnSubmit: false,
        clearOnSubmit: false,
        label: 'lobby private input'
    });
}

screens.push(addJoinPrivateOverlay);