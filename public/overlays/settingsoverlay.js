let settings = {
    music: 50,
    sound: 50,
    particles: true,
    crosshair: true,
    showmass: false,
    shownames: true,
    recordmode: false
}

// Allows the player to view and change their settings
function addSettingsOverlay() {
    let tabNames = ['Audio', 'Graphics', 'Advanced'];
    let currentTab = null;
    let tabs = {};

    // Change the tab being viewed
    function setTab(tabName) {
        if (currentTab == tabName) return;

        if (currentTab) {
            // Hide all the elements of the current tab
            for (let element of tabs[currentTab]) {
                element.hide(true);
            }
        }

        currentTab = tabName;

        // Show all the elements of the new tab
        for (let element of tabs[currentTab]) {
            element.hide(false);
        }
    }

    let tabWidth = 100;
    let middle = 200 + tabWidth * 0.5;
    let settingsWidth = 400 - tabWidth;

    let scr = addOverlay('settings', {
        width: 400,
        height: 330,
        text: 'Settings',
        draw: () => {
            fill(100);
            stroke(45);
            rect(tabWidth * 0.5, 165, tabWidth, 330);

            noStroke();
            fill(255);
            textAlign(CENTER);
            textSize(30);

            text(currentTab, middle, 40);

            textSize(20);            
            switch (currentTab) {
                case 'Audio':
                    text('Sound', middle, 100);
                    text('Music', middle, 200);
                    break;
                case 'Graphics':
                    textAlign(LEFT);
                    text('Particles', tabWidth + 50, 100 + 20 / 3);
                    text('Crosshair', tabWidth + 50, 150 + 20 / 3);
                    text('Show mass', tabWidth + 50, 200 + 20 / 3);
                    text('Show names', tabWidth + 50, 250 + 20 / 3);
                    break;
                case 'Advanced':
                    textAlign(LEFT);
                    text('Record mode', tabWidth + 50, 100 + 20 / 3);
                    break; 
            }
        }
    })
    // Audio
    .addSlider({
        position: { x: middle, y: 130 },
        width: settingsWidth - 50,
        max: 100,
        value: settings.sound,
        scrollSpeed: 2,
        textSize: 20,
        onMove: v => {
            settings.sound = v;
            v /= 50;
            for (let soundName in sounds) {
                if (soundName != 'music') {
                    sounds[soundName].setVolume(v * volumes[soundName]);
                }
            }
        },
        hidden: true,
        label: 'settings audio sound'
    })
    .addSlider({
        position: { x: middle, y: 230 },
        width: settingsWidth - 50,
        max: 100,
        value: settings.music,
        scrollSpeed: 2,
        textSize: 20,
        onMove: v => {
            settings.music = v;
            sounds.music.setVolume(v / 50 * volumes.music);
        },
        hidden: true,
        label: 'settings audio music'
    })
    // Graphics
    .addCheckbox({
        position: { x: 340, y: 100 },
        size: 20,
        value: settings.particles,
        onClick: v => {
            settings.particles = v;
        },
        hidden: true,
        label: 'settings graphics particles',
    })
    .addCheckbox({
        position: { x: 340, y: 150 },
        size: 20,
        value: settings.crosshair,
        onClick: v => {
            settings.crosshair = v;
        },
        hidden: true,
        label: 'settings graphics crosshair',
    })
    .addCheckbox({
        position: { x: 340, y: 200 },
        size: 20,
        value: settings.showmass,
        onClick: v => {
            settings.showmass = v;
        },
        hidden: true,
        label: 'settings graphics showmass',
    })
    .addCheckbox({
        position: { x: 340, y: 250 },
        size: 20,
        value: settings.shownames,
        onClick: v => {
            settings.shownames = v;
        },
        hidden: true,
        label: 'settings graphics shownames',
    })
    .addCheckbox({
        position: { x: 340, y: 100 },
        size: 20,
        value: settings.recordmode,
        onClick: v => {
            settings.recordmode = v;
        },
        hidden: true,
        label: 'settings advanced recordmode',
    });

    let x = tabWidth * 0.5;
    let y = 15;
    for (let tabName of tabNames) {
        scr.addButton({
            position: { x, y },
            width: tabWidth,
            height: 30,
            text: tabName,
            textSize: 20,
            onClick: () => setTab(tabName)
        });

        y += 30;

        tabs[tabName] = [];
    }

    scr.addButton({
        position: { x, y },
        width: tabWidth,
        height: 30,
        text: 'Controls',
        textSize: 20,
        onClick: () => openOverlay('controls')
    });

    scr.addButton({
        position: { x, y: 315},
        width: tabWidth,
        height: 30,
        text: 'Save',
        textSize: 20,
        onClick: () => {
            localStorage.setItem('settings', JSON.stringify(settings));
        }
    })

    // Add the elements to their respective tabs
    tabs['Audio'].push(getElement('settings audio sound'));
    tabs['Audio'].push(getElement('settings audio music'));
    tabs['Graphics'].push(getElement('settings graphics particles'));
    tabs['Graphics'].push(getElement('settings graphics crosshair'));
    tabs['Graphics'].push(getElement('settings graphics showmass'));
    tabs['Graphics'].push(getElement('settings graphics shownames'));
    tabs['Advanced'].push(getElement('settings advanced recordmode'));

    // Start on the Audio tab
    setTab('Audio');
}

screens.push(addSettingsOverlay);