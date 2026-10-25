# Prior work vs built during the event

**Updated:** 2026-10-25

## Prior / early foundation (before final submission slice)

- Product thesis: recoverable / covered rails on Stellar (vision docs, dispute policy).
- Off-chain engine (settled/unsettled), demo UI, partner API, SDK surface.
- Soroban vault scaffold + local tests; early Origin private codebase.

## Built / hardened for this hackathon submission

- **Product repositioning:** transfer **insurance** (cover/claim/pool); clawback as claims rail only.
- **Genesis + Stellar Unlocked** packaging (`HACKATHON.md`, pitch, architecture).
- **Testnet vault LIVE** with smoke (deposit/transfer/dispute/exit/PoR).
- **COVER issuer** with `AUTH_CLAWBACK_ENABLED` + end-to-end claim clawback smoke.
- Ops claims console, signed PoR, rate limits, roles, CI workflow.
- Supabase schema + optional persistence wiring for sessions/claim audit.
- Submission docs: architecture, on-chain evidence, README demo/setup.

Judges can compare git history on the public repo: early commits = foundation; later commits = Unlocked cover rail + insurance framing + submission pack.
