const Client = require('bitcoin-core');

const client = new Client({
    network: 'mainnet',
    username: process.env.BITCOINUSERNAME,
    password: process.env.BITCOINPASSWORD,
});

let bitcoinMempool = new Map();


setInterval( () => {
    client.getMemoryPoolContent().then(response => {
        for (const [hash, ] of bitcoinMempool.entries()) {
            if (!response[hash]) {
                bitcoinMempool.delete(hash);
            }
        }

        for(const [hash, tx] of Object.entries(response)){
            bitcoinMempool.set(hash, tx);
        }
        console.log("Storing "+bitcoinMempool.size + " transactions");
    })
},1000)




module.exports.bitcoinMempool = bitcoinMempool;