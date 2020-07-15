// Used for particle effects
class Particle {
  constructor(x, y, vel, angle, gravity, r, col, life) {
    this.x = x;
    this.y = y;
    this.vx = vel * Math.cos(angle);
    this.vy = vel * Math.sin(angle);
    this.gravity = gravity;
    this.r = r;
    this.col = getParticleColour(col);
    this.maxLife = life;
    this.currentLife = life;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;

    this.currentLife--;

    if (this.currentLife <= 0) {
      return true;
    }
    return false;
  }

  show() {
    push();
    translate(this.x, this.y);
    fill(this.col);
    noStroke();
    // Gets smaller as time goes on
    ellipse(0, 0, this.r * this.currentLife / this.maxLife * 2);
    pop();
  }
}

function getParticleColour(col) {
  if (typeof col === 'string') {
    return particleColours[col];
  }

  let colourIndex = col % colourOrder.length;
  return playerColours[colourOrder[colourIndex]];
}

let particleColours = {
  'fire': [255, 255, 0],
  'bullet': [255, 255, 0],
  'reflected': [255, 155, 0]
}