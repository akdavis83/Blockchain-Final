import { Offcanvas, Button } from "react-bootstrap";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRecoilValue } from "recoil";
import { defaultNode, address, miningDetails } from "../recoil/atoms";

const UserDetails = ({ ...props }) => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const node = useRecoilValue(defaultNode);
  const walletAddress = useRecoilValue(address);
  const _miningDetails = useRecoilValue(miningDetails);

  return (
    <>
      <Button
        variant="primary"
        onClick={handleShow}
        style={{
          position: "absolute",
          top: "9rem",
          borderTopLeftRadius: "0",
          borderBottomLeftRadius: "0",
          borderTopRightRadius: "25%",
          borderBottomRightRadius: "25%",
          width: "4rem",
          height: "3rem",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          fill="currentColor"
          className="bi bi-info-circle"
          viewBox="0 0 16 16"
        >
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
        </svg>
      </Button>

      <Offcanvas show={show} onHide={handleClose} {...props}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <Image
              src="/images/cryptocoin.png"
              width="16px"
              height="16px"
              className="rounded"
              alt=""
            />{" "}
            Session Configuration
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ul className="list-group">
            <li className="list-group-item">
              <strong className="me-auto">Wallet address:</strong>{" "}
              {walletAddress ? (
                <Link href={`/explorer/addresses/${walletAddress}`}>
                  {walletAddress}
                </Link>
              ) : (
                <Link href="/wallet">Connect to wallet</Link>
              )}
            </li>
            <li className="list-group-item">
              <strong>Connected node:</strong> {node}
            </li>
            <li className="list-group-item">
              <strong>Mining mode:</strong> {_miningDetails.mode}{" "}
            </li>
          </ul>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default UserDetails;
