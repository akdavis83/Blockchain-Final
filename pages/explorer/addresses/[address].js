import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../../../styles/BlockExplorer.module.css";
import axios from "axios";
import SearchBar from "../../../Components/Explorer/SearchBar";

export const getStaticPaths = async () => {
  const addressData = await axios.get(`http://localhost:5555/addresses`);

  const paths = addressData.data.map((address) => ({
    params: {
      address: address,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async (context) => {
  const { address } = context.params;
  const addressData = await axios.get(
    `http://localhost:5555/address/${address}`
  );

  if (!addressData) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      ...addressData.data,
      address,
    },
  };
};

const AddressDetails = (props) => {
  const router = useRouter();

  const getBlockHash = async (index) => {
    let result = await axios.get(`http://localhost:5555/blockByIndex/${index}`);
    router.push(`/explorer/blocks/${result.data.block.blockHash}`);
  };

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
        <div className="container" style={{ marginTop: "8rem" }}>
          <div className="card">
            <div className="card-header">Address: {props.address}</div>
            <div className="card-body">
              <blockquote className="blockquote mb-0">
                <p>
                  Balance:{" "}
                  {props.addressData.addressBalance.toLocaleString("en-CA")}{" "}
                  CRYPTO
                </p>
              </blockquote>
            </div>
          </div>

          <div className="table-responsive" style={{ overflow: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Txn Hash</th>
                  <th scope="col">Block</th>
                  <th scope="col">From</th>
                  <th scope="col" style={{ paddingLeft: "3rem" }}>
                    To
                  </th>
                  <th scope="col">Value</th>
                  <th scope="col">[Txn Fee]</th>
                </tr>
              </thead>
              <tbody>
                {props.addressData.transactions.length > 0 &&
                  props.addressData.transactions.reverse().map((d, index) => (
                    <tr key={index}>
                      <td>
                        <Link
                          href={`/explorer/transactions/${d.transactionDataHash.toString()}`}
                        >
                          {`${d.transactionDataHash.slice(0, 20)}...`}
                        </Link>
                      </td>
                      <td
                        onClick={() => {
                          getBlockHash(d.minedInBlockIndex);
                        }}
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                          color: "blue",
                        }}
                      >
                        {d.minedInBlockIndex}
                      </td>
                      <td>
                        <Link href={`/explorer/addresses/${d.from.toString()}`}>
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
                          <Link href={`/explorer/addresses/${d.to.toString()}`}>
                            {`${d.to.slice(0, 20)}...`}
                          </Link>
                        </div>
                      </td>
                      <td>{d.value.toLocaleString("en-CA")}</td>
                      <td>{d.fee}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressDetails;
