import {c,canvas} from "../bitcoin.js";

const colorArray = [
    '#B9D8C2',
    '#9AC2C9',
    '#8AA1B1',
    '#4A5043',
    '#FFCB47',
    '#ff622c'
];

export default class Circle{
    constructor(transaction){

        this.radius = transaction.weight / 100;
        this.radius = this.radius > 100 ? 100 : this.radius;
        this.radius = this.radius < 2 ? 2 : this.radius;
        this.x = Math.random()* (canvas.width/3 - this.radius*2) + this.radius;
        this.y = Math.random()* (canvas.height - this.radius*2) + this.radius;
        this.dx = 2*(Math.random()-0.5);
        this.dy = 2*(Math.random()-0.5);
        this.transaction = transaction;
        this.color = colorArray[Math.floor(Math.random()*colorArray.length)];
        this.value = 0;
        try{
            transaction.vout.forEach(vout => this.value += vout.value);
        }catch{
            console.log(transaction);
        }
        if(this.value < 0.001)
            this.color = colorArray[0];
        if(this.value >= 0.01 && this.transaction.fee <= 0.05)
            this.color = colorArray[1];
        if(this.value >= 0.05 && this.value <= 0.1)
            this.color = colorArray[2];
        if(this.value >= 0.1 && this.value <= 1)
            this.color = colorArray[3];
        if(this.value > 1 )
            this.color = colorArray[4];
    }

    draw() {
        c.beginPath();
        c.arc(this.x,this.y, this.radius, 0, Math.PI*2, false );
        c.strokeStyle = this.color;
        c.fillStyle = this.color;
        c.fill();
        c.stroke();
    }

    update() {
        if(this.x + this.radius > canvas.width || this.x < 0 ){
            this.dx = -this.dx;
        }
        if(this.y + this.radius > canvas.height || this.y < 0 ){
            this.dy = -this.dy;
        }

        this.x+=this.dx;
        this.y+=this.dy;

        this.draw();
    }
}

