import {bitcoinMempool,bitcoinBlocks} from "./webSocketClient.js";
let canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let mouse = {
    x: undefined,
    y: undefined
};

const circles = new Map();

const colorArray = [
    '#fd0010',
    '#ff00a6',
    '#c800ff',
    '#7b00ff',
    '#2b00c4',
    '#0131ad'];

window.addEventListener('mousemove', ev => {
    mouse.x = ev.x;
    mouse.y=ev.y;
});

window.addEventListener('resize', () =>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});



function Circle(x, y, dx , dy, radius, data){
    this.data = data;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.color = colorArray[Math.floor(Math.random()*colorArray.length)];
    this.fee = this.data.fee?this.data.fee:this.data[1].fee
    if(this.fee < 100)
        this.color = colorArray[0];
    if(this.fee <= 100 && this.fee >= 400)
        this.color = colorArray[1];
    if(this.fee <= 400 && this.fee >= 600)
        this.color = colorArray[2];
    if(this.fee <= 600 && this.fee >= 900)
        this.color = colorArray[3];
    if(this.fee > 900 )
        this.color = colorArray[4];
    this.draw = function (){
        c.beginPath();
        c.arc(this.x,this.y, this.radius, 0, Math.PI*2, false );
        c.strokeStyle = this.color;
        c.fillStyle = this.color;
        c.fill();
        c.stroke();
    }

    this.update = function (){
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

function Block( x, y, width, height, data, onMove){
    this.data = data;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    // There is no need for dx, because the block will only move vertically
    this.dy = 0;
    this.onMove = onMove;
    this.color = colorArray[Math.floor(Math.random()*colorArray.length)];
    this.draw = function (){
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.width, this.height);
    }

    this.update = function (){
        this.dy = 0;

        if(this.onMove){
            this.dy = -1;
        }

        this.y+=this.dy;
        this.draw();
    }

    this.setOnMove = function (onMove){
        this.onMove = onMove;
    }

}


/**
 *
 * @returns {number} distance of objects
 */
function getDistance(x1,y1,x2,y2){
    const xDistance = x1 - x2;
    const yDistance = y1 - y2;
    return Math.sqrt(Math.pow(xDistance,2)+ Math.pow(yDistance,2));

}

//Shows user hash of the circle
canvas.addEventListener('click', () =>{
    for (const [, circle] of circles) {
        if(getDistance(mouse.x,mouse.y,circle.x,circle.y) < circle.radius){
            //TODO change to non modal window
            alert(circle.data.hash);
        }
    }
})

function generateCircle(transaction){
    let radius = transaction.weight / 100;
    radius = radius > 100 ? 100 : radius;
    radius = radius < 2 ? 2 : radius;
    let x = Math.random()* (canvas.width/3 - radius*2) + radius;
    let y = Math.random()* (canvas.height - radius*2) + radius;
    let dx = 2*(Math.random()-0.5);
    let dy = 2*(Math.random()-0.5);
    return new Circle(x,y,dx,dy,radius, transaction);
}
function init(){
    getBitcoinMempool().then(() =>{
        for (const [, value] of bitcoinMempool){
            circles.set(value.hash,generateCircle(value));
        }
    });
}
function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0,0, innerWidth,innerHeight);
    for( const [key, transaction] of bitcoinMempool){
        if(!circles.has(key))
            circles.set(key,generateCircle(transaction));
        circles.get(key).update();
    }
}
async function getBitcoinMempool() {
        const response = await fetch("http://localhost:3000/bitcoinMempool");
    const txs = await response.json();
    txs.forEach(tx => bitcoinMempool.set(tx.hash, tx));
    const response2 = await fetch("https://blockchain.info/unconfirmed-transactions?format=json");
    const json2 = await response2.json();
    const txs2 = json2.txs;
    //if transaction was not in memory, then it is added
    for (const tx of txs2) {
        if (!bitcoinMempool.has(tx.hash))
            bitcoinMempool.set(tx.hash, tx);
    }
}




init();
animate();