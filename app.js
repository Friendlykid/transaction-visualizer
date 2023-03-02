const fs = require('fs');
const express = require('express');
const app = express();
require('dotenv').config();

let bitcoinMempool;

function getBitcoinMempool(){
    fetch("https://blockchain.info/unconfirmed-transactions?format=json"
    ).then((response) => response.json()).then(json => bitcoinMempool = json);

}

//Asi nepotřebuju, ale radši zatím nemažu
//const fileUpload = require('express-fileupload');
//app.use(fileUpload());

app.set('view engine', 'html');
app.set('views', 'views');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

setInterval(getBitcoinMempool, 250);

app.get("/", (req, res) =>{
    const file = fs.readFileSync('views/index.html', 'utf-8');
    res.type('html').send(file);
});


app.get("/getBitcoinMempool",(req, res) =>{
    res.type("json").send(bitcoinMempool);
})

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

