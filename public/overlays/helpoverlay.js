function addHelpOverlay() {
    const pages = [{
        title: 'Introduction',
        text: `Welcome to Jump and Shoot, where you win by knocking everyone off the map! You can jump and you can shoot.

Use this help section to learn about how the game works, and when you're done, make sure to check the controls screen to see how to move and fire.`
    }, {
        title: 'Objective',
        text: `You must stay on the platforms to survive - if you fall off the map, you will die!

Be careful not to go too far to the sides or top of the map either, you will be killed if you go out of bounds.`
    }, {
        title: 'Weapons',
        text: `Pick up weapons by going near them! Different weapons fire different bullets. You can also throw weapons at other players to deal some damage!

Weapons in the game right now: pistol, machine gun, sniper, shotgun`
    }, {
        title: 'Shield',
        text: `When you are unarmed, you can activate your shield!

The shield reflects bullets. Don't get hit by a reflected bullet - it will disarm you!

TIP: Throwing weapons can help against a player who is using their shield to reflect your bullets.`
    }, {
        title: 'Extras',
        text: `Press Escape to open the in-game menu.

Hold L to view the leaderboard.

Hold Tab to see your ping.`
    }, {
        title: 'Credits',
        text: `Made by Saksham Shah

A Level Computer Science project 2020

Music by Saksham Shah`
    }];

    let wrappedText = [];

    let currentPage = 0;

    addOverlay('help', {
        width: 600,
        height: 400,
        text: 'Help',
        onDisplay: () => {
            wrappedText = [];

            for (let page of pages) {
                wrappedText.push(wrapTextWithNewline(page.text, 20, 560));
            }

            currentPage = 0;
        },
        draw: () => {
            noStroke();
            fill(255);

            textAlign(CENTER);
            textSize(30);
            text(pages[currentPage].title, 300, 40);

            // textAlign(LEFT);
            textSize(20);
            let y = 100;
            let lines = wrappedText[currentPage];
            for (let line of lines) {
                text(line, 300, y);
                y += 30;
            }

            text(`${currentPage + 1}/${pages.length}`, 300, 365 + 20 / 3);
        }
    })
    .on('mouseWheel', e => {
        if (e.deltaY > 0) {
            if (currentPage < pages.length - 1) currentPage++;
        } else {
            if (currentPage > 0) currentPage--;
        }
    })
    .addButton({
        position: { x: 70, y: 365 },
        width: 100,
        height: 30,
        text: 'PREVIOUS',
        textSize: 20,
        onClick: () => {
            if (currentPage > 0) currentPage--;
        }
    })
    .addButton({
        position: { x: 530, y: 365 },
        width: 100,
        height: 30,
        text: 'NEXT',
        textSize: 20,
        onClick: () => {
            if (currentPage < pages.length - 1) currentPage++;
        }
    });
}

screens.push(addHelpOverlay);