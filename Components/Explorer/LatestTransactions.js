import styles from "../../styles/BlockExplorer.module.css";
import Link from "next/link";

const LatestTransactions = ({ transactions }) => {
  const trimAddress = (address) => {
    const start = address.split("").slice(0, 14).join("");
    const end = address.split("").slice(-6).join("");
    return `${start}...${end}`;
  };

  return (
    <div className="col-lg-6">
      <div
        className="card shadow-lg mb-5"
        style={{
          borderRadius: "10px",
          top: "3rem",
          height: "30rem",
        }}
      >
        {/* TRANSACTIONS */}
        <h5
          className="card-header d-flex justify-content-between"
          style={{
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
          }}
        >
          Latest Transactions
          <Link href="/explorer/all-pending-transactions" passHref={true}>
            <span className="badge bg-warning" role="button">
              View Pending
            </span>
          </Link>
        </h5>

        <div className="card-body" style={{ overflowY: "auto" }}>
          {transactions &&
            transactions.map((tran, index) => (
              <div key={index}>
                <div className="row">
                  {/* col 1 */}
                  <div className="col-md-3">
                    <div>
                      <div className=" d-flex align-items-center">
                        <div className="">
                          <div
                            className={
                              tran.transferSuccessful
                                ? "border border-success rounded-circle text-success fs-5"
                                : "border  border-warning rounded-circle text-warning fs-5"
                            }
                            style={{
                              // backgroundColor: "#e2e7e9",
                              paddingRight: "0.4rem",
                              paddingLeft: "0.4rem",
                              marginTop: "0.4rem",
                            }}
                          >
                            Tx
                          </div>
                        </div>
                        <div className=" px-2">
                          <div className=" text-secondary">
                            <Link
                              href={`/explorer/transactions/${tran.transactionDataHash.toString()}`}
                            >
                              <a className={styles.noDecor}>
                                {`${tran.transactionDataHash
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
                    <div className="px-4">
                      <div className="text-secondary">
                        From:{" "}
                        <Link
                          href={`/explorer/addresses/${tran.from.toString()}`}
                        >
                          <a href="#" className={styles.noDecor}>
                            {trimAddress(tran.from)}
                          </a>
                        </Link>
                      </div>
                      <div className="text-secondary">
                        To:{" "}
                        <Link
                          href={`/explorer/addresses/${tran.to.toString()}`}
                        >
                          <a href="#" className={styles.noDecor}>
                            {trimAddress(tran.to)}
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                  {/* col 3 */}
                  <div className="col-md-3">
                    <div className=" ">
                      <div className="  d-flex justify-content-end ">
                        {`${tran.value.toLocaleString("en-CA")} CRYPTO`}
                      </div>
                      <div></div>
                    </div>
                  </div>
                </div>

                <hr />
              </div>
            ))}
        </div>
        <Link href="/explorer/all-transactions" passHref={true}>
          <div
            className="card-footer  bg-primary  text-light  font-weight-bold text-center"
            style={{
              borderBottomLeftRadius: "10px",
              borderBottomRightRadius: "10px",
              cursor: "pointer",
            }}
          >
            View all Transactions
          </div>
        </Link>
      </div>
    </div>
  );
};

export default LatestTransactions;
