# Bind

**Updated:** 2026-10-25

**DeFi protocol insurance on Stellar.**

Protocols (Blend-like) **contract Bind**; their users get Protected Deposit — policy window → claim or settle → unwrap.  
Claims execution may use clawback L1 under the hood (Unlocked); the product is **insurance for protocols**, not “a clawback app.”

| Field | Value |
|-------|-------|
| Product | **Bind** |
| Category / track | **Genesis** · **Stellar Unlocked** |
| Repo | https://github.com/wrever/bind |
| Business model | [`docs/BIND_BUSINESS.md`](./docs/BIND_BUSINESS.md) |
| Cover schedule | [`docs/COVER_SCHEDULE.md`](./docs/COVER_SCHEDULE.md) |
| Terms (demo) | [`docs/TOS.md`](./docs/TOS.md) |
| Architecture | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |
| On-chain evidence | [`docs/EVIDENCE.md`](./docs/EVIDENCE.md) |

## Problem

Stellar settles in seconds with **no chargeback**. Protocols and wallets absorb phishing / mis-sign risk while value moves.

## Solution

**Bind** cover: unsettled policy window `T`, transparent claims, PoR, Exit Pool, Safe Deposit adapter for money markets.  
**Not covered in v1:** partner smart-contract exploits, oracles, liquidations, bad debt.

## Setup

```bash
npm install
cp .env.example .env.local   # optional Supabase
npm run dev                  # http://127.0.0.1:3847
```

### Environment variables

| Var | Required | Purpose |
|-----|----------|---------|
| `KEEL_POR_SECRET` | no | HMAC key for signed PoR |
| `NEXT_PUBLIC_SUPABASE_URL` | no | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | no | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Server persistence |

### Tests

```bash
npm run test:engine
npm run test:persist   # needs dev server + .env.local
npm run build
```

## Demo

| URL | What |
|-----|------|
| `/demo` | Cover console |
| `/ops` | Claims console |
| `/cover` | Cover schedule |
| `/integrate` | Partner + Safe Deposit |
| `/api/v1/network` | Testnet IDs |

```bash
npm run demo:hackathon
```

## License

Private until published / hackathon rules allow public release.
