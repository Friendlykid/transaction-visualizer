const Client = require('bitcoin-core');

const client = new Client({
    network: 'mainnet',
    username: process.env.BITCOINUSERNAME,
    password: process.env.BITCOINPASSWORD,
});

let bitcoinMempool = new Map();

let counter = 0;

async function GetTransactionSenderAddress(txId) {
    const rawTransaction = await client.getRawTransaction(txId, 0);
    const decodedRawTransaction = await client.decodeRawTransaction(rawTransaction);
    const transactionInputs = decodedRawTransaction.vin;
    const rawTransaction2 = await client.getRawTransaction(transactionInputs[0].txid, 1);
    const rawTransactionHex = rawTransaction2.hex;
    const inputDecodedRawTransaction = await  client.decodeRawTransaction(rawTransactionHex);
    const vouts = inputDecodedRawTransaction.vout;
    return vouts[0].scriptPubKey.address;
}

/**
 * Modifies data from transaction, adds a fee and removes unnecessary information
 * @param json raw transaction data
 * @returns {Promise<{vsize, size, locktime, fee: string, txid: *, weight, vin: *[], hash, vout: *[]}>}
 */
async function createDataFromRawTransaction(json) {
    let vin = [];
    let vout = [];
    json.vout.forEach(a => {
        vout.push({
            "value": a.value,
            "n": a.n,
            "address": a.scriptPubKey.address
        });
    });
    json.vin.forEach(a => {
        vin.push({
            "txid": a.txid
        });
    });
    const tx = await client.getMempoolEntry(json.txid);
    const fee = tx.fees.base;
    return {
        "txid": json.txid,
        "hash": json.hash,
        "size": json.size,
        "vsize": json.vsize,
        "weight": json.weight,
        "fee": fee,
        "locktime": json.locktime,
        "vin": vin,
        "vout": vout
    }
}

function getSenderAddresses(transactions) {
    let batch = [];
    //transactions are a Map() and we need to convert it to an array, so we have the same order afterwards
    const arrayOfTxs = Array.from(transactions.entries());

    for (const [,tx] of arrayOfTxs) {
        const transactionInputs = tx.vin;
        try {
            batch.push({method: 'getrawtransaction', parameters:[transactionInputs[0].txid, 1]});
        }catch (e) {
            batch.push({method: 'getrawtransaction', parameters:[tx.depends[0], 1]});
        }

    }
    client.command(batch).then(response =>{
        let addresses = []
        for (const tx of response) {
            const txOk = !tx?.stack;
            if(txOk) {
                addresses.push(tx.vout[0].scriptPubKey.address)
            }else{
                addresses.push(undefined);
            }
        }
        for (let i = 0; i < arrayOfTxs.length;i++) {
            if(addresses[i] !== undefined){
                arrayOfTxs[i][1].sender = response[i];
            }
        }
        let n = 0;
        addresses.forEach( a => {
            if(a !== undefined)
                n++;
        })
        bitcoinMempool = new Map([...arrayOfTxs]);
        console.log(bitcoinMempool.size," transactions in memory");
    })

}
function modifyTransactionData(rawTransaction, rawMempoolTransaction){
    let vin = [];
    let vout = [];

    try{
        rawTransaction.vout.forEach(a => {
            vout.push({
                "value": a.value,
                "n": a.n,
                "address": a.scriptPubKey.address
            });
        });
    }catch (e) {
        console.log(rawTransaction.vout);
    }

    rawTransaction.vin.forEach(a => {
        vin.push({
            "txid": a.txid
        });
    });

    return {
        "hash": rawTransaction.txid,
        "size": rawTransaction.size,
        "vsize": rawTransaction.vsize,
        "weight": rawTransaction.weight,
        "fee": rawMempoolTransaction.fees.base,
        "vin": vin,
        "vout": vout
    }
}

//On server start
client.getRawMempool(true).then(response =>{
    let batch = [];
    //without adresses
    const tmpTxMap = new Map();
    for (const txid in response) {
        tmpTxMap.set(txid, response[txid]);
        batch.push({method: 'getrawtransaction', parameters:[txid, 1]});
        //getDataFromRawMempoolTransaction(txid,response[txid]).then( a => console.log(a));
    }
    client.command(batch).then(response2 => {
        for (const rawTx of response2) {
            //check for bad response from bitcoin node
            const txOk = !rawTx?.stack;
            if(txOk){
                tmpTxMap.set(rawTx.txid, modifyTransactionData(rawTx, response[rawTx.txid]));
            }
        }
        getSenderAddresses(tmpTxMap);
    })

})


setInterval( () => {
    client.getMemoryPoolContent().then(response => {
        //console.log(response);
        for (const [hash, ] of bitcoinMempool.entries()) {
            if (!response[hash]) {
                bitcoinMempool.delete(hash);
            }
        }

        //Adds all transactions to bitcoinMempool

        Object.entries(response).forEach( a => {
            console.log(a[0]);
            GetTransactionSenderAddress(a[0]).then()
            bitcoinMempool.set(a[0],a)});
        //Writes to console once every 10s number of txs in bitcoinMempool
        if(counter % 10 ===0){
            console.log("Storing "+bitcoinMempool.size + " transactions");
        }
        counter++;

    })
},1000);




module.exports.bitcoinMempool = bitcoinMempool;