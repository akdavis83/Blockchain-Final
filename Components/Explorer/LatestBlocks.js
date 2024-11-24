import styles from "../../styles/BlockExplorer.module.css";
import Link from "next/link";

const LatestBlocks = ({ blocks }) => {
  const minedBy = (block) => {
    const start = block.minedBy.split("").slice(0, 6).join("");
    const end = block.minedBy.split("").slice(-6).join("");
    return `${start}...${end}`;
  };

  return (
    <div className="col-lg-6">
      <div
        className="card shadow-lg mb-5"
        style={{ borderRadius: "10px", top: "3rem", height: "30rem" }}
      >
        {/* BLOCKS */}
        <h5
          className="card-header bg-light"
          style={{
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
          }}
        >
          Latest Blocks
        </h5>
        <div className="card-body" style={{ overflowY: "auto" }}>
          {/* col 1 */}

          {blocks &&
            blocks.map((block, index) => (
              <div key={index}>
                <div className="row">
                  <div className="col-md-3">
                    <div>
                      <div className=" d-flex align-items-center">
                        <div className="">
                          <div
                            className="border rounded text-secondary  fs-5"
                            style={{
                              backgroundColor: "#e2e7e9",
                              paddingRight: "0.4rem",
                              paddingLeft: "0.4rem",
                              marginTop: "0.4rem",
                            }}
                          >
                            Bk
                          </div>
                        </div>
                        <div className=" px-2">
                          <div className=" text-secondary">
                            <Link
                              href={`/explorer/blocks/${block.blockHash.toString()}`}
                            >
                              <a href="#" className={styles.noDecor}>
                                {`${block.blockHash
                                  .split("")
                                  .slice(0, 8)
                                  .join("")}...`}
                              </a>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* col 2 */}
                  <div className="col-md-6">
                    <div className="px-5">
                      <div className="text-secondary">
                        Mined By{" "}
                        <a href="#" className={styles.noDecor}>
                          {minedBy(block)}
                        </a>
                      </div>
                      <div className="  text-secondary">
                        <Link
                          href={`/explorer/blocks/${block.blockHash.toString()}/transactions`}
                        >
                          <a href="#" className={styles.noDecor}>
                            {`${block.transactionCount} txns`}
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                  {/* col 3 */}
                  <div className="col-md-3">
                    <div className=" ">
                      <div className="  d-flex justify-content-end ">
                        {`${block.value.toLocaleString("en-CA")} CRYPTO`}
                      </div>
                      <div></div>
                    </div>
                  </div>
                </div>
                <hr />
              </div>
            ))}
        </div>
        <Link href="/explorer/all-blocks" passHref={true}>
          <div
            className="card-footer  bg-primary  text-light  font-weight-bold text-center"
            style={{
              borderBottomLeftRadius: "10px",
              borderBottomRightRadius: "10px",
              cursor: "pointer",
            }}
          >
            View all Blocks
          </div>
        </Link>
      </div>
    </div>
  );
};

export default LatestBlocks;
