# Bind

**Updated:** 2026-10-25

**DeFi deposit insurance on Stellar** · Genesis · **Stellar Unlocked**

Protocols **contract Bind**; users get a timed protected window before free exit.  
**Unlocked thesis:** Stellar clawback + Soroban policy vault = claims rail + retention — not a Composed mashup. See [`docs/UNLOCKED.md`](./docs/UNLOCKED.md).  
Product language = insurance; clawback stays claims ops.

| Field | Value |
|-------|-------|
| Product | **Bind** |
| Category / track | **Genesis** · **Stellar Unlocked** |
| Repo | https://github.com/wrever/bind (**public for submission**) |
| Live demo | https://bind-beta.vercel.app |
| Why Unlocked | [`docs/UNLOCKED.md`](./docs/UNLOCKED.md) |
| Live vault (25 Oct) | [`docs/EVIDENCE.md`](./docs/EVIDENCE.md) — **not** the 18 Oct prior vault |
| Prior work | [`docs/PRIOR_WORK.md`](./docs/PRIOR_WORK.md) |
| AI tooling | [`docs/AI_ATTRIBUTION.md`](./docs/AI_ATTRIBUTION.md) |
| Business model | [`docs/BIND_BUSINESS.md`](./docs/BIND_BUSINESS.md) |
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

## Demo (dual-track)

| URL | What | Truth |
|-----|------|-------|
| `/demo` | Policy simulator | **Not** custody / not the vault |
| `/live` | Freighter → vault (faucet TUSDC, deposit…dispute) | **Testnet** vault `CDGNKK…` |
| `/por` | Local + live `por()` + COVER evidence | On-chain readable |
| `/docs` | Product docs + search | EN/ES/PT |
| `/api/v1/chain/por` | Live PoR JSON | Must return vault `CDGNKK…` |

```bash
npm run demo:hackathon
npm run testnet:smoke
```

## License

MIT — see [`LICENSE`](./LICENSE).
