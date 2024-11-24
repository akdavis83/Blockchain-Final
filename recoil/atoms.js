import { atom } from "recoil";

export const lockState = atom({
  key: "lockState",
  default: "locked",
});

export const nodeList = atom({
  key: "nodeList",
  default: ["http://localhost:5555"],
});

export const defaultNode = atom({
  key: "defaultNode",
  default: "http://localhost:5555",
});

export const address = atom({
  key: "address",
  default: "",
});

export const miningDetails = atom({
  key: "miningDetails",
  default: {
    difficulty: "5",
    mode: "automatic",
    privKey: "ca1aa0800b3325664f4f9f042971b761f778e5fe979f6855f2239a2043768e9d",
    pubKey: "d6a5c33b1158e08b723c88f172fff4d4c5de1a96a1ed7f2c88c4ce1efd135d460",
    address: "69b115ded44395cf1b31f9df2e8429f1d7c72e7c",
  },
});

export const faucetDetails = atom({
  key: "faucetDetails",
  default: {
    privKey: "cac5f737b9b3dab0f13ce9b4b67c0b3fc53b58883386388d50dbfabef6aa0694",
    pubKey: "e89e201c57d256b035bbff7c247b94a99b0664d387ef782395f02be8d8a0149a0",
    address: "1b49be7b1fb48c5daed885ba73c0fdd475ddbf39",
    duration: "90000",
  },
});
