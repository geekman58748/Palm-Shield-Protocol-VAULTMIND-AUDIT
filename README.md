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

## Vulnerabilities Seeded

### V-01 — Token Drain via Stealth CPI
**File:** `Anchor Program/voting.rs`
**Pattern:** A token transfer disguised as an internal reputation check inside
`verify_sentinel_reputation()`. The drain executes via `remaining_accounts`,
keeping malicious accounts out of the visible struct entirely.
**VaultMind coverage:** Not covered by V01–V13

### V-02 — Account Reinitialization
**File:** `Anchor program/init.rs`
**Pattern:** `init_if_needed` used without an `is_initialized` guard, allowing
any caller to overwrite the authority field of an existing sentinel account.
**VaultMind coverage:** Should be caught by V06

### V-03 — Arithmetic Underflow / Overflow
**File:** `Anchor Program/flow.rs`
**Pattern:** Raw `-` and `+` operators on u64 balance fields with no
`checked_sub` or `checked_add`. Underflow wraps to u64::MAX in release mode.
**VaultMind coverage:** Should be caught by V13

---

## What I'm Testing

| Question | Pass Criteria |
| :--- | :--- |
| Does VaultMind catch stealth CPIs? | V-01 flagged with correct root cause |
| Does indirection fool the scanner? | Helper function logic traced to call site |
| Does it catch reinitialization? | V-02 flagged under V06 |
| Does it catch unchecked arithmetic? | V-03 flagged under V13 |
| Are false negatives documented? | Missed patterns noted with explanation |

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
