const WebSocket = require('ws');
const wss = new WebSocket.WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.send('Connected to server');
    ws.on('error', console.error);

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});


module.exports.wss = wss;
module.exports.WebSocket = WebSocket;