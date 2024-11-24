import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/BlockExplorer.module.css";
import axios from "axios";
import { useState, useEffect } from "react";
import SearchBar from "../../Components/Explorer/SearchBar";

export const getStaticProps = async (context) => {
  const blockchain = await axios.get(`http://localhost:5555/blockchain`);
  return {
    props: {
      ...blockchain.data,
    },
  };
};

const AllBlocks = (props) => {
  const [chainValue, setChainValue] = useState(0);

  useEffect(() => {
    // calculate block value
    let value = props.chain
      .map((block) =>
        block.transactions.map((t) => t.value).reduce((a, b) => a + b)
      )
      .reduce((a, b) => a + b);

    setChainValue(value);
  }, []);

  return (
    <>
      <Head>
        <title>CRYPTO | Block Explorer</title>
      </Head>
      <div className={styles.background}></div>

      <div
        className="container position-relative "
        style={{
          bottom: "11rem",
          zIndex: "2",
        }}
      >
        <SearchBar />
        <div
          className="container"
          style={{ marginTop: "8rem", height: "24rem" }}
        >
          <div className="card">
            <div className="card-header">
              Transactions: {props.chain.length}
            </div>
            <div className="card-body">
              <blockquote className="blockquote mb-0">
                <p>Block Value: {chainValue.toLocaleString("en-CA")} CRYPTO</p>
              </blockquote>
            </div>
          </div>

          <div
            className="table-responsive"
            style={{ height: "26rem", overflow: "auto" }}
          >
            <table className="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Height</th>
                  <th scope="col">Timestamp</th>
                  <th scope="col">Mined By</th>
                  <th scope="col">Transactions</th>
                  <th scope="col">Difficulty</th>
                  <th scope="col">Block Reward</th>
                </tr>
              </thead>
              <tbody>
                {props.chain.length > 0 &&
                  props.chain.reverse().map((d, index) => (
                    <Link
                      href={`/explorer/blocks/${d.blockHash.toString()}/transactions`}
                      passHref={true}
                      key={index}
                    >
                      <tr style={{ cursor: "pointer" }}>
                        <td>{d.index}</td>
                        <td>{d.dateCreated}</td>
                        <td>
                          <Link
                            href={`/explorer/addresses/${d.minedBy.toString()}`}
                            passHref={true}
                          >
                            {`${d.minedBy.slice(0, 20)}...`}
                          </Link>
                        </td>

                        <td>
                          <button
                            type="button"
                            className={"btn btn-sm btn-success"}
                            style={{
                              fontSize: "0.8rem",
                              // marginRight: "0.5rem",
                              // padding: "0.2rem",
                              width: "7rem",
                              borderRadius: "0.5rem",
                            }}
                          >
                            {`${d.transactions.length} transactions`}
                          </button>
                        </td>
                        <td>{d.difficulty}</td>
                        <td>{d.blockReward}</td>
                        <td>{d.fee}</td>
                      </tr>
                    </Link>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllBlocks;
