import Link from "next/link";
import styles from "../../styles/Wallet.module.css";
import { useRecoilState, useResetRecoilState } from "recoil";
import { lockState, address } from "../../recoil/atoms";

const Navbar = () => {
  const [walletStatus, setWalletStatus] = useRecoilState(lockState);
  const resetLockState = useResetRecoilState(address);

  const handleLogout = () => {
    sessionStorage.removeItem("privKey");
    sessionStorage.removeItem("pubKey");
    sessionStorage.removeItem("address");
    setWalletStatus("locked");
    resetLockState();
  };

  return (
    <>
      <div
        className={styles.background}
        style={{ display: "flex", justifyContent: "center" }}
      >
        <p className="btn fs-5">
          <Link href="/wallet">
            <a className="nav-link text-info fs-5">Home</a>
          </Link>
        </p>

        {walletStatus == "locked" ? (
          <>
            <p className="btn fs-5">
              <Link href="/wallet/create-new-wallet">
                <a className="nav-link text-info fs-5">Create</a>
              </Link>
            </p>
            <p className="btn fs-5">
              <Link href="/wallet/open-existing-wallet">
                <a className="nav-link text-info fs-5"> Open</a>
              </Link>
            </p>
          </>
        ) : (
          <>
            <p className="btn fs-5">
              <Link href="/wallet/account-balance">
                <a className="nav-link text-info fs-5">Balance</a>
              </Link>
            </p>
            <p className="btn fs-5">
              <Link href="/wallet/send-transaction">
                <a className="nav-link text-info fs-5"> Send</a>
              </Link>
            </p>
            <p className="btn fs-5">
              <Link href="/wallet">
                <a className="nav-link text-info fs-5" onClick={handleLogout}>
                  {" "}
                  Logout
                </a>
              </Link>
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;
