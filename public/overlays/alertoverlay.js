let alerts = {
    'shield control': {
        title: 'Controls changed',
        text: 'The control for the shield has been changed from the right mouse button to the left mouse button. Feel free to change it back in Settings.'
    },
    'crosshair': {
        title: 'Crosshair',
        text: 'A crosshair has been added to the game! You can turn it off in Settings.'
    },
    'show mass': {
        title: 'Show mass',
        text: 'You can now see the mass of all players in your games! Go to Settings to enable this feature.'
    }
};

function addAlertOverlay() {
    let title = '';
    let thisId = null;
    let lines = [];
    let centre = false;
    let titleSize = 25;
    let tSize = 15;

    addOverlay('alert', {
        width: 400,
        height: 200,
        text: 'Important!',
        onDisplay: (id, centred = true) => {
            thisId = id
            title = alerts[id].title;
            lines = wrapText(alerts[id].text, tSize, 350);
            centre = centred;
        },
        changeScreen: leaving => {
            if (leaving) {
                localStorage.setItem('alert', thisId);
            }
        },
        draw: () => {
            noStroke();
            fill(255);
            textAlign(CENTER);
            textSize(titleSize);

            text(title, 200, 40);

            let x = 200;
            if (!centre) {
                textAlign(LEFT);
                x = 25;
            }

            textSize(tSize);
            let y = 75;
            for (let line of lines) {
                text(line, x, y);
                y += tSize + 10;
            }
        }
    });
}

screens.push(addAlertOverlay);