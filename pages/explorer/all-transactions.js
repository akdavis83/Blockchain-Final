import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/BlockExplorer.module.css";
import axios from "axios";
import { useState, useEffect } from "react";
import SearchBar from "../../Components/Explorer/SearchBar";

export const getStaticProps = async () => {
  const transactionData = await axios.get(
    `http://localhost:5555/all-transactions`
  );
  return {
    props: {
      ...transactionData.data,
    },
  };
};

const AllTransactions = (props) => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const handleBlockchain = async () => {};

  useEffect(() => {
    // construct the array of transactions
    const transactionData = Object.values(props);
    setAllTransactions(transactionData.reverse());

    // calculate the total value of all transactions
    let value = transactionData.map((t) => t.value).reduce((a, b) => a + b);
    setTotalValue(value);
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
          style={{ marginTop: "8rem", height: "25rem" }}
        >
          <div className="card">
            <div className="card-header">
              Transactions: {allTransactions.length}
            </div>
            <div className="card-body">
              <blockquote className="blockquote mb-0">
                <p>Total Value: {totalValue.toLocaleString("en-CA")} CRYPTO</p>
              </blockquote>
            </div>
          </div>

          <div
            className="table-responsive"
            style={{ height: "26rem", overflow: "auto" }}
          >
            <table className="table table-hover ">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "12rem" }}>
                    Txn Hash
                  </th>
                  <th scope="col" style={{ textAlign: "center" }}>
                    Block
                  </th>
                  <th scope="col">From</th>
                  <th scope="col" style={{ paddingLeft: "3rem" }}>
                    To
                  </th>
                  <th scope="col">Value</th>
                  <th scope="col">[Txn Fee]</th>
                </tr>
              </thead>
              <tbody>
                {allTransactions.length > 0 &&
                  allTransactions.map((d, index) => (
                    <Link
                      href={`/explorer/transactions/${d.transactionDataHash.toString()}`}
                      key={index}
                      passHref={true}
                    >
                      <tr style={{ cursor: "pointer" }}>
                        <td>
                          <Link
                            href={`/explorer/transactions/${d.transactionDataHash.toString()}`}
                          >
                            {`${d.transactionDataHash.slice(0, 20)}...`}
                          </Link>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {d.minedInBlockIndex}
                        </td>
                        <td>
                          <Link
                            href={`/explorer/addresses/${d.from.toString()}`}
                          >
                            {`${d.from.slice(0, 20)}...`}
                          </Link>
                        </td>
                        <td>
                          <div className="d-flex">
                            <button
                              type="button"
                              className={`${
                                d.from === props.address
                                  ? "btn btn-sm btn-warning"
                                  : "btn btn-sm btn-success"
                              }`}
                              style={{
                                fontSize: "0.7rem",
                                marginRight: "0.5rem",
                                padding: "0.2rem",
                                width: "2rem",
                                borderRadius: "0.5rem",
                              }}
                            >
                              {`${d.from === props.address ? "OUT" : "IN"}`}
                            </button>
                            <Link
                              href={`/explorer/addresses/${d.to.toString()}`}
                            >
                              {`${d.to.slice(0, 20)}...`}
                            </Link>
                          </div>
                        </td>
                        <td>{d.value.toLocaleString("en-CA")}</td>
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

export default AllTransactions;
