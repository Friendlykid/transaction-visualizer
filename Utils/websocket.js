const WebSocket = require('ws').WebSocket;
const wss = new WebSocket.WebSocketServer({ port: 8080 });
const bitcoinMempool = require('./bitcoinMempool.js').bitcoinMempool;

// When connecting to server it sends content of bitcoinMempool
wss.on('connection', (ws) => {
    console.log('Client connected');
    let transactions = [];
    if (bitcoinMempool) {
        transactions = Array.from(bitcoinMempool.values());
    }
    const message = {
        method: 'connected',
        txs: transactions,
    };
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