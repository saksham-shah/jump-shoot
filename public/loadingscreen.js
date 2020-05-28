let sounds = {};
// let soundsToLoad = [];
let soundsLoaded = 0;
let soundsToLoad = [
  {
    name: 'buttonhover',
    file: 'buttonhover.mp3'
  }, {
    name: 'buttonclick',
    file: 'buttonclick.wav'
  }, {
    name: 'music',
    file: 'jumpandshoot.mp3'
  }, {
    name: 'pistol',
    file: 'pistol.wav'
  }, {
    name: 'machinegun',
    file: 'machinegun.wav'
  }, {
    name: 'sniper',
    file: 'sniper.wav'
  }, {
    name: 'shotgun',
    file: 'shotgun.wav'
  }, {
    name: 'shield',
    file: 'shield.wav'
  }, {
    name: 'death',
    file: 'death.wav'
  }, {
    name: 'equip',
    file: 'equip.mp3'
  }, {
    name: 'throw',
    file: 'throw.wav'
  }, {
    name: 'collision',
    file: 'collision.wav'
  }, {
    name: 'disarm',
    file: 'disarm.wav'
  }, {
    name: 'throwhit',
    file: 'throwhit.wav'
  }, {
    name: 'message',
    file: 'message.wav'
  }
];

let volumes = {
  buttonhover: 1,
  buttonclick: 0.3,
  music: 0.4,
  pistol: 0.75,
  machinegun: 1,
  sniper: 1,
  shotgun: 0.4,
  shield: 2,
  death: 2,
  equip: 1,
  throw: 2,
  collision: 3,
  disarm: 2,
  throwhit: 3,
  message: 1
}

let filter;

// Displayed while p5 is loading the assets
class LoadingScreen {
  constructor() {
    this.loading = false;

    this.clicked = false;

    this.done = false;
  }

  loadSounds() {
    for (let soundToLoad of soundsToLoad) {
      loadSound('/sounds/' + soundToLoad.file, soundLoaded);

      function soundLoaded(sound) {
        sound.setVolume(volumes[soundToLoad.name]);
        sounds[soundToLoad.name] = sound;
        soundsLoaded++;

        // if (soundsLoaded >= soundsToLoad.length) {
        //   this.loading = true;
        // }
      }
    }
  }

  update() {
    if (!this.loading) {
      if (soundsLoaded < soundsToLoad.length) {
        this.loadSounds();
        this.loading = true;

      } else if (mouseIsPressed) {
        this.clicked = true;

      } else {
        if (this.clicked) {
          this.done = true;
        }
      }

    } else if (soundsLoaded >= soundsToLoad.length) {
      this.loading = false;
    }

    if (this.done) {
      filter = new p5.LowPass();
      filter.freq(400);
      sounds.music.disconnect();
      sounds.music.connect(filter);
      sounds.music.loop();

      if (playerName != "") {
        scr = ms;
      } else {
        scr = ss;
      }
    }
  }

  show() {
    push();
    // Draw the title text
    drawText('Jump & Shoot', {
      x: 0.5,
      y: 0.15,
      textSize: 65
    });

    if (this.loading) {
      drawText('loading sounds...', {
        x: 0.5,
        y: 0.5,
        textSize: 30
      });

    } else {
      drawText('Sounds loaded. Click to start.', {
        x: 0.5,
        y: 0.5,
        textSize: 30
      });
    }

    pop();
  }
}
