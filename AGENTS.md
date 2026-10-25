# Agents working on Bind

Human product owner: **wrever**. AI-assisted implementation — see [`docs/AI_ATTRIBUTION.md`](docs/AI_ATTRIBUTION.md).

## Vision lock

Read `docs/VISION.md` and `docs/BIND_BUSINESS.md` before large changes.  
**Bind** is **DeFi security insurance** on Stellar — protocols contract Bind; users get retention-window protection (e.g. 12h without KYC).  
Not a payment gateway, remittance app, consumer wallet, or money market.  
Language: insurance/cover/retention/policy/premium/claim; clawback = claims ops (Unlocked), never the storefront.  
Tier 1 = retention + block unwrap/swap + claim on Bind rail. Tier 3 incident cover needs underwriting capital — do not sell as “clawback recovers any LP drain.”  
Brand: **Bind** (Keel retired; code paths may still say `keel`).

## Do

- Strengthen settled/unsettled engine, API, SDK, PoR, dispute/claims policy
- Keep partner-integrate path first-class (`/integrate`, `/api/v1`)
- Preserve peg invariant `vault ≥ supply`
- Prefer composing Stellar building blocks (USDC, clawback, wallets kit)
- Design for **protocol partners** (Blend-like) + consumer protection via partners
- Document retention / KYC Fast Lane / Incident Cover tiers honestly ([`RETENTION_SECURITY.md`](docs/RETENTION_SECURITY.md))

## Do not

- Build merchant checkout / SEP-24 UI as the product core
- Rebrand cover credits as “our stablecoin”
- Add lending/yield/tokenomics as primary scope
- Promise clawback recovers USDC already off the Bind rail / any LP exploit without Tier 3 capital
- Weaken unwrap-only-settled or dispute transparency

## Commands

```bash
npm run dev          # :3847
npm run test:engine
npm run test:api     # needs dev server or next start
npm run test:persist
npm run build
```

## Docs map

- `docs/VISION.md` — north star (Bind)
- `docs/BIND_BUSINESS.md` — business model + legal product frame
- `docs/PITCH_FAQ.md` — one-liner + objection handling
- `docs/MEMORIA.md` — what is actually ready
- `docs/ROADMAP.md` — phased plan
- `docs/CLAW_PRODUCT.md` — legacy deep dive (align to Bind)
- `docs/DISPUTE_POLICY.md` / `THREAT_MODEL.md`

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
