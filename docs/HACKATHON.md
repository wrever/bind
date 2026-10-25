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
npm run dev   # then open /demo and /ops
```

1. Deposit → covered credit  
2. Transfer → unsettled policy  
3. Claim approve → **L1 clawback** + remint  
4. PoR fully backed  
5. Exit Pool path  

## Out of scope

Mainnet, lending/yield, merchant checkout, Chainlink-as-core, Freighter polish.
