// Game information screen
class HelpScreen {
  constructor() {
    this.backButton = new Button(backButtonOptions, 'MENU', () => scr = ms, null);

    this.nextButton = new Button({
      x: -25,
      y: -25,
      w: 90,
      h: 30,
      textSize: 15,
      xEdge: true,
      yEdge: true
    }, 'NEXT', scr => {
      scr.pageNum++;
      if (scr.pageNum >= scr.pages.length) scr.pageNum -= scr.pages.length;
    }, this, 'purple');

    this.previousButton = new Button({
      x: 25,
      y: -25,
      w: 90,
      h: 30,
      textSize: 15,
      xEdge: true,
      yEdge: true
    }, 'PREVIOUS', scr => {
      scr.pageNum--;
      if (scr.pageNum < 0) scr.pageNum += scr.pages.length;
    }, this, 'purple');

    this.pages = [{
      title: 'Introduction',
      text: `Welcome to Jump and Shoot, where you win by knocking everyone off the map! You can jump and you can shoot.

Use this help section to learn about how the game works, and when you're done, make sure to check the controls screen to see how to move and fire.`
    }, {
      title: 'Objective',
      text: `You must stay on the platforms to survive - if you fall off the map, you will die!

Be careful not to go too far to the sides or top of the map either, you will be killed if you go out of bounds.`
    }, {
      title: 'Weapons',
      text: `Pick up weapons by going near them! Different weapons fire different bullets. You can also throw weapons, but this is almost never worth it.

Weapons in the game right now: pistol, machine gun, sniper`
    }, {
      title: 'Shield',
      text: `When you are unarmed, you can activate your shield!

The shield reflects bullets. Don't get hit by a reflected bullet - it will disarm you!`
    }, {
      title: 'Extras',
      text: `Hold L to view the leaderboard.

 Hold P to see your ping.`
    }, {
      title: 'Information',
      text: `Made by Saksham Shah

A Level Computer Science project 2020`
    }];

    this.pageNum = 0;
  }

  update() {
    this.nextButton.updateState();
    this.previousButton.updateState();
    this.backButton.updateState();
  }

  show() {
    push();

    drawText('Help', {
      x: 0.5,
      y: 0.15,
      textSize: 65
    });

    fill(255);
    noStroke();

    textAlign(CENTER);
    textSize(30 * ratio);
    text(this.pages[this.pageNum].title, width * 0.5, height * 0.3);

    textAlign(LEFT, TOP);
    textSize(20 * ratio);
    rectMode(CORNER);
    text(this.pages[this.pageNum].text, width * 0.5 - 300 * ratio, height * 0.4, 600 * ratio, 250 * ratio);

    pop();

    this.nextButton.show();
    this.previousButton.show();
    this.backButton.show();
  }
}
