// A popup message alert from the server
function addMessageOverlay() {
    let lines = [];
    let centre = false;
    let titleText = '';
    let titleSize = 25;
    let tSize = 15;

    addOverlay('message', {
        width: 400,
        height: 100,
        text: 'Important!',
        onDisplay: (title = '', message = '', centred = true) => {
            getScreen('message').text = title;
            titleText = title;
            lines = wrapText(message, tSize, 350);
            centre = centred;
        },
        draw: () => {
            noStroke();
            fill(255);
            textSize(tSize);

            textAlign(CENTER);
            let x = 200;
            if (!centre) {
                textAlign(LEFT);
                x = 25;
            }

            let y = 30;
            for (let line of lines) {
                text(line, x, y);
                y += tSize + 10;
            }
        }
    });
}

screens.push(addMessageOverlay);