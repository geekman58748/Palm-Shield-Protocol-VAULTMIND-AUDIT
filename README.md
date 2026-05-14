# Palm Shield Protocol
### Adversarial Audit — VaultMind Colosseum Submission

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Devnet-blueviolet)](https://solana.com/)
[![Built with Anchor](https://img.shields.io/badge/Framework-Anchor-orange)](https://www.anchor-lang.com/)

> This repository is a controlled adversarial test environment submitted to the VaultMind 
> Colosseum security leaderboard. The programs contained here are **deliberately vulnerable** 
> and exist solely to evaluate VaultMind's detection capabilities against obfuscated exploit 
> patterns. Do not deploy or integrate any code from this repository.

---

## What is Vault Mind

Most scanner evaluations use clean code and verify that the tool returns no false positives.
This submission takes the opposite approach: deliberately seeding real, obfuscated 
vulnerabilities to test whether VaultMind catches threats that are designed not to be caught.

The hypothesis is simple, a security tool's value is determined not by what it finds in 
obvious code, but by what it finds when an attacker is actively trying to hide.

---

## Vulnerabilities Seeded

Each pattern below was implemented with obfuscation layered on top to simulate 
real world attack conditions rather than textbook examples.

### V-01 — Token Drain via Stealth CPI
**File:** `programs/palmshield/src/lib.rs`  
**Pattern:** A token transfer disguised as an internal reputation check. The malicious 
logic lives inside `verify_sentinel_reputation()`, a helper function that reads as 
an identity validation routine. The actual drain executes via `remaining_accounts`, 
keeping the malicious accounts out of the visible struct entirely.

**Detection challenge:** The function name, comments, and call site all suggest 
a benign security check. The CPI target and transfer amount are only visible 
inside the helper, one level of indirection away from the instruction handler.

### V-02 — Obfuscated Remote Execution (Edge Functions)
**File:** `supabase/functions/`  
**Pattern:** `eval(atob())` hooks embedded in backend edge functions, 
designed to execute under specific runtime conditions rather than on every call.

**Detection challenge:** Static analysis tools often miss conditional execution 
paths. The payload is base64-encoded and only resolves at runtime.

---

## What I'm Testing

| Question | Pass Criteria |
| :--- | :--- |
| Does VaultMind catch stealth CPIs? | V-01 flagged with correct root cause |
| Does it detect obfuscated remote exec? | V-02 flagged in edge function scan |
| Does indirection fool the scanner? | Helper-function logic traced back to call site |
| Are false negatives documented? | Missed patterns noted with explanation |

---

## Findings

*This section will be updated as VaultMind scan results come in.*

---

## Methodology Note

All vulnerable code was written and contained within this repository. 
No external systems, wallets, or individuals were targeted or put at risk. 
This is a closed adversarial test against a scanner, not a deployed program.

---

*Submitted by Maxx — VaultMind Colosseum, 2026*
