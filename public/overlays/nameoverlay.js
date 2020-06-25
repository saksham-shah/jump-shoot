function addNameOverlay() {
    let invalid = false;

    addOverlay('name', {
        width: 400,
        height: 125,
        text: 'Change name',
        onDisplay: () => {
            let nameTextbox = getElement('name change input');
            nameTextbox.value = playerName;
            nameTextbox.cursorPos = playerName.length;
            nameTextbox.selectionStart = playerName.length;
            nameTextbox.clipText();
            invalid = false;
        },
        draw: () => {
            if (invalid) {

                textSize(15);
                textAlign(CENTER);
                noStroke();
                fill(255, 0, 0);
    
                text('Invalid name', 200, 70);
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
                invalid = true;
                return;
            }

            socket.emit('pick name', name);
            closeOverlay();
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
        maxLength: 12,
        allowEmptySubmit: true,
        blurOnSubmit: false,
        clearOnSubmit: false,
        label: 'name change input'
    });
}

screens.push(addNameOverlay);