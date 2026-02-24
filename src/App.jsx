import { useState, useEffect } from "react";
import { isConnected, requestAccess, signTransaction } from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";
import "./App.css";

const MY_TIP_JAR_ADDRESS = "GCN6GYQUWVPBZ3YVBXKXEPDVJSNHDEE4C3UDVP66L6M54EEO7GDJQ3XI";

const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

function App() {
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [activeBtn, setActiveBtn] = useState(null);

  useEffect(() => {
    if (publicKey) {
      checkBalance(publicKey);
    }
  }, [publicKey]);

  const connectWallet = async () => {
    try {
      const connected = await isConnected();
      if (!connected) {
        alert("Please install the Freighter wallet extension!");
        return;
      }

      const result = await requestAccess();
      const pubKey =
        typeof result === "string"
          ? result
          : result?.address ?? result?.publicKey ?? null;

      if (!pubKey) {
        setStatus("Could not retrieve public key.");
        return;
      }

      setPublicKey(pubKey);
      setStatus("Wallet connected successfully!");
    } catch (error) {
      console.error(error);
      setStatus(" Connection rejected or failed.");
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    setBalance(null);
    setStatus("Wallet disconnected.");
    setCustomAmount("");
    setActiveBtn(null);
  };

  const checkBalance = async (pubKey) => {
    try {
      const account = await server.loadAccount(pubKey);
      const xlmBalance = account.balances.find((b) => b.asset_type === "native");
      setBalance(xlmBalance ? parseFloat(xlmBalance.balance).toFixed(2) : "0.00");
    } catch (error) {
      setBalance("0.00 (not funded)");
    }
  };

  const sendTip = async (amount) => {
    const finalAmount = parseFloat(amount);

    if (!publicKey) return alert("Please connect your wallet first!");
    if (!finalAmount || finalAmount <= 0) return alert("Please enter a valid amount!");
    if (finalAmount < 0.0000001) return alert("Minimum tip is 0.0000001 XLM");

    setStatus("Building transaction... Please check Freighter to sign.");

    try {
      const account = await server.loadAccount(publicKey);
      const fee = await server.fetchBaseFee();

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: MY_TIP_JAR_ADDRESS,
            asset: StellarSdk.Asset.native(),
            amount: finalAmount.toFixed(7),
          })
        )
        .setTimeout(30)
        .build();

      const signResult = await signTransaction(transaction.toXDR(), {
        networkPassphrase: StellarSdk.Networks.TESTNET,
      });

      setStatus("Submitting to Stellar network...");

      const signedXdr =
        typeof signResult === "string"
          ? signResult
          : signResult?.signedTxXdr ?? signResult;

      const transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        StellarSdk.Networks.TESTNET
      );

      const response = await server.submitTransaction(transactionToSubmit);
      setStatus(`Success! Sent ${finalAmount} XLM — Hash: ${response.hash.slice(0, 10)}...`);
      setCustomAmount("");
      setActiveBtn(null);
      checkBalance(publicKey);
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.extras?.result_codes?.transaction ||
        error?.message ||
        "Unknown error";
      setStatus(` Transaction failed: ${msg}`);
    }
  };

  const handlePreset = (amount) => {
    setActiveBtn(amount);
    setCustomAmount("");
    sendTip(amount);
  };

  const handleCustomSend = () => {
    setActiveBtn("custom");
    sendTip(customAmount);
  };

  return (
    <div className="container">
      <h1>☕ My Tip Jar</h1>
      <p>Fuel my next build — buy me a coffee! ☕</p>

      <div className="qr-section">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${MY_TIP_JAR_ADDRESS}`}
          alt="Tip Jar QR Code"
        />
        <p className="address-text">Scan to tip via mobile</p>
      </div>

      <hr />

      <div className="wallet-section">
        {!publicKey ? (
          <button onClick={connectWallet} className="connect-btn">
            Connect Freighter Wallet
          </button>
        ) : (
          <div className="dashboard">
            <p>
              <strong>Connected:</strong> {publicKey.slice(0, 5)}...{publicKey.slice(-5)}
            </p>
            <p>
              <strong>Your Balance:</strong> {balance ?? "Loading..."} XLM
            </p>

            {/* Quick preset buttons */}
            <p className="section-label"> Quick Tip</p>
            <div className="tip-buttons">
              <button
                onClick={() => handlePreset(5)}
                className={activeBtn === 5 ? "active-btn" : ""}
              >
                Tip 5 XLM
              </button>
              <button
                onClick={() => handlePreset(10)}
                className={activeBtn === 10 ? "active-btn" : ""}
              >
                Tip 10 XLM
              </button>
            </div>

            {/* Custom amount section */}
            <p className="section-label"> Custom Amount</p>
            <div className="custom-tip-row">
              <input
                type="number"
                min="0.0000001"
                step="any"
                placeholder="Enter any XLM amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setActiveBtn("custom");
                }}
                className="custom-input"
              />
              <button
                onClick={handleCustomSend}
                disabled={!customAmount || parseFloat(customAmount) <= 0}
                className="send-btn"
              >
                Send
              </button>
            </div>

            <button onClick={disconnectWallet} className="disconnect-btn">
              Disconnect
            </button>
          </div>
        )}
      </div>

      {status && <div className="status-box">{status}</div>}
    </div>
  );
}

export default App;