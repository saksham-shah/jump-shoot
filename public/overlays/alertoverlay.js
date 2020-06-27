function addAlertOverlay() {
    let title = '';
    let lines = [];
    let centre = false;
    let titleSize = 25;
    let tSize = 15;

    addOverlay('alert', {
        width: 400,
        height: 200,
        text: 'Important!',
        onDisplay: (titleText, text, centred) => {
            title = titleText;
            lines = wrapText(text, tSize, 350);
            centre = centred;
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