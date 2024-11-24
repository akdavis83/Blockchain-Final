import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Wallet.module.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { nodeList, defaultNode } from "../recoil/atoms";
import { Modal } from "react-bootstrap";

export default function Nodes() {
  const [currentNodes, setCurrentNodes] = useRecoilState(nodeList);
  const [selectedNode, setSelectedNode] = useState("");
  const [updateUserNode, setUpdateUserNode] = useRecoilState(defaultNode);
  const [show, setShow] = useState(false);
  const [nodeInfo, setNodeInfo] = useState([]);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [allNodes, setAllNodes] = useState([
    "http://localhost:5556",
    "http://localhost:5557",
    "http://localhost:5558",
    "http://localhost:5559",
  ]);

  const addNode = async (nodeUrl) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const body = { newNodeUrl: nodeUrl };

    const register = await axios.post(
      "http://localhost:5555/register-and-broadcast-node",
      body,
      config
    );

    const result = register.data.message;

    if (result) {
      const nodeNum = nodeUrl.split("").pop();
      const msg = `Node ${nodeNum} registered with network successfully`;

      toast.success(msg, {
        position: "bottom-right",
        theme: "colored",
      });

      // Run Consensus on current node. Check if node has current chain data.
      await handleConsensus(nodeUrl);

      //Update the status of the node on the view
      if (!currentNodes.includes(nodeUrl)) {
        setCurrentNodes([...currentNodes, nodeUrl]);
      }
    } else {
      toast.error("Node unable to connect", {
        position: "bottom-right",
        theme: "colored",
      });
    }
  };

  const removeNode = async (nodeUrl) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const body = { oldNodeURL: nodeUrl };

    const register = await axios.post(
      "http://localhost:5555/unregister-and-broadcast-node",
      body,
      config
    );

    const result = register.data.message;

    if (result) {
      const nodeNum = nodeUrl.split("").pop();
      const msg = `Node ${nodeNum} successfully removed from network`;

      toast.success(msg, {
        position: "bottom-right",
        theme: "colored",
      });

      //Update the status of the node on the view
      if (currentNodes.includes(nodeUrl)) {
        setCurrentNodes(currentNodes.filter((node) => node !== nodeUrl));
      }

      // Check if the node is the default node
      if (updateUserNode === nodeUrl) {
        setUpdateUserNode("http://localhost:5555");
      }
    } else {
      toast.error("Node unable to connect", {
        position: "bottom-right",
        theme: "colored",
      });
    }
  };

  const handleNodeChange = (e) => {
    const newNode = e.target.value;
    setSelectedNode(newNode);
    setUpdateUserNode(newNode);
    toast.info(`Now connected to ${newNode}`, {
      position: "bottom-right",
      theme: "colored",
    });
  };

  const handleClick = async (nodeUrl) => {
    const result = await axios.get(`${nodeUrl}/info`);
    setNodeInfo(result.data);
    handleShow();
  };

  const handleConsensus = async (nodeUrl) => {
    // Run Consensus on current node. Check if node has current chain data.
    const consensusResult = await axios.get(`${nodeUrl}/consensus`);

    const conResult = consensusResult.data.message;
    if (conResult) {
      toast.info(conResult, {
        position: "bottom-right",
        theme: "colored",
      });
    }
  };

  return (
    <>
      <Head>
        <title>CRYPTO | Nodes</title>
      </Head>

      <ToastContainer position="top-center" pauseOnFocusLoss={false} />

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{nodeInfo.nodeUrl}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-break">
          <table className="table">
            <tbody>
              <tr>
                <th scope="row">About</th>
                <td>{nodeInfo.about}</td>
              </tr>
              <tr>
                <th scope="row">Blocks</th>
                <td>{nodeInfo.blocks}</td>
              </tr>
              <tr>
                <th scope="row">Chain Id</th>
                <td>{nodeInfo.chainId}</td>
              </tr>
              <tr>
                <th scope="row">Peers</th>
                <td>{nodeInfo.peers}</td>
              </tr>
              <tr>
                <th scope="row">Confirmed Transactions</th>
                <td>{nodeInfo.confirmedTransactions}</td>
              </tr>
              <tr>
                <th scope="row">Pending Transactions</th>
                <td>{nodeInfo.pendingTransactions}</td>
              </tr>
            </tbody>
          </table>
        </Modal.Body>
      </Modal>

      <div
        className={styles.background}
        style={{ display: "flex", justifyContent: "center" }}
      ></div>

      {/* Select Default Node */}
      <div className="container mt-4" style={{ width: "80rem" }}>
        <div className="jumbotron">
          <h1 className="display-4">Hey,</h1>
          <p className="lead">
            CRYPTOCOIN is a peer-to-peer blockchain network that enables the use
            of a decentralized ledger to store, share, and verify information.
          </p>
          <hr className="my-2" />
          <p className="lead">
            Select your default node to be used for all transactions.
          </p>
          {/* Select Node Url */}
          <div className="input-group mb-2 p-2">
            <div className="input-group-prepend">
              <label className="input-group-text" htmlFor="inputGroupSelect01">
                Node Url
              </label>
            </div>
            <select
              value={selectedNode}
              className="form-control"
              id="inputGroupSelect01"
              onChange={(e) => {
                handleNodeChange(e);
              }}
            >
              {currentNodes &&
                currentNodes.map((node, index) => (
                  <option key={index} value={node}>
                    {node}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Node to Network */}
      <div className="container w-85 d-flex justify-content-center">
        <table
          className="table"
          style={{ maxWidth: "80rem", marginBottom: "5rem" }}
        >
          <thead>
            <tr>
              <th scope="col" className="text-center">
                Details
              </th>
              <th scope="col" className="text-center">
                Location
              </th>
              <th scope="col" className="text-center">
                Status
              </th>
              <th scope="col" className="text-center">
                Action
              </th>
              <th scope="col" className="text-center">
                Consensus
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="text-center">
                <Link href="">
                  <a
                    onClick={() => {
                      handleClick("http://localhost:5555");
                    }}
                  >
                    Node 1
                  </a>
                </Link>
              </td>
              <td className="text-center">
                <Link href="http://localhost:5555/blockchain">
                  <a target="_blank" rel="noopener noreferrer">
                    http://localhost:5555
                  </a>
                </Link>
              </td>
              <td className="text-center">Online</td>
              <td className="justify-content-center d-flex">Always On</td>
              <td className="text-center">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm px-4"
                  onClick={() => {
                    handleConsensus("http://localhost:5555");
                  }}
                >
                  Verify
                </button>
              </td>
            </tr>

            {allNodes.map((node, index) => (
              <tr key={index}>
                {currentNodes.includes(node) ? (
                  <>
                    <td className="text-center">
                      <Link href="">
                        <a
                          onClick={() => {
                            handleClick(node);
                          }}
                        >
                          Node {index + 2}
                        </a>
                      </Link>
                    </td>
                    <td className="text-center">
                      <Link href={`${node}/blockchain`}>
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "blue" }}
                        >
                          {node}
                        </a>
                      </Link>
                    </td>
                    <td className="text-center">Online</td>
                    <td className="justify-content-center d-flex">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm mx-2 px-4"
                        value={node}
                        onClick={(e) => {
                          removeNode(e.target.value);
                        }}
                      >
                        Stop
                      </button>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm px-4"
                        value={node}
                        onClick={() => {
                          handleConsensus(node);
                        }}
                      >
                        Verify
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="text-center">Node {index + 2}</td>
                    <td className="text-center">{node}</td>
                    <td className="text-center">-</td>
                    <td className="justify-content-center d-flex">
                      <button
                        type="button"
                        className="btn btn-success btn-sm px-4"
                        value={node}
                        onClick={(e) => {
                          addNode(e.target.value);
                        }}
                      >
                        Start
                      </button>
                    </td>
                    <td className="text-center"> - </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
