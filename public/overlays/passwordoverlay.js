function addPasswordOverlay() {
    let joining = false;
    let joiningLobby = '';

    addOverlay('password', {
        width: 400,
        height: 125,
        text: 'Password required',
        onDisplay: lobby => {
            joiningLobby = lobby;
            console.log(lobby);
            getElement('password enter button').hide(false);
            getElement('password enter input').hide(false);
            joining = false;
        },
        draw: () => {
            if (joining) {

                textSize(20);
                textAlign(CENTER);
                noStroke();
                fill(0);
    
                text('Joining lobby', 200, 50);
    
                let numCircles = 2, r = 10, gap = 30;
                for (let i = -numCircles; i <= numCircles; i++) {
                    let size = 0.5 * (Math.sin(frameCount / 20 + i * Math.PI / (numCircles * 2 + 1)) + 1)
                    ellipse(200 - i * gap, 75, 2 * r * size);
                }
    
            }
        }
    })
    .addButton({
        position: { x: 200, y: 85 },
        width: 75, 
        height: 25,
        text: 'JOIN',
        textSize: 15,
        onClick: b => {
            let passwordTextbox = getElement('password enter input');

            let pass = passwordTextbox.value;
            if (pass.length == 0) return;

            let lobbyName = joiningLobby;
            console.log(`Password entered: '${pass}' to join lobby '${lobbyName}'`);

            passwordTextbox.clear();
            passwordTextbox.hide(true);
            b.hide(true);
            joining = true;
        },
        label: 'password enter button'
    })
    .addTextbox({
        position: { x: 75, y: 50 },
        width: 250,
        height: 25,
        default: 'Enter password',
        onSubmit: txt => {
            getElement('password enter button').click();
        },
        maxLength: 100,
        label: 'password enter input'
    });
}