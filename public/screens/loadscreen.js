let sounds = {};
let filter;
let filterToggle = false;

function setFilter(bool) {
    if (filterToggle == bool) return;
    filter.toggle();
    filterToggle = !filterToggle;
}

const soundsToLoad = [
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

const fontToLoad = '/assets/fonts/ShareTechMono-Regular.ttf';
let font = null;

const volumes = {
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

let soundsLoaded = 0;

// let invalid = false;

function addLoadScreen() {
    let loading = false;
    let clicked = false;

    function loadAssets() {
        loading = true;
        for (let soundToLoad of soundsToLoad) {
            loadSound('/assets/sounds/' + soundToLoad.file, soundLoaded);

            function soundLoaded(sound) {
                let vol = volumes[soundToLoad.name] / 50;
                if (soundToLoad.name == 'music') {
                    vol *= settings.music;
                } else {
                    vol *= settings.sound;
                }

                sound.setVolume(vol);
                sounds[soundToLoad.name] = sound;
                soundsLoaded++;
            }
        }

        loadFont(fontToLoad, fontLoaded);

        function fontLoaded(loadedFont) {
            setFont(loadedFont);
            font = loadedFont;
        }
    }

    addScreen('loading', {
        update: () => {
            if (!loading) {
                if (!font) {
                    loadAssets();
                } else if (clicked && playerName.length > 0) {
                    setScreen('menu');
                    filter = new p5.LowPass();
                    filter.freq(400);
                    sounds.music.disconnect();
                    sounds.music.connect(filter);
                    sounds.music.loop();
                    clicked = false;
                    errorText = '';
                }
                
            } else {
                if ((soundsLoaded == soundsToLoad.length) && font) {
                    loading = false;
                    getElement('loading button start').hide(false);
                    getElement('loading name input').hide(false);

                    setSounds({
                        click: sounds.buttonclick,
                        hover: sounds.buttonhover
                    });
                }
            }
        },
        getCursorState: state => {
            if (loading) return 'wait';
        },
        draw: () => {
            if (loading) {
                noStroke();
                fill(255);
        
                let numCircles = 2, r = 15, gap = 50;
                for (let i = -numCircles; i <= numCircles; i++) {
                    let size = 0.5 * (Math.sin(frameCount / 20 + i * Math.PI / (numCircles * 2 + 1)) + 1)
                    ellipse(450 - i * gap, 300, 2 * r * size);
                }
            } else {
                textAlign(CENTER);
                textSize(100);
                fill(255);
                noStroke();
                text('Jump & Shoot', 450, 150);

                if (errorText.length > 0) {
                    textSize(25);
                    fill(255, 0, 0);
                    text(errorText, 450, 340);
                }
            }
        }
    })
    .addButton({
        position: { x: 450, y: 450 },
        text: 'START',
        width: 200,
        height: 100,
        textSize: 50,
        onClick: () => {
            clicked = true;
            let nameTextbox = getElement('loading name input');
            let name = nameTextbox.value;
            if (name.length == 0) {
                errorText = 'Name cannot be empty';
                return;
            }

            socket.emit('pick name', name);
            // myName = name;
            // localStorage.setItem('name', myName);
            // filter.toggle(false);
        },
        label: 'loading button start',
        tooltip: 'Click me to begin!',
        hidden: true
    })
    .addTextbox({
        position: { x: 225, y: 300 },
        width: 450,
        height: 50,
        default: 'Enter name',
        value: playerName,
        onSubmit: txt => {
            getElement('loading button start').click();
        },
        maxLength: 20,
        allowEmptySubmit: true,
        blurOnSubmit: false,
        clearOnSubmit: false,
        label: 'loading name input',
        hidden: true
    });

    playerName = '';
}

screens.push(addLoadScreen);