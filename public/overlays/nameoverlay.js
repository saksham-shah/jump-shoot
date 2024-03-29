// Allows players to change their name
function addNameOverlay() {
    addOverlay('name', {
        width: 400,
        height: 125,
        text: 'Change name',
        onDisplay: () => {
            // Set the value of the textbox to the player's current name
            let nameTextbox = getElement('name change input');
            nameTextbox.setValue(playerName);
            nameTextbox.focus();
            errorText = '';
        },
        draw: () => {
            if (errorText.length > 0) {
                textSize(15);
                textAlign(CENTER);
                noStroke();
                fill(255, 0, 0);
    
                text(errorText, 200, 70);
            }
        }
    })
    .addButton({
        position: { x: 200, y: 95 },
        width: 75, 
        height: 25,
        text: 'CHANGE',
        textSize: 15,
        onClick: b => {
            let nameTextbox = getElement('name change input');

            let name = nameTextbox.value;
            if (name.length == 0) {
                errorText = 'Name cannot be empty';
                return;
            }

            socket.emit('pick name', name);
        },
        label: 'name change button'
    })
    .addTextbox({
        position: { x: 75, y: 50 },
        width: 250,
        height: 25,
        default: 'Enter new name',
        onSubmit: txt => {
            getElement('name change button').click();
        },
        maxLength: 20,
        allowEmptySubmit: true,
        blurOnSubmit: false,
        clearOnSubmit: false,
        label: 'name change input'
    });
}

screens.push(addNameOverlay);