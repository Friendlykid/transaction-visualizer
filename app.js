const fs = require('fs');
const express = require('express');
const app = express();
require('dotenv').config();
const btcMempool = require("./Utils/BitcoinMempool");


app.set('view engine', 'html');
app.set('views', 'views');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.get("/", (req, res) =>{
    const file = fs.readFileSync('views/index.html', 'utf-8');
    res.type('html').send(file);
});

app.get("/bitcoinMempool", (req, res) =>{
    res.set('Access-Control-Allow-Origin', '*');
    const data = Array.from(btcMempool.bitcoinMempool.values());
    //sends data as array of arrays [['hash',{tx}],[],...]
    res.json(data);
});


//returns transaction from btcMempool
app.get('/bitcoinTransaction/:txHash', (req, res) => {
    const txHash = req.params.txHash;
    const txData = btcMempool.bitcoinMempool.get(txHash);
    //Don't know if this will work
    //res.set('Access-Control-Allow-Origin', '*');
    if (!txData) {
        // if transaction not found, send 404 response
        res.status(404).send('Transaction not found');
    } else {
        // if transaction found, send the transaction data
        res.send(txData);
    }
});

// Request for getting files. Must be after static get requests!
app.get("/:fileName", (req, res) =>{
    const fileName = req.params.fileName;
    const fileType = fileName.split('.')[1];
    try{
        let file = fs.readFileSync(`views/${fileName}`, 'utf-8');
        res.type(fileType).send(file);
    } catch (e){
        res.type('error').send(e);
        console.log(e);
    }

});



app.listen(3000, ()=>{
    console.log('Server started on port 3000');
});

