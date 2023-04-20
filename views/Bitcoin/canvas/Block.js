import { c , circles} from "../bitcoin.js";
import {getRadius} from "./Circle.js";
import Circle from "./Circle.js";
// Block size has a limit of 4 million weight units.
const blockSize = 4_000_000;
export class Block {
        constructor(x, y, width, height, transactions, onMove) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        // There is no need for dx, because the block will only move vertically
        this.dy = 0;
        this.onMove = onMove;
        this.color = "#57C5B6";
        this.transactions = [];
        //Vacated weight units of Block
        this.blockSpace = 0;
        this.initialAddingTransactions(transactions);
        //transactions.forEach(tx => this.addTransaction(tx));


    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.dy = 0;
        if (this.onMove) {
            this.dy = -1;
        }

        this.y += this.dy;
        this.draw();
    }

    /**
     *
     * @param transaction
     * @returns {boolean}
     */
    addTransaction(transaction){
        if(this.hasSpaceForTransaction(transaction)){
            this.transactions.push(transaction);
            this.blockSpace +=transaction.weight;
            return true;
        }else if(this.canBeAddedToFilledBlock(transaction)){
            this.addTransactionToFilledBlock(transaction);
        }
        this.transactions.sort(compareTransactions);
    }

    setOnMove(onMove) {
        this.onMove = onMove;
    }
    hasSpaceForTransaction(transaction){
        return (this.blockSpace + transaction.weight) >= blockSize;
    }

    /**
     * Only to be used when transaction is bigger than remaining blockSpace.
     * @param transaction
     * @returns {boolean}
     */
    canBeAddedToFilledBlock(transaction){
        let sizeOfLesserTransactions = 0;
        // computes size of transactions with lower priority and checks if
        // remaining space + the sizeOfLesserTransactions is bigger than the size of the transaction
        for(let i = this.transactions.length -1 ;i > 0 ; i--){
            if(!transaction.priority > this.transactions[i].priority){
             break;
            }
            sizeOfLesserTransactions += this.transactions[i].weight;
        }
        return blockSize - this.blockSpace + sizeOfLesserTransactions > transaction.weight;
    }

    /**
     * To be used if canBeAddedToFilledBlock(transaction) is true
     * @param transaction to be added
     */
    addTransactionToFilledBlock(transaction){
        let lesserTransactions = [];
        let index;
        for(let i = this.transactions.length -1 ;i > 0 ; i--){
            if(!transaction.priority > this.transactions[i].priority){
                index = i;
                break;
            }
            lesserTransactions.push(this.transactions[i]);
        }
        this.transactions.splice(index,lesserTransactions.length,transaction);

        if(lesserTransactions.length > 0)
            this.returnTransactionsToCanvas(lesserTransactions);
    }

    initialAddingTransactions(transactions) {
        for (const transaction of transactions) {
            if(this.hasSpaceForTransaction(transaction)){
                this.transactions.push(transaction);
                this.blockSpace +=transaction.weight;
            }else if(this.canBeAddedToFilledBlock(transaction)){
                this.addTransactionToFilledBlock(transaction);
            }
        }
        this.transactions.sort(compareTransactions);
    }

    /**
     *
     * @param transactions Array of transactions
     */
    returnTransactionsToCanvas(transactions){
        for (const transaction of transactions) {
            transaction.XCoordinate = this.x  - getRadius(transaction.weight);
            transaction.YCoordinate = this.y + this.height + getRadius(transaction.weight);
            transaction.XVelocity = 2*(Math.random()-1);
            transaction.YVelocity = 2*(Math.random()-0.5);
            circles.set(transaction.hash,new Circle(transaction));
        }
    }
}

function compareTransactions(a, b) {
    return a.priority - b.priority;
}