import { c } from "../bitcoin.js";

export class Block {
    constructor(x, y, width, height, data, onMove) {
        this.data = data;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        // There is no need for dx, because the block will only move vertically
        this.dy = 0;
        this.onMove = onMove;
        this.color = "#57C5B6";
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.dy = 0;
        if (this.onMove) {
            this.dy = -1;
        }

        this.y += this.dy;
        this.draw();
    }

    setOnMove(onMove) {
        this.onMove = onMove;
    }
}
