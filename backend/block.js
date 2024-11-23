const CryptoUtils = require("./utils/CryptoUtils");

module.exports = class Block {
  constructor(
    index,
    transactions,
    difficulty,
    prevBlockHash,
    minedBy,
    blockDataHash,
    nonce,
    dateCreated,
    blockHash,
    blockReward
  ) {
    this.index = index; // integer
    this.transactions = transactions; // Transaction[]
    this.difficulty = difficulty; // integer
    this.prevBlockHash = prevBlockHash; // hex_number[64]
    this.minedBy = minedBy; // address (40 hex digits)
    this.blockDataHash = blockDataHash; // address (40 hex digits)

    // Calculate the block data hash if it is missing
    if (this.blockDataHash === undefined) this.calculateBlockDataHash();

    this.nonce = nonce; // integer
    this.dateCreated = dateCreated; // ISO8601_string
    this.blockHash = blockHash; // hex_number[64]

    // Calculate the block hash if it is missing
    if (this.blockHash === undefined) this.calculateBlockHash();

    this.blockReward = blockReward; // integer
  }

  calculateBlockDataHash() {
    let blockData = {
      index: this.index,
      transactions: this.transactions.map((trans) =>
        Object({
          from: trans.from,
          to: trans.to,
          value: trans.value,
          fee: trans.fee,
          dateCreated: trans.dateCreated,
          data: trans.data,
          senderPubKey: trans.senderPubKey,
          transactionDataHash: trans.transactionDataHash,
          senderSignature: trans.senderSignature,
          minedInBlockIndex: trans.minedInBlockIndex,
          transferSuccessful: trans.transferSuccessful,
        })
      ),
      difficulty: this.difficulty,
      prevBlockHash: this.prevBlockHash,
      minedBy: this.minedBy,
    };
    let blockDataJSON = JSON.stringify(blockData);
    this.blockDataHash = CryptoUtils.sha256(blockDataJSON);
  }

  calculateBlockHash() {
    let data = `${this.blockDataHash}|${this.dateCreated}|${this.nonce}`;
    this.blockHash = CryptoUtils.sha256(data);
  }
};
