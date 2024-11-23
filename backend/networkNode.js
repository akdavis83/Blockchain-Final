const express = require("express");
const Blockchain = require("./blockchain");
const uuid = require("uuid/v1");
const port = process.argv[2];
const rp = require("request-promise");
const cors = require("cors");
const { StatusCodes } = require("http-status-codes");
const { json } = require("express");

const cryptocoin = new Blockchain();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));

/**
 * @notice - Displays statistics about the node
 */
app.get("/info", (req, res) => {
    res.json({
        about: "CryptoCoin/v1",
        nodeUrl: cryptocoin.currentNodeUrl,
        peers: cryptocoin.networkNodes.length,
        difficulty: cryptocoin.difficulty,
        blocks: cryptocoin.chain.length,
        chainId: cryptocoin.chain[0].blockHash,
        cumulativeDifficulty: cryptocoin.calcCumulativeDifficulty(),
        confirmedTransactions: cryptocoin.getConfirmedTransactions().length,
        pendingTransactions: cryptocoin.pendingTransactions.length,
    });
});

/**
 * @notice - Displays all addresses in the node
 * @param address - Array of addresses
 */
app.get("/addresses", (req, res) => {
    let allAddresses = cryptocoin.getAllAddresses();
    res.json(allAddresses);
});

//========================= Transactions =========================

/**
 * @notice - Displays the transaction history of a specific address
 * @param address - Address of a wallet
 */
app.get("/address/:address/transactions", (req, res) => {
    let address = req.params.address;
    let tranHistory = cryptocoin.getTransactionHistory(address);
    res.json(tranHistory);
});

/**
 * @dev -  https://www.npmjs.com/package/http-status-codes
 * @notice - Displays the balance of a specific address
 * @param address - Address of a wallet
 */
app.get("/address/:address/balance", (req, res) => {
    let address = req.params.address;
    let balance = cryptocoin.getAccountBalance(address);
    if (balance.errorMsg) res.status(StatusCodes.NOT_FOUND);
    res.json(balance);
});

// adds a transaction to a nodes pending transactions
app.post("/transaction", function(req, res) {
    const newTransaction = req.body;
    const blockIndex =
        cryptocoin.addTransactionToPendingTransactions(newTransaction);
    res.json({
        message: `Transaction will be added in block ${blockIndex}`,
    });
});

// creates a new transaction
app.post("/transaction/broadcast", function(req, res) {
    const newTransaction = cryptocoin.addTransaction(req.body);
    console.log(newTransaction);
    if (newTransaction.errorMsg) {
        res.json({ error: newTransaction.errorMsg });
        return;
    }
    // cryptocoin.addTransactionToPendingTransactions(newTransaction);

    if (newTransaction.transactionDataHash) {
        // Added a new pending transaction --> broadcast it to all known peers

        const requestPromises = [];
        cryptocoin.networkNodes.forEach((node) => {
            const requestOptions = {
                uri: `${node}/transaction`,
                method: "POST",
                body: newTransaction,
                json: true,
            };

            requestPromises.push(rp(requestOptions));
        });

        Promise.all(requestPromises)
            .then(() =>
                res.json({
                    message: "Transaction created and broadcasted",
                    transactionDataHash: newTransaction.transactionDataHash,
                })
            )
            .catch((err) => res.status(400).json({ error: err.message }));
    } else res.status(StatusCodes.BAD_REQUEST).json(newTransaction);
});

