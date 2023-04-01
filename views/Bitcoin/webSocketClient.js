export const bitcoinMempool = new Map();
export const bitcoinBlocks = [];


// Block size has a limit of 4 million weight units.
const blockSize = 4_000_000;

const ws = new WebSocket('ws://localhost:8080');
ws.addEventListener('open', () => {
    console.log('Connected to server');
});

ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
        switch (message.method){
            case 'insert':
            case'connected':
                message.txs.forEach(tx => bitcoinMempool.set(tx.hash, tx));
                break;
            case 'delete':
                message.txs.forEach(tx => bitcoinMempool.delete(tx.hash));
                break;
            default:
                console.log(message.method);
        }
});

ws.addEventListener('close', () => {
    console.log('Disconnected from server');
});

ws.addEventListener('error', (error) => {
    console.error(`WebSocket error: ${error}`);
});



const socket = new WebSocket("wss://ws.blockchain.info/inv");

//subscription for new blocks
socket.addEventListener("open", () =>{
    const message = {
        "op": "blocks_sub"
    };
    socket.send(JSON.stringify(message));
})


//TODO: maybe needs to be rewritten
//new block has been found
socket.addEventListener("message", (event) =>{
    const message = JSON.parse(event.data);
    if (message.op === "block") {
        console.log(message.x);
        //const newBlock = message.x;
        //TODO lot of work remains to be done :(
    }
});
