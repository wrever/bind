# Bind — Genesis / Stellar Unlocked

**Updated:** 2026-10-25  
**Public app:** https://bind-beta.vercel.app  
**Why this track:** [`UNLOCKED.md`](./UNLOCKED.md)

## Entry

| Field | Value |
|-------|-------|
| Category | **Genesis** |
| Track | **Stellar Unlocked** (not Composed) |
| Product | **Bind** — DeFi deposit insurance; clawback = claims rail |
| Repo | https://github.com/wrever/bind (**public**) |

## Official requirements checklist

| Requirement | Status | Where |
|-------------|--------|-------|
| Public GitHub | **Done** | https://github.com/wrever/bind |
| README | Done | [`README.md`](../README.md) |
| Architecture + Stellar use | Done | [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`UNLOCKED.md`](./UNLOCKED.md) |
| Live demo URL | **Done** | https://bind-beta.vercel.app `/en/live` `/en/por` |
| Video walkthrough | **Still add Loom to form** | script below |
| On-chain evidence | Done | [`EVIDENCE.md`](./EVIDENCE.md) — vault **CDGNKK…** |
| AI tooling disclosure | Done | [`AI_ATTRIBUTION.md`](./AI_ATTRIBUTION.md) |

## Pitch (say this)

1. **Problem:** Stellar settles fast with no chargeback — protocols eat in-transit theft.  
2. **Product:** Bind is insurance protocols buy; users get a short protected window before free exit.  
3. **Unlocked:** Stellar already has clawback + Soroban. We use them as the **claims rail + policy vault** — COVER `AUTH_CLAWBACK_ENABLED` + live vault `CDGNKK…`.  
4. **Not Composed:** we are not gluing two ecosystem apps; we are pushing core protocol features into insurance.

## Demo (≈3 min)

1. Landing — insurance one-liner  
2. **`/en/live`** — Freighter Testnet → trustline → Get TUSDC → deposit → transfer → explorer  
3. Dispute / Approve (ops) **or** wait → settle → unwrap  
4. **`/en/por`** — `fullyBacked` + COVER clawback evidence  
5. Optional: `/en/demo` — say **“simulator only”**

### Loom script (≈2–3 min live rail)

1. Open https://bind-beta.vercel.app — “insurance for DeFi deposits”  
2. `/en/live` → Freighter → real vault tx  
3. `/en/por` PoR + COVER  
4. Explicit: `/demo` = simulator; `/live` = real vault  


## Known limits (say out loud — removes doubt)

- Single arbiter for resolve (multisig planned).  
- Sessions API ≠ vault (dual-track).  
- TUSDC stand-in for Circle USDC.  
- Tier-1 cover is on-rail only.

## Out of scope

Mainnet, lending/yield, merchant checkout, Chainlink-as-core, claiming Composed.
