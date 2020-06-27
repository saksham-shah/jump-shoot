function addCreditsOverlay() {
    addOverlay('credits', {
        width: 400,
        height: 150,
        text: 'Credits',
        draw: () => {
            fill(255);
            noStroke();
            textAlign(CENTER);
            textSize(25);

            text('Creator: Saksham Shah', 200, 50);
            text('Music: Saksham Shah', 200, 100);
        }
    })
}

screens.push(addCreditsOverlay);