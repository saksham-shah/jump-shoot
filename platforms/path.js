const pl = require('planck-js');
const vec = pl.Vec2;

// Platforms that follow a path between two points
class Path {
    constructor(body, x1, y1, x2, y2, period, offset = 0) {
        this.body = body;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;

        this.speed = 2 * Math.PI / period;
        this.offset = offset;

        // Set the initial position of the body
        let x = (this.x1 + this.x2) / 2 + (this.x2 - this.x1) / 2 * Math.sin(2 * this.offset * Math.PI);
        let y = (this.y1 + this.y2) / 2 + (this.y2 - this.y1) / 2 * Math.sin(2 * this.offset * Math.PI);

        // Set the body to kinematic and put it at its initial position
        this.body.setType('kinematic');
        this.body.setPosition(vec(x, y));
    }

    update(t) {
        // Calculate the new position of the body
        let newX = (this.x1 + this.x2) / 2 + (this.x2 - this.x1) / 2 * Math.sin(t * this.speed + 2 * this.offset * Math.PI);
        let newY = (this.y1 + this.y2) / 2 + (this.y2 - this.y1) / 2 * Math.sin(t * this.speed + 2 * this.offset * Math.PI);

        // Set the body's velocity to move it to the new position
        let pos = this.body.getPosition();
        // Multiply by 60 as the velocity is ms-1 but we want mframe-1
        // 1 sec = 60 frames
        this.body.setLinearVelocity(vec((newX - pos.x) * 60, (newY - pos.y) * 60));
    }
}

module.exports = Path;