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
| Public GitHub with source | **Must flip public** before submit | https://github.com/wrever/bind |
| README: summary, problem, setup, env, demo | Done | [`README.md`](../README.md) |
| Architecture: how Stellar is used, IDs, APIs | Done | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| Working live demo **or** video walkthrough | App ready; **need** Vercel = `main` + **Loom video** in form | `/live`, `/por` |
| On-chain Testnet evidence | Done (vault **25 Oct** `CDGNKK…`) | [`EVIDENCE.md`](./EVIDENCE.md) |
| Disclose prior work vs event work | Done — `CCQEAW…` = **18 Oct prior**; live = **25 Oct** | [`PRIOR_WORK.md`](./PRIOR_WORK.md) |
| Disclose AI tooling | Done | [`AI_ATTRIBUTION.md`](./AI_ATTRIBUTION.md) |

## Pitch

- **Problem:** Instant finality, no chargeback — partners eat in-transit theft risk.  
- **User:** Wallet / neobank / remittance (B2B).  
- **Value:** Opt-in cover window, transparent claims, PoR, Exit Pool.  
- **Unlocked:** `AUTH_CLAWBACK_ENABLED` COVER asset + Soroban policy vault.

## Demo (≈3 min)

```bash
npm run testnet:sync-env   # once: BIND_* into .env.local
npm run demo:hackathon
npm run dev   # :3847 → open /en/…
```

1. **Landing** — product one-liner  
2. **`/demo`** — policy engine: deposit → hold → settle/claim (say “simulator”)  
3. **`/live`** — Freighter: trustline → Get TUSDC → deposit → transfer → dispute → Approve (ops) **or** wait → settle → unwrap; Exit optional  
4. **`/por`** — live RPC `por()` + COVER clawback evidence  
5. **Terminal** — `npm run testnet:smoke` / `npm run testnet:e2e` for hashes  

Vault + TUSDC: see [`testnet.addresses.json`](./testnet.addresses.json) / [`TESTNET.md`](./TESTNET.md).

### Loom script (≈2–3 min) — still required for form

1. Landing one-liner → open `/en/live`  
2. Connect Freighter Testnet → Add trustline → Get TUSDC → deposit → transfer → explorer tx  
3. `/en/por` fully backed + COVER note  
4. Say clearly: `/demo` is the policy simulator; `/live` is the real vault  

## Known limits (say out loud)

- Claims `resolve` uses a single arbiter key (multisig planned).  
- `/api/v1/sessions` is **not** wired to the vault (dual-track).  
- Prior vault `CCQEAW…` (18 Oct) is retired — demo only `CDGNKK…` (25 Oct).

## Out of scope

Mainnet, lending/yield, merchant checkout, Chainlink-as-core, Circle USDC (TUSDC stand-in).
