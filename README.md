# ⟐ MST Open Jar — Decentralized SME IPO Fractionalization Protocol

Built for the **MST Blockchain Buildathon 2026** with **Bridgekey Wallet** integration.

---

## 🎯 Executive Summary & Problem Solved
Small and Medium Enterprises (SMEs) are the lifeblood of industrial innovation and economic growth. However, SME Initial Public Offerings (IPOs) enforce rigid, high-ticket minimum bid lot sizes (typically **₹1,50,000 to ₹2,50,000+**), completely barring **90%+ of retail investors** from participating in high-growth listings.

**MST Open Jar** democratizes access to SME IPOs through decentralized, non-custodial smart contracts on the MST blockchain. Retail investors pool micro-investments of MST tokens (starting from as little as **1 fraction / 1,500 – 2,500 MST**) into an "Open Jar" syndicate to collectively acquire full SME IPO lots with zero allotment bias and automated on-chain returns distribution.


---

## 📜 Smart Contract Architecture

- **Deployed Contract Address**: `0xc743132Ae8e27B8F4dD2E0BF27925eC749f10062`
- **Network**: MST Blockchain (Chain ID: `1088` / `0x440`)
- **Key Functions**:
  - `buyFraction()`: Payable function enabling investors to buy fractions of the SME IPO lot with MST tokens.
  - `executeLotPurchase()`: Locks the jar pool and bids the full lot on exchange once 100% of target is pooled.
  - `distributeListingGains()`: Payable function where IPO listing day liquidation profits are deposited for fraction holders.
  - `claimReturns()`: Non-custodial payout function allowing fraction holders to withdraw their proportional profit share or claim 100% refund if not allotted.
  - `getPoolStatus()`: Returns `(_sold, _total, _price, _isSoldOut)` in a single call.
  - `userFractions(address)`: Tracks fractional ownership per investor wallet.

---

## 🚀 Core Features & Workflows

### 1. Global UI & Wallet Integration
- **Institutional FinTech Interface**: Bloomberg & Zerodha Kite inspired dark terminal aesthetics (`#070A11`), electric blue (`#00E5FF`) and emerald green (`#10B981`) accents, and responsive layout.
- **Bridgekey Wallet Integration**: Persistent top bar featuring "Connect Bridgekey Wallet" with truncated address (`0x742d...f44e`), network pill, and live MST balance.
- **Interactive Demo Simulator**: 1-click fallback demo mode loaded with **125,000 MST** for immediate evaluation without requiring external browser extensions.

### 2. SME IPO Discovery Dashboard
- Real-time **Market Ticker Tape** tracking MST/USD rate, SME index, 24h volume, and contract status.
- Grid of **IPO Jar Cards** displaying:
  - IPO Company Name & Sector tags (Defence, CleanTech, EV Mobility, DeepTech, Biopharma, AgriTech).
  - Total Lot Target (e.g. `2,50,000 MST`) & Minimum Entry (`1 Fraction`).
  - Dynamic progress bar showing % funded and fractions remaining.
  - **Dynamic State Badges**: `Funding Open`, `Target Reached (Locked)`, `Allotment Pending`, `Allotted`, `Refund Processing`.

### 3. Investment Flow ("The Open Jar")
- Modal drawer with full SME prospectus, price band, retail quota, and lead manager details.
- **Interactive Fractional Calculator**: adjust fraction count via input, range slider, or quick presets (+1, +2, +5, MAX).
- Real-time proportional lot ownership and estimated listing gains preview.
- **Automatic Target Lock**: when pool reaches 100%, investments are disabled with status *"Locked - Awaiting Allotment"*.

### 4. Post-Allotment & Settlement Dashboard ("My Portfolio")
- Comprehensive portfolio KPIs: Active Jars, Total Committed MST, Claimable Listing Gains, Pending Allotments.
- Position cards with automated state resolution:
  - **If Not Allotted**: "Claim Refund" button executes contract refund of 100% principal MST tokens.
  - **If Allotted**: Displays final sale value, listing gain percentage (+36.8%), user's proportional return, and "Withdraw Funds / Claim Returns" button.

### 5. Issuer & Judge Management Console
- Dedicated console to simulate or trigger the full smart contract lifecycle:
  1. Quick fill jar pool to 100% target.
  2. Call `executeLotPurchase()` to transition jar to "Allotted".
  3. Call `distributeListingGains()` to deposit custom profits and unlock investor claims.

---

## 💻 Tech Stack
- **Framework**: Next.js 14 (App Router) + React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom FinTech Glassmorphism
- **Web3**: Ethers.js v6 (Contract abstraction, RPC & Injected Signer)
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti celebration engine

---

## 🛠️ Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd mst-open-jar

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
