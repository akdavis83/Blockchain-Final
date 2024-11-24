import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Wallet.module.css";
import Footer from "../Components/Footer";

export default function Wallet() {
  return (
    <>
      <Head>
        <title>CRYPTOCOIN</title>
      </Head>

      <div
        className={styles.background}
        style={{ display: "flex", justifyContent: "center" }}
      ></div>
      <div className="container" style={{ marginTop: "9rem", height: "100%" }}>
        <div className="jumbotron">
          <div className="container text-center text-lg-left">
            <div className="row">
              <div className="col-lg-8">
                <h1 className="display-4">
                  CRYPTOCOIN is a basic blockchain protocol implementaion.
                </h1>
                <p className="lead">
                  CRYPTOCOIN is a peer-to-peer Internet currency that enables
                  payments to anyone in my localhost. CRYPTOCOIN is an open
                  source, global payment network that is fully
                  decentralized.
                </p>
                <span className="text-center d-inline-block">
                  <Link href="/wallet">
                    <a
                      className="btn btn-primary btn-lg w-100"
                      href="#"
                      role="button"
                    >
                      CRYPTOCOIN
                    </a>
                  </Link>
                  <p className="text-muted" style={{ fontSize: "14px" }}>
                    CC COINS
                  </p>
                </span>
              </div>
              <div className="col-lg-4 align-items-center d-flex">
                <Image
                  src="/images/eb.png"
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
      <Footer />
    </>
  );
}
