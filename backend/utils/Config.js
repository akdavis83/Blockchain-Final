const Block = require("../block");
const Transaction = require("../Transaction");
const CryptoUtils = require("./CryptoUtils");

const faucetPrivateKey =
  "cac5f737b9b3dab0f13ce9b4b67c0b3fc53b58883386388d50dbfabef6aa0694";
const faucetPublicKey = CryptoUtils.privateKeyToPublicKey(faucetPrivateKey);
const faucetAddress = CryptoUtils.publicKeyToAddress(faucetPublicKey);

const minerPrivateKey =
  "ca1aa0800b3325664f4f9f042971b761f778e5fe979f6855f2239a2043768e9d";
const minerPublicKey = CryptoUtils.privateKeyToPublicKey(faucetPrivateKey);
const minerAddress = CryptoUtils.publicKeyToAddress(faucetPublicKey);

const nullAddress = "0000000000000000000000000000000000000000";
const nullPubKey =
  "00000000000000000000000000000000000000000000000000000000000000000";
const nullSignature = [
  "00000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000000000000000000000000000",
];
const blockReward = 50000;

const genesisDate = "2024-11-06T00:00:00.000Z";
const genesisFaucetTransaction = new Transaction(
  nullAddress, // from address
  faucetAddress, // to Address
  1000000000000, // value of transfer
  0, // fee for mining
  genesisDate, // dateCreated
  "genesis tx", // data (payload)
  nullPubKey, // senderPubKey
  undefined, // transactionDataHash
  nullSignature, // senderSignature
  0, // minedInBlockIndex
  true // transferSuccessful
);

const genesisBlock = new Block(
  0, // block index
  [genesisFaucetTransaction], // transactions array
  0, // currentDifficulty
  undefined, // previous block hash
  minerAddress, // mined by (address)
  undefined, // block data hash
  0, // nonce
  genesisDate, // date created
  undefined, // block hash
  0 // mining reward
);

module.exports = {
  defaultServerHost: "localhost",
  defaultServerPort: 5555,
  faucetPrivateKey,
  faucetPublicKey,
  faucetAddress,
  minerPrivateKey,
  minerPublicKey,
  minerAddress,
  nullAddress,
  nullPubKey,
  nullSignature,
  startDifficulty: 5,
  minTransactionFee: 10,
  maxTransactionFee: 1000000,
  blockReward,
  maxTransferValue: 10000000000000,
  safeConfirmCount: 3,
  genesisBlock,
};
