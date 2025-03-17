Here’s the README for **@gofundmeme/sdk-frontend**:

---

# 🚀 GoFundMeme Frontend SDK (`@gofundmeme/sdk-frontend`)

[![Website](https://img.shields.io/badge/Website-GoFundMeme.io-blue?style=for-the-badge)](https://www.gofundmeme.io)  
[![X (Twitter)](https://img.shields.io/badge/X-@GoFundMemes-black?style=for-the-badge)](https://x.com/GoFundMemes)  
[![Telegram](https://img.shields.io/badge/Telegram-Join%20Chat-blue?style=for-the-badge)](https://t.me/gofundmeme)  
[![NPM](https://img.shields.io/npm/v/@gofundmeme/sdk-frontend?color=red&label=NPM&style=for-the-badge)](https://www.npmjs.com/package/@gofundmeme/sdk-frontend)

## 🎉 What is `@gofundmeme/sdk-frontend`?

The **GoFundMeme Frontend SDK** is a lightweight version of the **GoFundMeme SDK**, optimized for frontend applications. It provides seamless integration with **Fair Launches, Bonding Curves, Swaps, and Claims**, without requiring backend-heavy dependencies.

## ✨ Key Features

✔️ Fetch and interact with **Fair Launch Pools**  
✔️ Execute **Swaps & Claims** from Bonding Curve Pools  
✔️ Query Market Data and Pool States  
✔️ Optimized for frontend apps (lighter, faster, and easier to integrate)

---

## 📌 Why Use `@gofundmeme/sdk-frontend` Instead of `@gofundmeme/sdk`?

The full **@gofundmeme/sdk** includes external dependencies like **Orca SDK, Raydium SDK, and Meteora SDK**, which can cause compatibility issues in frontend applications.

✅ Use `@gofundmeme/sdk-frontend` if:

- You **don’t need** **Harvesting** features.
- You **only need** Pool interactions, Swaps, and Claims.
- You want a **lighter, more frontend-friendly package**.

🚀 Need full functionality, including **Harvesting**?  
Use **[@gofundmeme/sdk](https://www.npmjs.com/package/@gofundmeme/sdk)** on your backend instead.

---

## 📦 Installation

Using **npm**:

```sh
npm install @gofundmeme/sdk-frontend @coral-xyz/anchor @solana/web3.js axios
```

Using **yarn**:

```sh
yarn add @gofundmeme/sdk-frontend @coral-xyz/anchor @solana/web3.js axios
```

---

## 🔧 Quick Start

### 1️⃣ Initialize the SDK

```typescript
import { Program } from "@coral-xyz/anchor";
import { initGoFundMemeSDK } from "@gofundmeme/sdk-frontend";

(async () => {
  const gfmSDK = await initGoFundMemeSDK(
    (idl, programId) => new Program(idl, programId, anchorProvider)
  );
})();
```

### 2️⃣ Fetch a Fair Launch Pool

```typescript
const mintAddress = "YOUR_TOKEN_MINT";
const pool = await gfmSDK.pools.fairLaunch.fetchFairLaunchPool({
  mintB: mintAddress,
});
console.log("Fair Launch Pool:", pool);
```

### 3️⃣ Swap Tokens on a Bonding Curve

```typescript
import { Keypair } from "@solana/web3.js";
import Decimal from "decimal.js";

const payer = Keypair.generate(); // Replace with your actual signer

const { quote, transaction } = await gfmSDK.pools.bondingCurve.swap.buy({
  amountInUI: new Decimal(1.2), // Buy with 1.2 SOL
  funder: payer.publicKey,
  slippage: 1, // 1% slippage tolerance
});

// Sign and send transaction
transaction.sign(payer);
console.log("Swap Transaction:", transaction);
```

### 4️⃣ Subscribe to Pool State Updates

```typescript
const listener = gfmSDK.api.subscription.poolState.all("mainnet");
listener.subscription.subscribe((event) => {
  console.log("Pool State Update:", event);
});
```

---

## 📚 Full Documentation

For a complete guide, visit the official **GoFundMeme Developer Docs**:  
📖 **[GoFundMeme SDK Documentation](https://docs.gofundmeme.io/developers/gfm-for-builders)**

---

## 💬 Join the Community

💙 **Follow us on X (Twitter)**: [@GoFundMemes](https://x.com/GoFundMemes)  
💬 **Join the Telegram Chat**: [t.me/gofundmeme](https://t.me/gofundmeme)

🚀 Happy building with GoFundMeme!
