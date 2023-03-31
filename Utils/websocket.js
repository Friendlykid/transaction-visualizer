const WebSocket = require('ws').WebSocket;
const wss = new WebSocket.WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');
    const message = {
        method:"Connected to server"
    }
    ws.send(JSON.stringify(message));
    ws.on('error', console.error);

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

/**
 *
 * @param method string with values insert or delete
 * @param transactions transaction data
 * @returns {boolean} true if method is valid, either false;
 */
const  sendTransactions = (method, transactions) => {
    if((method !== 'insert' && method !== 'delete') || transactions.length === 0){
        return false;
    }

    wss.clients.forEach(function each(client) {
        const data = {
            method:method,
            txs:transactions
        }
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
    return true;
}


module.exports.wss = wss;
module.exports.WebSocket = WebSocket;
module.exports.sendTransactions = sendTransactions;