const fs = require('fs');
const express = require('express');
const app = express();

//Asi nepotřebuju, ale radši zatím nemažu
//const fileUpload = require('express-fileupload');
//app.use(fileUpload());

app.set('view engine', 'html');
app.set('views', 'views');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.get("/", (req, res) =>{
    const file = fs.readFileSync('views/index.html', 'utf-8');
    res.type('html').send(file);
})
app.get("/bitcoin.html", (req, res) =>{
    const file = fs.readFileSync('views/bitcoin.html', 'utf-8');
    res.type('html').send(file);
})

app.get("/ethereum.html", (req, res) =>{
    const file = fs.readFileSync('views/ethereum.html', 'utf-8');
    res.type('html').send(file);
})

app.get("/bitcoin.js", (req, res) =>{
    const file = fs.readFileSync('views/bitcoin.js', 'utf-8');
    res.type('js').send(file);
})

app.get("/ethereum.js", (req, res) =>{
    const file = fs.readFileSync('views/ethereum.js', 'utf-8');
    res.type('js').send(file);
})

app.get("/style.css", (req, res) =>{
    const file = fs.readFileSync('views/style.css', 'utf-8');
    res.type('css').send(file);
})

app.listen(3000, ()=>{
    console.log('Server started on port 3000');
});