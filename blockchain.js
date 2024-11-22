const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const Transaction = require('./transaction');
const Block = require('./block');
const ValidationUtils = require('./utils/ValidationUtils');
const config = require('./utils/Config');

/**
 * @notice - Creates a new blockchain
 * @property {array} chain - The blockchain to be created
 * @property {array} pendingTransactions - The pending transactions to be added to the blockchain
 * @property {string} difficulty - The difficulty of the blockchain proof of work algorithm.
 * @function addBlock - Adds a genesis block to the blockchain.
 */
class Blockchain {
    constructor() {
        this.chain = [config.genesisBlock];
        this.pendingTransactions = [];
        this.difficulty = config.startDifficulty;
        this.minerReward = 5000000;
        this.currentNodeUrl = currentNodeUrl;
        this.networkNodes = [];
        this.miningJobs = {}; // map(blockDataHash => Block)
    }

    /**
     * @notice - Calculates the total mining difficulty of the chain
     * @return - A number representing the total mining difficulty of the chain.
     */
    calcCumulativeDifficulty() {
        let difficulty = 0;
        for (let block of this.chain) {
            difficulty += 16 ** block.difficulty;
        }
        return difficulty;
    }

    /**
     * @notice - Adds a new block to the chain
     * @param nonce - The nonce used to mine the block
     * @param previousBlockHash - The hash of the previous block
     * @param hash - The hash of the current block
     * @return - The new block
     */
    addBlock(tranData) {
        let tran = new Transaction(
            tranData.from,
            tranData.to,
            tranData.value,
            tranData.fee,
            tranData.dateCreated,
            tranData.data,
            tranData.senderPubKey,
            undefined, // the transactionDataHash is auto-calculated
            tranData.senderSignature
        );

        this.pendingTransactions.push(tran);
        return tran;
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * @notice - Creates a transaction object.
     * @param sender - The sender of the transaction
     * @param recipient - The recipient of the transaction
     * @param amount - The amount of the transaction
     * @return - A transaction object
     */
    addTransaction(tranData) {
        // Validate the transaction & add it to the pending transactions
        if (!ValidationUtils.isValidAddress(tranData.from))
            return { errorMsg: 'Invalid sender address: ' + tranData.from };
        if (!ValidationUtils.isValidAddress(tranData.to))
            return { errorMsg: 'Invalid recipient address: ' + tranData.to };
        if (!ValidationUtils.isValidPublicKey(tranData.senderPubKey))
            return { errorMsg: 'Invalid public key: ' + tranData.senderPubKey };
        if (!ValidationUtils.isValidSignatureFormat(tranData.senderSignature))
            return {
                errorMsg: 'Invalid or missing signature. Expected signature format: ["hexnum", "hexnum"]',
            };

        let tran = new Transaction(
            tranData.from,
            tranData.to,
            tranData.value,
            tranData.fee,
            tranData.dateCreated,
            tranData.data,
            tranData.senderPubKey,
            undefined, // the transactionDataHash is auto-calculated
            tranData.senderSignature
        );

        // Check for duplicated transactions (to avoid "replay attack")
        if (this.findTransactionByDataHash(tran.transactionDataHash))
            return {
                errorMsg: 'Duplicated transaction: ' + tran.transactionDataHash,
            };

        if (!tran.verifySignature())
            return { errorMsg: 'Invalid signature: ' + tranData.senderSignature };

        let balances = this.getAccountBalance(tran.from);
        if (
            Number(balances.confirmedBalance) <
            Number(tran.value) + Number(tran.fee)
        )
            return {
                errorMsg: 'Insufficient sender balance.',
            };

        this.pendingTransactions.push(tran);

        return tran;
    }

    /**
     * @notice - Checks for a duplicate transaction
     * @param transactionDataHash - The transaction data hash
     * @return - The matching transaction or undefined
     */
    findTransactionByDataHash(transactionDataHash) {
        let allTransactions = this.getAllTransactions();
        let matchingTransactions = allTransactions.filter(
            (t) => t.transactionDataHash === transactionDataHash
        );
        return matchingTransactions[0];
    }

    /**
     * @notice - Adds a new transaction to the list of pending transactions
     * @param transactionObj - An object containing the transaction details.
     * @return - The index of the block that will hold this transaction
     */
    addTransactionToPendingTransactions(transactionObj) {
        this.pendingTransactions.push(transactionObj);
        return this.getLastBlock()['index'] + 1;
    }

    /**
     * @notice - Returns the hash of the block
     * @param previousBlockHash - The hash of the previous block
     * @param currentBlockData - The data of the current block
     * @param nonce - The nonce used to mine the block
     * @return - The hash of the block
     */
    hashBlock(previousBlockHash, currentBlockData, nonce) {
        const dataAsString =
            previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
        const hash = sha256(dataAsString);
        return hash;
    }

    /**
     * @notice - Checks if the given blockchain is valid by checking the hashes of each block
     * @param blockchain - The blockchain to be checked
     * @return - True if the blockchain is valid, false otherwise
     */
    chainIsValid(blockchain) {
        let validChain = true;

        for (let i = 1; i < blockchain.length; i++) {
            const currentBlock = blockchain[i];
            const previousBlock = blockchain[i - 1];

            // Check if the hash (data) of the current block is correct
            const blockHash = this.hashBlock(
                previousBlock['hash'], {
                    transactions: currentBlock['transactions'],
                    index: currentBlock['index'],
                },
                currentBlock['nonce']
            );
            if (blockHash.substring(0, 4) !== this.difficulty) {
                validChain = false;
            }

            // Check if the previous block hash is correct
            if (currentBlock['previousBlockHash'] !== previousBlock['hash']) {
                validChain = false;
            }
        }

        // Check if the genesis block is valid
        const genesisBlock = blockchain[0];
        const correctNonce = genesisBlock['nonce'] === 0;
        const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
        const correctHash = genesisBlock['hash'] === '0';
        const correctTransactions = genesisBlock['transactions'].length === 0;
        if (!correctNonce ||
            !correctPreviousBlockHash ||
            !correctHash ||
            !correctTransactions
        ) {
            validChain = false;
        }

        return validChain;
    }

    /**
     * @notice - Returns the block with the given hash
     * @param blockHash - The hash of the block to be returned
     * @return - The block with the given hash
     */
    getBlock(blockHash) {
        let correctBlock = null;
        this.chain.forEach((block) => {
            if (block.blockHash === blockHash) {
                correctBlock = block;
            }
        });
        return correctBlock;
    }

    /**
     * @notice - Returns the block with the given index
     * @param blockIndex - The index of the block to be returned
     * @return - The block with the given hash
     */
    getBlockByIndex(blockIndex) {
        let correctBlock = null;
        this.chain.forEach((block) => {
            if (block.blockIndex === blockIndex) {
                correctBlock = block;
            }
        });
        return correctBlock;
    }

    /**
     * @notice - Returns the block with all transactions
     * @param blockHash - The hash of the block to be returned
     * @return - An oblect containing the block with all transactions
     */
    getBlockTransactions(blockHash) {
        let correctBlock = null;
        this.chain.forEach((block) => {
            if (block.blockHash === blockHash) {
                correctBlock = block.transactions;
            }
        });
        return correctBlock;
    }

    /**
     * @notice - Searches the blockchain for a transaction with the given transaction data hash
     * @param transactionHash - The transaction data hash of the transaction to be returned
     * @return - An object containing the transaction details or undefined
     */
    getTransaction(transactionHash) {
        let correctTransaction = null;
        let correctBlock = null;

        // confirmed transactions
        this.chain.forEach((block) => {
            block.transactions.forEach((transaction) => {
                if (transaction.transactionDataHash === transactionHash) {
                    correctTransaction = transaction;
                    correctBlock = block;
                }
            });
        });

        // pending transactions
        this.pendingTransactions.forEach((transaction) => {
            if (transaction.transactionDataHash === transactionHash) {
                correctTransaction = transaction;
            }
        });

        if (!correctTransaction) {
            return null;
        } else {
            return { transaction: correctTransaction, block: correctBlock };
        }
    }

    /**
     * @notice - Collects all transactions from the network
     * @return - All transactions
     */
    getAllTransactions() {
        let transactions = this.getConfirmedTransactions();
        transactions.push.apply(transactions, this.pendingTransactions);
        return transactions;
    }

    /**
     * @notice - Finds all confirmed transactions within the blockchain
     * @return - An array of confirmed transactions
     */
    getConfirmedTransactions() {
        let transactions = [];
        for (let block of this.chain) {
            transactions.push.apply(transactions, block.transactions);
            // transactions.push(...block.transactions);
        }
        return transactions;
    }

    /**
     * @notice - Collects all transactions from a specific address
     * @param address - The address to find the transactions for
     * @return - All transactions from the address
     */
    getTransactionHistory(address) {
        if (!ValidationUtils.isValidAddress(address)) {
            return { errorMsg: 'Invalid address' };
        }

        let transactions = this.getAllTransactions();
        let transactionsByAddress = transactions.filter(
            (t) => t.from === address || t.to === address
        );
        return transactionsByAddress;
    }

    /**
     * @notice - Finds the balance of an address
     * @param address - The address to find the balance for
     * @return - The balance of the address
     */
    getAccountBalance(address) {
        if (!ValidationUtils.isValidAddress(address)) {
            return { errorMsg: 'Invalid address' };
        }

        let transactions = this.getTransactionHistory(address);
        // return transactions;
        let balance = {
            safeBalance: 0,
            confirmedBalance: 0,
            pendingBalance: 0,
            safeCount: config.safeConfirmCount,
        };
        for (let tran of transactions) {
            // Determine the number of blocks mined since the transaction was created

            let confirmationCount = 0;
            if (typeof tran.minedInBlockIndex === 'number') {
                confirmationCount = this.chain.length - tran.minedInBlockIndex;
            }

            // Calculate the address balance
            if (tran.from === address) {
                // Funds spent -> subtract value and fee (FROM)
                if (!tran.transferSuccessful) {
                    balance.pendingBalance -= Number(tran.fee);
                    balance.pendingBalance -= Number(tran.value);
                }
                if (confirmationCount > 0) {
                    balance.confirmedBalance -= Number(tran.fee);
                    if (tran.transferSuccessful)
                        balance.confirmedBalance -= Number(tran.value);
                }
                if (confirmationCount >= config.safeConfirmCount) {
                    balance.safeBalance -= Number(tran.fee);
                    if (tran.transferSuccessful)
                        balance.safeBalance -= Number(tran.value);
                }
            }
            if (tran.to === address) {
                // Funds received --> add value and fee (TO)
                if (!tran.transferSuccessful)
                    balance.pendingBalance += Number(tran.value);
                if (confirmationCount > 0)
                    balance.confirmedBalance += Number(tran.value);
                if (
                    confirmationCount >= config.safeConfirmCount &&
                    tran.transferSuccessful
                )
                    balance.safeBalance += Number(tran.value);
            }
        }

        return balance;
    }

    /**
     * @notice - Searches the blockchain for the provided address within a all transactions
     * @param address - The address whose balance is to be returned
     * @return - The balance of the given address
     */
    getAddressData(address) {
        const addressTransactions = [];

        // Get all transactions from the blockchain
        this.chain.forEach((block) => {
            block.transactions.forEach((transaction) => {
                // Add the transaction to the list if it is from the given address
                if (transaction.to === address || transaction.from === address) {
                    addressTransactions.push(transaction);
                }
            });
        });
        // Calculate the balance of the given address
        let balance = 0;
        addressTransactions.forEach((transaction) => {
            if (transaction.from === address) {
                balance -= Number(transaction.value);
            } else if (transaction.to === address) {
                balance += Number(transaction.value);
            }
        });
        return {
            transactions: addressTransactions,
            addressBalance: balance,
        };
    }

    /**
     * @notice - Searches the blockchain for all addresses within all transactions
     * @return - An array of all addresses
     */
    getAllAddresses() {
        let addresses = new Set();
        this.chain.forEach((block) => {
            block.transactions.forEach((transaction) => {
                // Add the transaction to the list if it is from the given address
                addresses.add(transaction.to);
                addresses.add(transaction.from);
                if (transaction.to) {}
                if (transaction.from) {}
            });
        });
        return Array.from(addresses);
    }

    /**
     * @notice - Calculates the total balance of all pending transaction addresses in the blockchain
     * @return - An object containing the total balance of all pending transaction addresses
     */
    calcAllConfirmedBalances() {
        let transactions = this.getConfirmedTransactions();
        let balances = {};
        for (let tran of transactions) {
            balances[tran.from] = balances[tran.from] || 0;
            balances[tran.to] = balances[tran.to] || 0;
            balances[tran.from] -= tran.fee;
            if (tran.transferSuccessful) {
                balances[tran.from] -= tran.value;
                balances[tran.to] += tran.value;
            }
        }
        return balances;
    }

    /**
     * @notice - Updates the chain to match the longest chain
     * @param transactionsToRemove - Transactions to remove from the pending transactions
     */
    removePendingTransactions(transactionsToRemove) {
        let tranHashesToRemove = new Set();
        for (let t of transactionsToRemove)
            tranHashesToRemove.add(t.transactionDataHash);
        this.pendingTransactions = this.pendingTransactions.filter(
            (t) => !tranHashesToRemove.has(t.transactionDataHash)
        );
    }

    /**
     * @notice - Manual Mode - Mines the next block candidate
     * @param minerAddress - Address of the miner
     * @param difficulty - The difficulty of the last block
     */
    mineNextBlock(minerAddress, difficulty) {
        // Prepare the next block for mining
        let oldDifficulty = this.currentDifficulty;
        this.currentDifficulty = difficulty;
        let nextBlock = this.getMiningJob(minerAddress);
        this.currentDifficulty = oldDifficulty;

        // Mine the next block
        nextBlock.dateCreated = new Date().toISOString();
        nextBlock.nonce = 0;
        do {
            nextBlock.nonce++;
            nextBlock.calculateBlockHash();
        } while (!ValidationUtils.isValidDifficulty(nextBlock.blockHash, difficulty));

        // Submit the mined block
        let newBlock = this.submitMinedBlock(
            nextBlock.blockDataHash,
            nextBlock.dateCreated,
            nextBlock.nonce,
            nextBlock.blockHash
        );
        return newBlock;
    }

    /**
     * @notice - Prepares the miner for mining
     * @param minerAddress - Address of the miner
     */
    getMiningJob(minerAddress) {
        let nextBlockIndex = this.chain.length;

        // Deep clone all pending transactions & sort them by fee
        let transactions = JSON.parse(JSON.stringify(this.pendingTransactions));
        transactions.sort((a, b) => b.fee - a.fee); // sort descending by fee

        // Prepare the coinbase transaction -> it will collect all tx fees
        let coinbaseTransaction = new Transaction(
            config.nullAddress, // from (address)
            minerAddress, // to (address)
            config.blockReward, // value (of transfer)
            0, // fee (for mining)
            new Date().toISOString(), // dateCreated
            'coinbase tx', // data (payload / comments)
            config.nullPubKey, // senderPubKey
            undefined, // transactionDataHash
            config.nullSignature, // senderSignature
            nextBlockIndex, // minedInBlockIndex
            true
        );

        // Execute all pending transactions (after paying their fees)
        // Transfer the requested values if the balance is sufficient
        let balances = this.calcAllConfirmedBalances();
        for (let tran of transactions) {
            balances[tran.from] = balances[tran.from] || 0;
            balances[tran.to] = balances[tran.to] || 0;
            if (balances[tran.from] >= tran.fee) {
                tran.minedInBlockIndex = nextBlockIndex;

                // The transaction sender pays the processing fee
                balances[tran.from] -= tran.fee;
                coinbaseTransaction.value += tran.fee;

                // Transfer the requested value: sender -> recipient
                if (balances[tran.from] >= tran.value) {
                    balances[tran.from] -= tran.value;
                    balances[tran.to] += tran.value;
                    tran.transferSuccessful = true;
                } else {
                    tran.transferSuccessful = false;
                }
            } else {
                // The transaction cannot be mined due to insufficient
                // balance to pay the transaction fee -> drop it
                this.removePendingTransactions([tran]);
                transactions = transactions.filter((t) => t !== tran);
            }
        }

        // Insert the coinbase transaction, holding the block reward + tx fees
        coinbaseTransaction.calculateDataHash();
        transactions.unshift(coinbaseTransaction);

        // Prepare the next block candidate (block template)
        let prevBlockHash = this.chain[this.chain.length - 1].blockHash;
        let blockReward = config.blockReward;
        let nextBlockCandidate = new Block(
            nextBlockIndex,
            transactions,
            this.currentDifficulty,
            prevBlockHash,
            minerAddress,
            undefined,
            blockReward
        );

        this.miningJobs[nextBlockCandidate.blockDataHash] = nextBlockCandidate;
        return nextBlockCandidate;
    }

    /**
     * @notice - Constructs a new candidate block from the given block template
     * @param blockDataHash - The block data hash
     * @param dateCreated - The date the block was created
     * @param nonce - The nonce of the block
     * @return - The new candidate block
     */
    submitMinedBlock(blockDataHash, dateCreated, nonce, blockHash) {
        // Find the block candidate by its data hash
        let newBlock = this.miningJobs[blockDataHash];
        if (newBlock === undefined)
            return { errorMsg: 'Block not found or already mined' };

        // Build the new block
        newBlock.dateCreated = dateCreated;
        newBlock.nonce = nonce;
        newBlock.calculateBlockHash();

        let blockReward = config.blockReward;
        newBlock.blockReward = blockReward;

        // Validate the block hash + the proof of work
        if (newBlock.blockHash !== blockHash)
            return { errorMsg: 'Block hash is incorrectly calculated' };
        if (!ValidationUtils.isValidDifficulty(
                newBlock.blockHash,
                newBlock.difficulty
            ))
            return {
                errorMsg: 'The calculated block hash does not match the block difficulty',
            };

        //update local node
        newBlock = this.extendChain(newBlock);

        return newBlock;
    }

    /**
     * @notice - Extends the chain if the new block is valid
     * @param newBlock - The new block candidate
     * @return - The new candidate block
     */
    extendChain(newBlock) {
        if (newBlock.index !== this.chain.length)
            return {
                errorMsg: 'The submitted block was already mined by someone else',
            };

        let prevBlock = this.chain[this.chain.length - 1];
        if (prevBlock.blockHash !== newBlock.prevBlockHash)
            return { errorMsg: 'Incorrect prevBlockHash' };

        // The block is correct --> accept it
        this.chain.push(newBlock);
        this.miningJobs = {}; // Invalidate all mining jobs
        this.pendingTransactions = [];
        return newBlock;
    }
}

module.exports = Blockchain;