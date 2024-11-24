import Head from "next/head";
import Link from "next/link";
import styles from "../../../../styles/BlockExplorer.module.css";
import axios from "axios";
import { useState, useEffect } from "react";
import SearchBar from "../../../../Components/Explorer/SearchBar";

export const getStaticPaths = async () => {
  const blockData = await axios.get(`http://localhost:5555/blockchain`);

  const paths = blockData.data.chain.map((block) => ({
    params: {
      block: block.blockHash.toString(),
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async (context) => {
  const { block } = context.params;
  const blockData = await axios.get(`http://localhost:5555/block/${block}`);

  if (!blockData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...blockData.data,
    },
  };
};

const BlockDetails = ({ block }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData([
      { name: "Block Height:", value: block.index },
      { name: "Timestamp:", value: block.dateCreated },
      {
        name: "Transactions:",
        value: `${block.transactions.length}`,
        link: `/explorer/blocks/${block.blockHash.toString()}/transactions`,
      },
      {
        name: "Mined by:",
        value: `${block.minedBy}`,
        link: `/explorer/addresses/${block.minedBy}`,
      },
      {
        name: "Block Reward:",
        value: `${block.blockReward.toLocaleString("en-CA")}`,
      },
      { name: "Difficulty:", value: `${block.difficulty}` },
      {
        name: "Block Hash:",
        value: `${block.blockHash}`,
      },
      { name: "BlockDataHash:", value: `${block.blockDataHash}` },
      { name: "Nonce:", value: `${block.nonce}` },
      { name: "Data:", value: `${block.data}` },
    ]);
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
        <div className="container" style={{ marginTop: "8rem" }}>
          <h4 className="display-5">{`Block #${block.index}`}</h4>
          <div
            className="container p-2 border rounded-3"
            style={{ overflow: "auto" }}
          >
            <table className="table ">
              <tbody>
                {data &&
                  data.map((d, index) => (
                    <>
                      <tr key={index}>
                        <td style={{ paddingRight: "10rem" }}> {d.name}</td>

                        {d.link ? (
                          <td>
                            <Link href={`${d.link}`}>{d.value}</Link>
                          </td>
                        ) : (
                          <td>{d.value}</td>
                        )}
                      </tr>
                    </>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlockDetails;
