import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import MenuBar from "../../Components/Wallet/MenuBar";
import { useRecoilValue } from "recoil";
import { lockState } from "../../recoil/atoms";

export default function Wallet() {
  const walletStatus = useRecoilValue(lockState);

  return (
    <>
      <Head>
        <title>CRYPTO | Wallet</title>
      </Head>

      <MenuBar />
      <div className="container" style={{ marginTop: "12rem" }}>
        <div className="jumbotron">
          <div className="container text-center text-lg-left">
            <div className="row">
              <div className="col-lg-8">
                <h1 className="display-4">CRYPTOCOIN WALLET.</h1>
                <p className="lead">
                  CRYPTOwallet is a simple, easy to use, and secure wallet for you. It generates a new random address. You can
                  access your wallet at any time with your private key. It can
                  be used to send and receive CRYPTOCOIN's.
                </p>
                <span className="text-center d-inline-block my-3">
                  <Link href="/wallet/create-new-wallet">
                    <a
                      className="btn btn-primary btn-lg w-100"
                      href="#"
                      role="button"
                    >
                      Create a wallet
                    </a>
                  </Link>
                </span>
              </div>
              <div className="col-lg-4 align-items-center d-flex">
                <Image
                  src="/images/cryptocoin.png"
                  alt="blocks-in-hand"
                  className="img-fluid"
                  width="1200px"
                  height="800px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
