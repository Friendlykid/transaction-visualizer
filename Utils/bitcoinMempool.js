const Client = require('bitcoin-core');
const sendTransactions = require('./websocket').sendTransactions;
const client = new Client({
    network: 'mainnet',
    username: process.env.BITCOINUSERNAME,
    password: process.env.BITCOINPASSWORD,
});
/**
 * Map Object containing all mempool transactions. Key value is tx hash.
 * @type {Map<string, Object>}
 */
let bitcoinMempool = new Map();

/**
 * Fills out transactions with adress of sender and saves it to bitcoinMempool.
 * @param transactions Map() Object of rawTransactions
 */
async function getSenderAddresses(transactions) {
    let batch = [];
    //transactions are a Map() and we need to convert it to an array, so we have the same order afterwards
    const arrayOfTxs = Array.from(transactions.entries());

    for (const [, tx] of arrayOfTxs) {
        const transactionInputs = tx.vin;
        try {
            batch.push({method: 'getrawtransaction', parameters: [transactionInputs[0].txid, 1]});
        } catch (e) {
            batch.push({method: 'getrawtransaction', parameters: [tx.depends[0], 1]});
        }

    }
    const response = await client.command(batch);
    let addresses = []
    for (const tx of response) {
        const txOk = !tx?.stack;
        if (txOk) {
            addresses.push(tx.vout[0].scriptPubKey.address)
        } else {
            addresses.push(undefined);
        }
    }
    for (let i = 0; i < arrayOfTxs.length; i++) {
        if (addresses[i] !== undefined) {
            arrayOfTxs[i][1].sender = addresses[i];
        }
    }
    let n = 0;
    addresses.forEach(a => {
        if (a !== undefined)
            n++;
    })
    for (const [hash, tx] of arrayOfTxs) {
        bitcoinMempool.set(hash, tx);
    }
    console.log(bitcoinMempool.size, " transactions in memory. ", n, " transaction sender address was found.");

}

/**
 * Merges two transaction formats together and get rid of unnecessary information.
 * It's without sender address!
 * @param rawTransaction transaction from getRawTransaction(txid, 1)
 * @param rawMempoolTransaction transaction from getMempoolEntry(txid)
 * @returns {{vsize, size, fee: number, weight, vin: *[], hash: (*|any), vout: *[]}}
 */
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
        "fee": rawMempoolTransaction.fees.base* Math.pow(10,8),
        //priority is fee per weight. Bigger the priority the bigger chance of confirmation.
        "priority": rawMempoolTransaction.fees.base* Math.pow(10,8)/rawTransaction.weight,
        "vin": vin,
        "vout": vout
    }
}

/**
 * Check whether RPC node returned valid response.
 * @param tx
 * @returns {boolean}
 */
function isTransactionValid(tx){
    return !tx?.stack;
}

/**
 * periodical update of btc mempool
 */
function updateMempool(){

    setInterval( async () => {
        let batchMempoolEntry = [];
        let batchRawTransaction = [];
        let deletedTxHashes = [];
        let insertedTxHashes = [];
        const hashes = await client.getRawMempool();
        for (const [txid,] of bitcoinMempool.entries()) {
            // If the transaction is not in the mempool, delete it from the Map
            if (!hashes.includes(txid)) {
                bitcoinMempool.delete(txid);
                deletedTxHashes.push(txid);
            }
        }
        //sends hashes of deleted transactions to each client
        sendTransactions('delete', deletedTxHashes);

        for (const txid of hashes) {
            if(!bitcoinMempool.has(txid)){
                batchMempoolEntry.push({method: 'getmempoolentry', parameters: {txid}});
                batchRawTransaction.push({method: 'getrawtransaction', parameters: [txid, 1]});
                insertedTxHashes.push(txid);
            }
        }
        const mempoolEntries = await client.command(batchMempoolEntry);
        const rawTransactions = await client.command(batchRawTransaction);

        if(mempoolEntries.length > 0)
            console.log("Adding ", mempoolEntries.length," transactions to mempool");
        let transactions = new Map();

        for(let i = 0; i < mempoolEntries.length;i++){
            if(isTransactionValid(mempoolEntries[i]) && isTransactionValid(rawTransactions[i])){
                const transaction = modifyTransactionData(rawTransactions[i],mempoolEntries[i]);
                transactions.set(transaction.hash,transaction);
            }
        }
        let insertedTransactions = [];
        getSenderAddresses(transactions).then(() =>{
            for (const hash of insertedTxHashes) {
                insertedTransactions.push(bitcoinMempool.get(hash));
            }
            //sends inserted transactions to each client
            sendTransactions('insert', insertedTransactions);
        });
    },1000);
}

//On server start
client.getRawMempool(true).then(response => {
    const batchSize = 500; // The maximum number of requests in each batch
    let txids = Object.keys(response);
    let i = 0;
    let batch;
    const tmpTxMap = new Map();

    const processBatch = (batch) => {
        client.command(batch).then(response2 => {
            for (const rawTx of response2) {
                if(isTransactionValid(rawTx)){
                    tmpTxMap.set(rawTx.txid, modifyTransactionData(rawTx, response[rawTx.txid]));
                }
            }
            getSenderAddresses(tmpTxMap).catch(er =>{
                console.log(er);
            });
        });
    };

    const processNextBatch = () => {
        if (i >= txids.length) {
            // All transactions have been processed
            updateMempool();
            return;
        }

        batch = [];
        const batchEnd = Math.min(i + batchSize, txids.length);
        for (; i < batchEnd; i++) {
            const txid = txids[i];
            tmpTxMap.set(txid, response[txid]);
            batch.push({method: 'getrawtransaction', parameters:[txid, 1]});
        }

        console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(txids.length / batchSize)}`);
        processBatch(batch);
        setTimeout(processNextBatch, 2000); // Wait for a second between batches
    };

    processNextBatch();
});



module.exports.bitcoinMempool = bitcoinMempool;