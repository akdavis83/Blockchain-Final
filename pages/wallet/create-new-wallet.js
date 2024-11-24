import Head from "next/head";
import { useRef, useState } from "react";
import MenuBar from "../../Components/Wallet/MenuBar";
import elliptic from "../../lib/elliptic";
import { useRecoilState } from "recoil";
import { lockState, address } from "../../recoil/atoms.js";
import { saveKeysInSession } from "../../lib/session";

export default function CreateNewWallet() {
  const [walletStatus, setWalletStatus] = useRecoilState(lockState);
  const [walletAddress, setWalletAddress] = useRecoilState(address);
  const [isCreated, setIsCreated] = useState(false);

  const secp256k1 = new elliptic.ec("secp256k1");
  const textAreaRef = useRef("");

  const handleClick = () => {
    let keyPair = secp256k1.genKeyPair();
    saveKeysInSession(keyPair);
    // display result
    textAreaRef.current.value =
      "Generated random private key: " +
      sessionStorage["privKey"] +
      "\n" +
      "\n" +
      "Extracted public key: " +
      sessionStorage["pubKey"] +
      "\n" +
      "\n" +
      "Extracted blockchain address: " +
      sessionStorage["address"];

    setIsCreated(true);
    setWalletStatus("unlocked");
    setWalletAddress(sessionStorage["address"]);
  };

  return (
    <>
      <Head>
        <title>CRYPTOCOIN Wallet | New Wallet</title>
      </Head>

      <MenuBar />

      <div className="container">
        <h1 className="display-5 my-5">Create a New Wallet</h1>

        <form>
          <div className="form-group">
            <textarea
              className="form-control"
              rows="5"
              ref={textAreaRef}
            ></textarea>
          </div>
          {!isCreated ? (
            <button
              type="button"
              value="Generate Now"
              className="btn btn-primary btn mt-3 w-100"
              onClick={handleClick}
            >
              Generate Now
            </button>
          ) : (
            <button
              type="button"
              value="Generate Now"
              className="btn btn-primary btn mt-3 w-100"
              disabled
            >
              Wallet Created Successfully!
            </button>
          )}
        </form>
      </div>
    </>
  );
}
