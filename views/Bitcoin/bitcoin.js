import {bitcoinMempool,bitcoinBlocks} from "./webSocketClient.js";
import Circle from "./canvas/Circle.js";
export const canvas = document.getElementById('canvas');
export const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const mouse = {
    x: undefined,
    y: undefined
};

const circles = new Map();

const colorArray = [
    '#B9D8C2',
    '#9AC2C9',
    '#8AA1B1',
    '#4A5043',
    '#FFCB47',
    '#ff622c'
];


window.addEventListener('mousemove', ev => {
    mouse.x = ev.x;
    mouse.y=ev.y;
});

window.addEventListener('resize', () =>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});







/**
 * @returns {number} distance of objects
 */
function getDistance(x1,y1,x2,y2){
    const xDistance = x1 - x2;
    const yDistance = y1 - y2;
    return Math.sqrt(Math.pow(xDistance,2)+ Math.pow(yDistance,2));

}

//Shows user hash of the circle
canvas.addEventListener('click', () =>{
    for (const [hash, circle] of circles) {
        if(getDistance(mouse.x,mouse.y,circle.x,circle.y) < circle.radius){
            //TODO change to non modal window
            alert(hash);
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
        for (const [hash, value] of bitcoinMempool){
            circles.set(hash,generateCircle(value));
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