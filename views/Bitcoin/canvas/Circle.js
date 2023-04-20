import {c,canvas} from "../bitcoin.js";

const colorArray = [
    '#B9D8C2',
    '#9AC2C9',
    '#8AA1B1',
    '#4A5043',
    '#FFCB47',
    '#ff622c'
];



 //For specific coordinates, add property 'XCoordinate' and 'YCoordinate' to transaction.
 //For velocity, add property 'XVelocity' and 'YVelocity'.
export default class Circle{

    constructor(transaction){
        this.radius = getRadius(transaction.weight);
        this.x = getXCoordinate(this.radius, transaction);
        this.y = getYCoordinate(this.radius, transaction);
        this.dx = getXVelocity(transaction);
        this.dy = getYVelocity(transaction);
        this.transaction = transaction;
        //value is how many bitcoins is being sent
        this.value = getValue(transaction);
        //color must be set after the value is defined
        this.color = getColor(this.value);

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

function getColor(value){
    if(value < 0.001)
        return colorArray[0];
    if(value >= 0.01 && value <= 0.05)
        return colorArray[1];
    if(value >= 0.05 && value <= 0.1)
        return colorArray[2];
    if(value >= 0.1 && value <= 1)
        return colorArray[3];
    if(value > 1 )
        return colorArray[4];
}

export function getRadius(weight) {
    let radius = weight / 100;
    radius = radius > 100 ? 100 : radius;
    radius = radius < 2 ? 2 : radius;
    return radius;
}

function getXCoordinate(radius,transaction){
    if('XCoordinate' in transaction)
        return transaction.XCoordinate;
    return Math.random()* (canvas.width/3 - radius*2) + radius;
}
function getYCoordinate(radius, transaction) {
    if('YCoordinate' in transaction)
        return transaction.YCoordinate;
    return Math.random()* (canvas.height - radius*2) + radius;
}
function getXVelocity(transaction){
    if('XVelocity' in transaction)
        return transaction.XVelocity;
    return 2*(Math.random()-0.5);
}

function getYVelocity(transaction){
    if('YVelocity' in transaction)
        return transaction.YVelocity;
    return 2*(Math.random()-0.5);
}
function getValue(transaction){
    let value = 0;
    try{
        transaction.vout.forEach(vout => value += vout.value);
    }catch{
        transaction.out.forEach(out => value += out.value/Math.pow(10,8));
        //console.log(transaction);
    }
    return value;
}