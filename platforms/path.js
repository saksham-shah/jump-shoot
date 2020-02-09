var Matter = require('matter-js');

class Path {
    constructor(body, x1, y1, x2, y2, period, offset = 0) {
        this.body = body;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.speed = 2 * Math.PI / period;
        this.offset = offset;
    }

    update(engine) {
        var newX = (this.x1 + this.x2) / 2 + (this.x2 - this.x1) / 2 * Math.sin(engine.timing.timestamp * this.speed + 2 * this.offset * Math.PI);
        var newY = (this.y1 + this.y2) / 2 + (this.y2 - this.y1) / 2 * Math.sin(engine.timing.timestamp * this.speed + 2 * this.offset * Math.PI);
        Matter.Body.setVelocity(this.body, { x: newX - this.body.position.x, y: newY - this.body.position.y });
        Matter.Body.setPosition(this.body, { x: newX, y: newY });
    }
}

module.exports = Path;