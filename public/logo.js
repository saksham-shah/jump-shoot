// Weapons and particle numbers per weapon
const PISTOL = 0, SNIPER = 1, MACHINEGUN = 2, SHOTGUN = 3, SHIELD = 4, THROW = 5;
const numParticles = [15, 30, 15, 30, 15, 0];

// Colours
const
RED = [255, 0, 0],
BLUE = [0, 0, 255],
GREEN = [0, 255, 0],
YELLOW = [255, 255, 0],
ORANGE = [255, 153, 0],
PURPLE = [255, 0, 255],
CYAN = [0, 255, 255],
GREY = [200];

function logo() {
    function chooseLogoWeapon() {
        let r = Math.random();
        if (r < 0.65) return PISTOL;
        if (r < 0.75) return SNIPER;
        if (r < 0.85) return MACHINEGUN;
        if (r < 0.95) return SHOTGUN;
        if (r < 0.98) return SHIELD;
        return THROW;
    }
    
    function chooseLogoColour() {
        let r = Math.random();
        if (r < 0.75) return RED;
        if (r < 0.81) return BLUE;
        if (r < 0.87) return GREEN;
        if (r < 0.93) return YELLOW;
        if (r < 0.95) return ORANGE;
        if (r < 0.97) return PURPLE;
        if (r < 0.99) return CYAN;
        return GREY;
    }

    let weapon = chooseLogoWeapon();
    let colour = chooseLogoColour();

    let particles = [];

    // Fixed random numbers for machine gun bullets etc
    let rand = [];
    for (let i = 0; i < 15; i++) {
        rand.push(Math.random());
    }

    // Add particles
    for (let i = 0; i < numParticles[weapon]; i++) {
        let vel = Math.random() * 30 + 15;
        let angle = Math.random() * Math.PI * 0.5 - Math.PI * 0.25;

        let life = Math.random() * 6 + 12;
        let percent = (life - 10) / life;
        if (percent < 0) percent = 0;

        particles.push({
            x: vel * Math.cos(angle),
            y: vel * Math.sin(angle),
            r: percent * 6
        })
    }

    function drawLogo() {
        push();
        translate(-123.09, -77.1);

        // Player
        push();
        translate(99, 90);
        rotate(-0.5);

        drawPlayer();
        pop();

        // Text
        drawText();

        // Bullets and particles
        push();
        translate(99, 90);
        rotate(-0.5);

        // Bullets
        drawBullets();

        // Particles
        drawParticles();

        // Thrown weapon
        if (weapon == THROW) {
            translate(40, 0);
            drawWeapon(Math.floor(rand[0] * 4));
        }

        pop();

        pop();
    }

    function drawText() {
        push();
        fill(255);
        noStroke();
        textAlign(LEFT);

        // Big text
        textSize(120);
        text('J', 0, 100);
        text('S', 51, 138.2);
        text('&', 155.1, 100);

        // Small text
        textSize(60);
        text('ump', 51, 46);
        text('hoot', 108, 138.2);

        pop();
    }

    // Draw the player and weapon
    function drawPlayer() {
        push();
        
        // Player
        fill(colour);
        stroke(0);
        strokeWeight(1.8);

        ellipse(0, 0, 54);
        line(0, 0, 27, 0);

        // Weapon       
        drawWeapon();

        pop();
    }

    // Draw the weapon
    function drawWeapon(w = weapon) {
        push();
        fill(100);
        stroke(0);
        strokeWeight(1.8);

        switch (w) {
            case PISTOL:
                rect(27, 0, 36, 18);
                break;
            case SNIPER:
                rect(27, 0, 54, 18);
                break;
            case MACHINEGUN:
                rect(27, 0, 27, 27);
                break;
            case SHOTGUN:
                rect(27, 0, 36, 27);
                break;
            case SHIELD:
                fill(200);
                noStroke();
                rect(40.5, 0, 13.5, 60);
                break;
        }

        pop();
    }

    // Draw the bullets
    function drawBullets() {
        push();
        fill(255, 255, 0);
        noStroke();

        switch (weapon) {
            case PISTOL:
                // 2 normal bullets
                rect(75, 0, 27, 6);
                rect(120, 0, 27, 6);
                break;
            case SNIPER:
                // 1 bigger bullet
                rect(100, 0, 45, 10);
                break;
            case MACHINEGUN:
                // 4 random bullets
                for (let i = 0; i < 4; i++) {
                    push();
                    rotate(rand[i] * Math.PI / 4 - Math.PI / 8);
                    rect(70 + 25 * i, 0, 18, 2);
                    pop();
                }
                break;
            case SHOTGUN:
                // 7 bullets at regular angles
                rotate(-Math.PI / 8);
                for (let i = -3; i < 4; i++) {
                    rect(85, 0, 18, 2);
                    rotate(Math.PI / 24);
                }
                break;
            case SHIELD:
                // Translate to the centre of the shield
                translate(40.5, 0);

                // 3 yellow bullets coming at the shield
                let angle = rand[0] * Math.PI / 4 - Math.PI / 8;
                rotate(angle);
                for (let i = 0; i < 3; i++) {
                    rect(20 + 25 * i, rand[i + 1] * 20 - 10, 18, 2);
                }

                // 3 orange bullets reflected from the shield
                rotate(-angle * 2);
                fill(255, 155, 0);
                for (let i = 0; i < 3; i++) {
                    rect(20 + 25 * i, rand[i + 4] * 20 - 10, 18, 2);
                }

                break;
            
        }

        pop();
    }

    // Draw the particles already created
    function drawParticles() {
        push();
        fill(255, 255, 0);
        noStroke();

        // Orange particles if it is a shield
        if (weapon == SHIELD) {
            fill(255, 155, 0);
            translate(40.5, 0);
        }

        for (let p of particles) {
            ellipse(p.x, p.y, p.r * 2);
        }

        pop();
    }

    // Set itself as the function used to draw the logo
    // Means you can't call this function again
    logo = (x, y, size) => {
        push();
        translate(x, y);
        scale(size);

        drawLogo();

        pop();
    }
}