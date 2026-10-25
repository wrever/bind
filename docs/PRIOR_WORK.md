# Prior work vs built during the event

**Updated:** 2026-10-25  
**Cutoff for this disclosure:** work **before 2026-10-24** vs **on/after 2026-10-24–25** (hackathon submission slice).

---

## On-chain contracts — dates (Stellar Expert `created`)

| Artifact | Contract / ID | Created (UTC) | Status for submission |
|----------|---------------|---------------|------------------------|
| **Prior vault (retired)** | [`CCQEAW5T6LFIANNOYFVIATYYXBEOERAXGCGRLLSHBQDU6XSCCJCOHL5J`](https://stellar.expert/explorer/testnet/contract/CCQEAW5T6LFIANNOYFVIATYYXBEOERAXGCGRLLSHBQDU6XSCCJCOHL5J) | **2026-10-18** 02:27 | **Not** the demo vault. Early testnet scaffold only. |
| **Submission vault (LIVE)** | [`CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ`](https://stellar.expert/explorer/testnet/contract/CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ) | **2026-10-25** 21:10 | Canonical. Redeployed with `credits` / `lots_of`. |
| TUSDC SAC (stand-in) | [`CBTMLE4GB2JGXPW4IQKK3XHFDRQMTSOI2IQ4DG5REP4WPWRD54GTMYKO`](https://stellar.expert/explorer/testnet/contract/CBTMLE4GB2JGXPW4IQKK3XHFDRQMTSOI2IQ4DG5REP4WPWRD54GTMYKO) | **2026-10-25** 21:10 | Paired with submission vault. |
| COVER SAC (Unlocked rail) | [`CAZGFSWXBWZIOZGRV42GXEKLZTP7MCJ74LVJZ6UYLHAOVHT52NMNP5Z2`](https://stellar.expert/explorer/testnet/contract/CAZGFSWXBWZIOZGRV42GXEKLZTP7MCJ74LVJZ6UYLHAOVHT52NMNP5Z2) | **2026-10-25** 11:17 | Claims clawback smoke. |

Machine-readable live addresses: [`testnet.addresses.json`](./testnet.addresses.json) (`deployedAt: 2026-10-25T21:12:16Z`).  
Retired prior vault is listed there under `retiredPrior` for auditors.

**Do not** point judges / Freighter `/live` / PoR UI at `CCQEAW…`. That ID is prior work only.

---

## Prior / early foundation (before 24 Oct 2026)

- Product thesis: recoverable / covered rails on Stellar (vision docs, dispute policy drafts).
- Off-chain settled/unsettled engine, demo UI, partner HTTP API, SDK surface.
- Soroban vault **scaffold** + local Rust tests; early private codebase.
- **Testnet vault `CCQEAW…` deployed 2026-10-18** — early smoke only; **superseded** by 2026-10-25 redeploy.

## Built / hardened for this hackathon submission (24–25 Oct 2026)

- Product framing: DeFi **security insurance** (cover / retention / claim); clawback = claims ops only.
- Genesis + Stellar Unlocked pack (`HACKATHON.md`, architecture, evidence).
- **New testnet vault `CDGNKK…` (2026-10-25)** + TUSDC SAC same day; views `credits` / `lots_of`.
- COVER issuer path with `AUTH_CLAWBACK_ENABLED` + clawback/remint smoke (2026-10-25).
- Dual-track UI: `/demo` simulator · `/live` Freighter (faucet, exit, dispute, ops resolve) · `/por`.
- DocsSite + `/llms.txt`; `testnet:smoke` + `testnet:e2e` green on the **new** vault.
- Ops: signed PoR demo, rate limits, roles, Supabase schema wiring, submission docs.

Judges should treat **`CDGNKK…` + COVER (25 Oct)** as the on-chain submission evidence.  
`CCQEAW…` (18 Oct) must be disclosed as prior and is **not** the live product address.
