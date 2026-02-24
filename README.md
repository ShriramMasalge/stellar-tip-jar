# ☕ Stellar Tip Jar

A decentralized tip jar web app built with **React** and the **Stellar blockchain (Testnet)**.  
Users can connect their Freighter wallet and send XLM tips directly — no middlemen, no fees.

---

## 🚀 Live Demo

> Run locally using the steps below. No hosted deployment required for submission.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React (Vite) | Frontend UI framework |
| @stellar/stellar-sdk | Build & submit Stellar transactions |
| @stellar/freighter-api | Connect to Freighter browser wallet |
| Stellar Horizon Testnet | Blockchain network for testing |
| QR Server API | Generate QR code for wallet address |

---

## 📁 Project Structure

```
stellar-tip-jar/
├── public/
├── src/
│   ├── App.jsx        ← Main component (UI + wallet logic)
│   ├── App.css        ← Styling
│   └── main.jsx       ← React entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18 or higher
- [Freighter Wallet](https://freighter.app) browser extension installed
- A funded Stellar **Testnet** account ([Get free testnet XLM here](https://laboratory.stellar.org/#account-creator?network=test))

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/stellar-tip-jar.git
cd stellar-tip-jar

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
http://localhost:5173
```

---

## 💡 How It Works

1. User opens the app in their browser
2. Clicks **"Connect Freighter Wallet"** — the Freighter extension asks for permission
3. App fetches and displays the user's XLM balance from Stellar Testnet
4. User selects a **preset tip** (5 or 10 XLM) OR types a **custom amount**
5. Clicks **Send** — Freighter popup appears to sign the transaction
6. Transaction is submitted to the Stellar Testnet network
7. Success message shows the transaction hash with a link to Stellar Explorer

---

## 🔑 Configuration

To use your own wallet address as the recipient, open `src/App.jsx` and replace:

```js
const MY_TIP_JAR_ADDRESS = "YOUR_TESTNET_PUBLIC_KEY_HERE";
```

> ⚠️ This project uses **Testnet only**. Do NOT use real/Mainnet keys.

---

## ❗ Top 3 Problems I Faced & Solutions

---

### 🔴 Problem 1: `signTransaction()` Returning an Object Instead of a String

**What happened:**  
The `@stellar/freighter-api` newer versions changed the return type of `signTransaction()`.  
Old versions returned a plain XDR string. Newer versions return an **object** like:
```js
{ signedTxXdr: "AAAAAgAAAA..." }
```
This caused the app to crash when trying to parse the transaction because it received `[object Object]` instead of a valid XDR string.

**Error seen:**
```
TypeError: Cannot read properties of undefined
```

**Solution:**  
Handle both old and new return formats safely:
```js
const signedXdr =
  typeof signResult === "string"
    ? signResult
    : signResult?.signedTxXdr ?? signResult;
```

---

### 🔴 Problem 2: `requestAccess()` Not Returning a Plain Public Key String

**What happened:**  
`requestAccess()` from Freighter used to return a plain public key string like `"GABC..."`.  
In newer versions it returns an **object**:
```js
{ address: "GABC...", network: "TESTNET" }
```
Calling `.slice()` directly on the object caused a blank or broken wallet display.

**Error seen:**
```
TypeError: pubKey.slice is not a function
```

**Solution:**  
Extract the key safely from whichever format is returned:
```js
const pubKey =
  typeof result === "string"
    ? result
    : result?.address ?? result?.publicKey ?? null;
```

---

### 🔴 Problem 3: `signTransaction()` Second Argument Format Was Wrong

**What happened:**  
The old code passed `"TESTNET"` as a plain string for the network:
```js
await signTransaction(transaction.toXDR(), "TESTNET");  // ❌ Old / wrong
```
Newer versions of Freighter require an **options object** with `networkPassphrase`:
```js
await signTransaction(transaction.toXDR(), {
  networkPassphrase: StellarSdk.Networks.TESTNET   // ✅ Correct
});
```
Without this fix, Freighter either rejects the request or signs on the wrong network.

**Solution:**  
Always pass the second argument as an object with the full network passphrase.

---

## 📸 Screenshots


| 1 | **Home screen** — app loaded with QR code visible | Before connecting wallet |
<img width="748" height="460" alt="Before connecting wallet" src="https://github.com/user-attachments/assets/cf5ef8f6-4483-4c5b-b61c-595118765ed0" />

| 2 | **Freighter connect popup** — the extension asking for permission | After clicking "Connect Freighter Wallet" |
<img width="937" height="485" alt="connection request" src="https://github.com/user-attachments/assets/72b1e06b-d960-4082-acdd-86b17320fe37" />


| 3 | **Connected dashboard** — showing wallet address, balance, tip buttons + custom input | After wallet is connected |<img width="689" height="466" alt="After wallet is connected" src="https://github.com/user-attachments/assets/ffc6372a-3c98-4689-8d72-44b7b180cebe" />


| 4 | **Freighter sign popup** — asking to approve the transaction | After clicking Send |
<img width="818" height="484" alt="the transactionAfter clicking Send" src="https://github.com/user-attachments/assets/ab405526-c116-4a0a-b167-0629d35e739f" />


| 5 | **Success message** — green status box with transaction hash | After transaction is confirmed |<img width="637" height="427" alt="After transaction is confirmed" src="https://github.com/user-attachments/assets/3a6bae53-04e2-48ae-a9de-ea7a14fdcc1e" />


| 6 | **Stellar Explorer page** — the transaction detail page | Open the "View on Stellar Explorer" link |<img width="899" height="409" alt="the transaction detail page" src="https://github.com/user-attachments/assets/e7868794-f488-46ba-97b1-d79984c09ca7" />

---

## 🌐 Useful Links

- [Stellar Testnet Faucet](https://laboratory.stellar.org/#account-creator?network=test) — Get free testnet XLM
- [Stellar Expert Explorer (Testnet)](https://stellar.expert/explorer/testnet) — View your transactions
- [Freighter Wallet](https://freighter.app) — Browser wallet extension
- [Stellar SDK Docs](https://stellar.github.io/js-stellar-sdk/) — Official SDK reference

---

## 📝 Notes

- This project runs on **Stellar Testnet** — all transactions use fake/test XLM with no real value
- Freighter must be installed as a browser extension for wallet features to work
- The QR code works with any **SEP-0007 compatible** Stellar mobile wallet

---

