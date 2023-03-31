export const bitcoinMempool = new Map();
export const bitcoinBlocks = [];


const ws = new WebSocket('ws://localhost:8080');
ws.addEventListener('open', () => {
    console.log('Connected to server');
});

ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
        switch (message.method){
            case 'insert':

                break;
            case 'delete':
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
        //const newBlock = message.x;
        //TODO lot of work remains to be done :(
    }
});
