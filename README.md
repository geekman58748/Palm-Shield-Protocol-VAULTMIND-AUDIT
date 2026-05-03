# Palm Shield Protocol-V2 [SNS + Audit 209]
### *The Identity First Security Protocol for the Solana Network State*
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Devnet--Beta-blueviolet)](https://solana.com/)
[![Built with Anchor](https://img.shields.io/badge/Framework-Anchor-orange)](https://www.anchor-lang.com/)

Audit 209 is a core evolution of the PalmShield Protocol, engineered to bridge the critical gap between anonymous on chain activity and sovereign reputation. By utilizing **SNS (.sol)** as the primary identity primitive, we have built a Sybil resistant security layer that transforms standard participants into "Sentinels."

---

### 🛡️ The Innovation: Non Linear Audit Randomization

To ensure the system remains ungameable, Audit 209 introduces an Onchain Identity Randomized Verification Mapping. For every DAO account, audit requirements are non linear, localized, and unique.

#### **The Logic**
An audit sequence identified as "No. 5" on one account may manifest as **"Audit 209"** on another. This "Moving Target" approach ensures that security verification is never a static hurdle.

#### The Goal: Anti Template Defense
*   **Prevent Template Attacks:** Stops bad actors from sharing answers or exploiting fixed sequences across multiple bot accounts.
*   **Localized Verification:** By anchoring the audit path to a specific SNS identity, we ensure that every Sentinel’s reputation is earned through unique, non-replicable verification.
*   **Sybil Resistance:** Elevates the cost of attack by requiring unique proof-of-work for every individual identity.

> **"Millions will be lost. Millions will be paid to save millions."**

Palm Shield is a decentralized, community driven threat intelligence protocol. It turns the "dirty work" of on chain forensics into an incentivized circular economy, providing real time security as a service for the Solana ecosystem.

---

## ⚡ The Vision
In April 2026 alone, DeFi exploits have drained over **$600M** from protocols. Static audits are no longer enough. Palm Shield introduces an **active, agentic security layer** that regulates conduct, not code.

By bridging the gap between independent security researchers (Hunters) and protocols, we've built a system where the "Lazarus style" exit ramps are closed before the first off ramp transaction hits a CEX.

---

## 🛠 Technical Architecture

Palm Shield operates on a **Stake → Verify → Payout** loop:

1.  **Hunter Submission:** Researchers identify malicious clusters or "Bundle Trails" and submit them with a **$PUSD** stake (The Honesty Bond).
2.  **DAO Consensus:** A decentralized panel of technical auditors reviews the evidence. A threshold of 5 verified votes triggers the smart contract.
3.  **Vault Execution:** The verified threat is pushed to our Global Registry API, and the Hunter is instantly credited from the **Palm Shield Vault**.

## 🚀 Product Features

* **On-Chain Threat Registry**: A real-time, queryable database of malicious actors, secured by Solana PDAs.
* **Incentivized OSINT**: High yield bounties for security researchers, audited by the DAO and paid in **$PUSD**.
* **Security-as-a-Service API**: Plug-and-play protection for DEXs to intercept "drainers" at the UI/UX level.
* **Exit-Ramp Forensics**: Detailed "Bundle Trail" reports designed for CEX compliance and threat mitigation.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Smart Contracts** | Anchor / Rust on Solana Devnet |
| **On-Chain Voting** | Program-derived vote records (PDAs) |
| **Token Flow** | $PUSD SPL token staking and payout flow |
| **Backend** | Supabase PostgreSQL, Storage, Realtime, Edge Functions |
| **Frontend** | Lightweight HTML/CSS/JavaScript dashboard |
| **API** | Supabase Edge Function wallet-screening API |
| **Wallet** | Phantom / Solana wallet provider |
| **Dao Identity Verification** | SNS.id (Solana Name Service) |

---

## 📥 Quick Start

### Prerequisites
* **Solana CLI**: `1.18.x`
* **Anchor CLI**: `0.29.0`
* **Node.js**: `20.x`
* **Rust**: `1.75+`

## Live Demo
- Dashboard:  [Video](https://www.youtube.com/watch?v=M2loIqHU8Gg)
- Dashboard:  [Palm Shield Dashboard x SNS](https://palm-shield-protocol.netlify.app/sns)
- Screening API: `https://iffyvycwlhgnsqotlckv.supabase.co/functions/v1/psp-screen`
- Solana Program: `https://solscan.io/account/AcksH6RgonJwV52Zd59GmxdXUJAMvdU1B3mq8BAEu3bm?cluster=devnet`
