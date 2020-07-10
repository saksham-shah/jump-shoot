function addCreateOverlay() {
    addOverlay('create lobby', {
        width: 400,
        height: 400,
        text: 'Create lobby',
        onDisplay: () => {
            errorText = '';
        },
        draw: () => {
            fill(255);
            noStroke();
            textSize(20);
            textAlign(CENTER);

            text('Name', 200, 35);
            text('Password', 200, 125);
            text('Player limit', 200, 215);

            textAlign(RIGHT);
            text('Unlisted', 175, 300 + 20 / 3);

            if (errorText.length > 0) {
                textSize(15);
                textAlign(CENTER);
                noStroke();
                fill(255, 0, 0);
    
                text(errorText, 200, 90);
            }
        }
    })
    .addButton({
        position: { x: 200, y: 360 },
        width: 150,
        height: 30,
        text: 'CREATE',
        textSize: 20,
        onClick: () => {
            let nameTextbox = getElement('lobby name input');

            let name = nameTextbox.value;
            if (name.length == 0) {
                errorText = 'Name cannot be empty';
                return;
            }

            let password = getElement('lobby password input').value;
            let maxPlayers = getElement('lobby limit slider').value;
            let unlisted = getElement('lobby unlisted checkbox').value;

            let lobbyOptions = { name, password, maxPlayers, unlisted };
            socket.emit('create lobby', lobbyOptions);
        },
        label: 'lobby create button'
    })
    .addTextbox({
        position: { x: 75, y: 70 },
        width: 250,
        height: 25,
        default: 'Enter lobby name',
        onSubmit: txt => {
            getElement('lobby create button').click();
        },
        maxLength: 20,
        allowEmptySubmit: true,
        blurOnSubmit: false,
        clearOnSubmit: false,
        label: 'lobby name input'
    })
    .addTextbox({
        position: { x: 75, y: 160 },
        width: 250,
        height: 25,
        default: '(optional)',
        onSubmit: txt => {
            getElement('lobby create button').click();
        },
        maxLength: 32,
        allowEmptySubmit: true,
        blurOnSubmit: true,
        clearOnSubmit: false,
        label: 'lobby password input'
    })
    .addSlider({
        position: { x: 200, y: 245 },
        width: 200,
        min: 1,
        max: 8,
        value: 4,
        textSize: 20,
        label: 'lobby limit slider'
    })
    .addCheckbox({
        position: { x: 235, y: 300 },
        size: 20,
        value: false,
        label: 'lobby unlisted checkbox'
    });
}

screens.push(addCreateOverlay);