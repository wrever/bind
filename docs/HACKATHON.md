# Bind — Genesis / Stellar Unlocked

**Updated:** 2026-10-25

## Entry

| Field | Value |
|-------|-------|
| Category | **Genesis** |
| Track | **Stellar Unlocked** |
| Product | **Bind** — opt-in protocol/transfer cover on Stellar — clawback as claims rail |
| Repo | https://github.com/wrever/bind (**must be public** for submission) |

## Official requirements checklist

| Requirement | Status | Where |
|-------------|--------|-------|
| Public GitHub with source | **Repo ready** — set visibility public before submit | https://github.com/wrever/bind |
| README: summary, problem, setup, env, demo | Done | [`README.md`](../README.md) |
| Architecture: how Stellar is used, IDs, APIs | Done | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| Working live demo **or** video walkthrough | Local demo ready; **need** public URL or video link in form | `/demo`, `/ops` |
| On-chain Testnet evidence | Done | [`EVIDENCE.md`](./EVIDENCE.md) |
| Disclose prior work vs event work | Done | [`PRIOR_WORK.md`](./PRIOR_WORK.md) |

## Pitch

- **Problem:** Instant finality, no chargeback — partners eat in-transit theft risk.  
- **User:** Wallet / neobank / remittance (B2B).  
- **Value:** Opt-in cover window, transparent claims, PoR, Exit Pool.  
- **Unlocked:** `AUTH_CLAWBACK_ENABLED` COVER asset + Soroban policy vault.

## Demo (≈3 min)

```bash
npm run demo:hackathon
npm run dev   # :3847
```

1. **Landing** — product one-liner  
2. **`/demo`** — policy engine: deposit → hold → settle/claim (say “simulator”)  
3. **`/live`** — Freighter signs vault deposit/transfer on testnet (explorer tx)  
4. **`/por`** — live RPC `por()` + COVER clawback evidence  
5. **Terminal (optional)** — `npm run testnet:cover` for Unlocked clawback beat  

## Out of scope

Mainnet, lending/yield, merchant checkout, Chainlink-as-core, Circle USDC (TUSDC stand-in).
