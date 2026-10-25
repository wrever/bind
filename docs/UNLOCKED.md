# Why Bind is Stellar Unlocked (not Composed)

**Category:** Genesis  
**Track:** **Stellar Unlocked**  
**Live demo:** https://bind-beta.vercel.app  
**Vault (25 Oct):** see [`EVIDENCE.md`](./EVIDENCE.md)

## One sentence for judges

Stellar already ships **asset clawback** and **Soroban contracts**. Bind turns those into **DeFi deposit insurance**: a timed retention window on covered balances, then clawback-backed indemnity when a claim is approved — without asking users to “buy clawback.”

## Protocol features we unlock

| Stellar primitive | What Bind does with it |
|-------------------|------------------------|
| Classic asset flags `AUTH_CLAWBACK_ENABLED` | COVER claims rail: clawback from holder → remint to claimant (Unlocked smoke **2026-10-25**) |
| Stellar Asset Contracts (SAC) | TUSDC collateral + COVER as contract-callable assets |
| Soroban smart contract | Policy vault: deposit → unsettled window → settle / unwrap / exit / dispute / resolve / `por()` |
| Freighter (wallet) | Signs vault txs on `/live` — **UX**, not the product thesis |

This is **not** Stellar Composed: we do not combine two ecosystem products (anchor + agent wallet + x402, etc.) into a mashup. The breakthrough is **how** core issuance + clawback + Soroban are used for insurance.

## Dual-track honesty (no ambiguity)

| Surface | What it is | What it is not |
|---------|------------|----------------|
| `/demo` + `/api/v1/sessions` | Policy **simulator** | Custody / on-chain vault |
| `/live` + `/api/v1/chain/*` | **Real** testnet vault txs | The off-chain engine |
| `/por` | Live `por()` + COVER evidence | Fake marketing numbers |

Prior vault `CCQEAW…` (**18 Oct**) = early scaffold only. Submission vault = `CDGNKK…` (**25 Oct**). Details: [`PRIOR_WORK.md`](./PRIOR_WORK.md).

## Known limits (stated, not hidden)

- Claim **resolve** today uses a single arbiter key (multisig planned).
- Collateral on testnet is **TUSDC** (Circle USDC swap later).
- Off-rail drains after unwrap are **out of Tier-1 cover** (needs underwriting capital).

## Proof

```bash
curl -s https://bind-beta.vercel.app/api/v1/chain/por
npm run testnet:smoke
npm run testnet:e2e
npm run testnet:cover   # COVER clawback path
```
