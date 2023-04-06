const fs = require('fs');
const express = require('express');
const app = express();
require('dotenv').config();
const btcMempool = require("./Utils/bitcoinMempool").bitcoinMempool;

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
    const data = Array.from(btcMempool.values());
    //sends data as array of arrays [{tx1},{tx2},...]
    res.json(data);
});

//Request for files inside a folder inside a folder. Must be after static get requests!
app.get("/:folder/:subFolder/:fileName", (req, res) =>{
    const fileName = req.params.fileName;
    const fileType = fileName.split('.')[1];
    const folder = req.params.folder;
    const subFolder = req.params.subFolder;
    try{
        let file = fs.readFileSync(`views/${folder}/${subFolder}/${fileName}`, 'utf-8');
        res.type(fileType).send(file);
    } catch (e){
        res.type('error').send(e);
        console.log(e);
    }

});

//Request for files inside a folder. Must be after static get requests!
app.get("/:folder/:fileName", (req, res) =>{
    const fileName = req.params.fileName;
    const fileType = fileName.split('.')[1];
    const folder = req.params.folder;
    try{
        let file = fs.readFileSync(`views/${folder}/${fileName}`, 'utf-8');
        res.type(fileType).send(file);
    } catch (e){
        res.type('error').send(e);
        console.log(e);
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
// request for estimated time until new Bitcoin Block is found
app.get('/eta', async (req, res) => {
    try {
        const response = await fetch('https://blockchain.info/q/eta');
        const data = await response.text();
        res.send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

app.listen(3000, ()=>{
    console.log('Server started on port 3000');
});

