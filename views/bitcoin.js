let canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let mouse = {
    x: undefined,
    y: undefined
};



const colorArray = [
    '#e967fd',
    '#67fd8a',
    '#b21717',
    '#0d735d',
    '#ffeb24',
    '#e82020'];

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
    this.draw = function (){
        c.beginPath();
        c.arc(this.x,this.y, this.radius, 0, Math.PI*2, false );
        c.strokeStyle = this.color;
        c.fillStyle = this.color;
        c.fill();
        c.stroke();
    }

    this.update = function (){
        if(this.x + this.radius > innerWidth || this.x < 0 ){
            this.dx = -this.dx;
        }
        if(this.y + this.radius > innerHeight || this.y < 0 ){
            this.dy = -this.dy;
        }
        this.x+=this.dx;
        this.y+=this.dy;

        this.draw();
    }

}

//let circle = new Circle(200, 300, 3, -3,30);
//circle.update();

const circles = new Map();
const bitcoinMempool = new Map();

function generateCircle(transaction){
    let radius = transaction.weight / 100;
    let x = Math.random()* (window.innerWidth - radius*2) + radius;
    let y = Math.random()* (window.innerHeight - radius*2) + radius;
    let dx = 2*(Math.random()-0.5);
    let dy = 2*(Math.random()-0.5);
    return new Circle(x,y,dx,dy,radius, transaction);
}
function init(){
    getBitcoinMempool();
    for (const [, value] of bitcoinMempool){
        circles.set(value.hash,generateCircle(value));
    }
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
function getBitcoinMempool(){
    fetch("https://blockchain.info/unconfirmed-transactions?format=json"
    ).then((response) => response.json()).then((json) => {
        //if transaction was not in our memory, then it is added
        for(const tx of json.txs){
            if(!bitcoinMempool.has(tx.hash))
                bitcoinMempool.set(tx.hash,tx);
        }
    });

}

setInterval(getBitcoinMempool,500);
init();
animate();