//========================= Mining =========================
app.post("/mine-next-block", function(req, res) {
    const { minerAddress, difficulty } = req.body;
    const newBlock = cryptocoin.mineNextBlock(minerAddress, difficulty);

    // broadcast the new block to other nodes
    const requestPromises = [];
    cryptocoin.networkNodes.forEach((node) => {
        const requestOptions = {
            uri: `${node}/receive-new-block`,
            method: "POST",
            body: { newBlock },
            json: true,
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
        .then(() => {
            res.json({
                message: "New block mined and broadcasted successfully",
                block: newBlock,
            });
        })
        .catch((err) => res.status(400).json({ error: err.message }));
});

app.post("/receive-new-block", function(req, res) {
    const block = cryptocoin.extendChain(req.body.newBlock);
    if (!block.errorMsg) {
        res.json({
            message: "New block received and accepted",
            block,
        });
    } else {
        res.json({
            message: "New block rejected",
            block,
        });
    }
});

/**  ========================= Register Nodes =========================
 * Step 1) A new node will call the /register-and-broadcast-node endpoint of an existing node.
 * That node will be registered within the current node then "broadcasted" to all other nodes.
 * Step 2) The existing node will initiate the broadcast by calling /register-node of all nodes in the network.
 * Step 3) Once broadcast is complete, the existing node will call the /register-nodes-bulk endpoint on the new node.
 * This will give the new node an updated list of all nodes in the network.
 */
app.post("/register-and-broadcast-node", function(req, res) {
    const newNodeUrl = req.body.newNodeUrl;

    // Step 1)
    if (cryptocoin.networkNodes.indexOf(newNodeUrl) == -1) {
        cryptocoin.networkNodes.push(newNodeUrl);
    }

    // Step 2)
    const regNodesPromises = [];
    cryptocoin.networkNodes.forEach((networkNodesUrl) => {
        const requestOptions = {
            uri: networkNodesUrl + "/register-node",
            method: "POST",
            body: { newNodeUrl: newNodeUrl },
            json: true,
        };

        regNodesPromises.push(rp(requestOptions));
    });

    // Step 3)
    Promise.all(regNodesPromises)
        .then((data) => {
            const bulkRegisterOptions = {
                uri: newNodeUrl + "/register-nodes-bulk",
                method: "POST",
                body: {
                    allNetworkNodes: [
                        ...cryptocoin.networkNodes,
                        cryptocoin.currentNodeUrl,
                    ],
                    pendingTransactions: cryptocoin.pendingTransactions,
                },
                json: true,
            };

            return rp(bulkRegisterOptions);
        })
        .then((data) => {
            res.json({
                message: "New node registered with network successfully",
            });
        })
        .catch((err) => res.status(400).json({ error: err.message }));
});

app.post("/register-node", function(req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent =
        cryptocoin.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = cryptocoin.currentNodeUrl !== newNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode)
        cryptocoin.networkNodes.push(newNodeUrl);
    res.json({
        message: "New node registered successfully",
    });
});

app.post("/register-nodes-bulk", function(req, res) {
    const allNetworkNodes = req.body.allNetworkNodes;
    const pendingTransactions = req.body.pendingTransactions;

    allNetworkNodes.forEach((networkNodesUrl) => {
        const nodeNotAlreadyPresent =
            cryptocoin.networkNodes.indexOf(networkNodesUrl) == -1;
        const notCurrentNode = cryptocoin.currentNodeUrl !== networkNodesUrl;
        if (nodeNotAlreadyPresent && notCurrentNode)
            cryptocoin.networkNodes.push(networkNodesUrl);
    });
    // update pending transactions
    cryptocoin.pendingTransactions = pendingTransactions;
    res.json({
        message: "Bulk registration successful",
    });
});

/**  ========================= Unregister Nodes =========================
 * Step 1) A new node will call the /register-and-broadcast-node endpoint of an existing node.
 * That node will be broadcasted to all other nodes and removed from the network.
 * Step 2) The current node will initiate then remove the old node from its database.
 */
app.post("/unregister-and-broadcast-node", function(req, res) {
    const oldNodeURL = req.body.oldNodeURL;

    // Step 1)
    const removeNodePromise = [];
    cryptocoin.networkNodes.forEach((networkNodesUrl) => {
        const requestOptions = {
            uri: networkNodesUrl + "/unregister-node",
            method: "POST",
            body: { oldNodeURL: oldNodeURL },
            json: true,
        };

        removeNodePromise.push(rp(requestOptions));
    });

    // Step 2)
    Promise.all(removeNodePromise)
        .then(() => {
            if (cryptocoin.networkNodes.includes(oldNodeURL)) {
                cryptocoin.networkNodes = cryptocoin.networkNodes.filter(
                    (node) => node !== oldNodeURL
                );
            }

            res.json({
                message: "Node removed from network successfully",
            });
        })
        .catch((err) => res.status(400).json({ error: err.message }));
});

app.post("/unregister-node", function(req, res) {
    if (cryptocoin.currentNodeUrl === req.body.oldNodeURL) {
        cryptocoin.networkNodes = [];
    } else {
        const oldNodeURL = req.body.oldNodeURL;
        cryptocoin.networkNodes = cryptocoin.networkNodes.filter(
            (node) => node !== oldNodeURL
        );
    }
    // update pending transactions
    cryptocoin.pendingTransactions = [];
    res.json({
        message: "Node removed successfully",
    });
});

//========================= Consensus =========================

// Used to correct the chain if a node has the wrong chain data.
app.get("/consensus", function(req, res) {
    const requestPromises = [];

    // get all network nodes and make a request to each one
    cryptocoin.networkNodes.forEach((networkNodesUrl) => {
        const requestOptions = {
            uri: networkNodesUrl + "/blockchain",
            method: "GET",
            json: true,
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
        .then((blockchains) => {
            // check if the length of the blockchains is greater than our current node blockchain
            const currentChainLength = cryptocoin.chain.length;
            let maxChainLength = currentChainLength;
            let newLongestChain = null;
            let newPendingTransactions = null;

            blockchains.forEach((blockchain) => {
                if (blockchain.chain.length > maxChainLength) {
                    maxChainLength = blockchain.chain.length;
                    newLongestChain = blockchain.chain;
                    newPendingTransactions = blockchain.pendingTransactions;
                }
            });

            if (!newLongestChain
                // (newLongestChain && !cryptocoin.chainIsValid(newLongestChain))
            ) {
                res.json({
                    message: "Current chain has not been replaced",
                    chain: cryptocoin.chain,
                });
            } else {
                cryptocoin.chain = newLongestChain;
                cryptocoin.pendingTransactions = newPendingTransactions;
                res.json({
                    message: "This chain has been replaced",
                    chain: cryptocoin.chain,
                });
            }
        })
        .catch((err) => res.status(400).json({ error: err.message }));
});

//========================= Block Explorer =========================
app.get("/blockchain", function(req, res) {
    res.send(cryptocoin);
});

app.get("/block/:blockHash", (req, res) => {
    const blockHash = req.params.blockHash;
    const correctBlock = cryptocoin.getBlock(blockHash);
    res.json({ block: correctBlock });
});

app.get("/blockByIndex/:index", (req, res) => {
    const blockIndex = req.params.blockIndex;
    const correctBlock = cryptocoin.getBlockByIndex(blockIndex);
    res.json({ block: correctBlock });
});

app.get("/block/:blockHash/transactions", (req, res) => {
    const blockHash = req.params.blockHash;
    const correctBlock = cryptocoin.getBlockTransactions(blockHash);
    res.json({ trans: correctBlock });
});

app.get("/transaction/:transactionHash", (req, res) => {
    const transactionHash = req.params.transactionHash;
    const transactionData = cryptocoin.getTransaction(transactionHash);
    res.json({ transaction: transactionData });
});

app.get("/address/:address", (req, res) => {
    const address = req.params.address;
    const addressData = cryptocoin.getAddressData(address);
    res.json({ addressData: addressData });
});

app.get("/all-transactions", function(req, res) {
    res.json(cryptocoin.getAllTransactions());
});

app.get("/all-pending-transactions", function(req, res) {
    res.json(cryptocoin.pendingTransactions);
});
//========================= Server =========================
app.listen(port, function() {
    console.log(`Listening on port ${port}...`);
});