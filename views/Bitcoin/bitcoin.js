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

export const circles = new Map();


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

function init(){
    getBitcoinMempool().then(() =>{
        for (const [hash, value] of bitcoinMempool){
            circles.set(hash,new Circle(value));
        }
    });
}
function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0,0, innerWidth,innerHeight);
    for( const [key, transaction] of bitcoinMempool){
        if(!circles.has(key))
            circles.set(key,new Circle(transaction));
        circles.get(key).update();
    }
}


init();
animate();