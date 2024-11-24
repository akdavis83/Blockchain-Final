import hashes from "../lib/hashes";

export const saveKeysInSession = (keyPair) => {
  sessionStorage["privKey"] = keyPair.getPrivate().toString(16);
  let pubKey =
    keyPair.getPublic().getX().toString(16) +
    (keyPair.getPublic().getY().isOdd() ? "1" : "0");
  sessionStorage["pubKey"] = pubKey;
  let ripemd160 = new hashes.RMD160();
  sessionStorage["address"] = ripemd160.hex(pubKey);
};
