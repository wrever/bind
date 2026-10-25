# On-chain evidence (Stellar Testnet)

**Updated:** 2026-10-25  
**Submission vault created:** 2026-10-25 21:10 UTC (not the 18 Oct prior vault).

## Policy vault (LIVE — use this)

| Item | Value |
|------|-------|
| Contract | [`CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ`](https://stellar.expert/explorer/testnet/contract/CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ) |
| Created | **2026-10-25** 21:10:52 UTC |
| `deployedAt` (JSON) | `2026-10-25T21:12:16Z` |
| Smoke | deposit → transfer → dispute/resolve → exit → `por().fully_backed` |
| E2E | `npm run testnet:e2e` |

Reproduce:

```bash
npm run testnet:smoke
npm run testnet:e2e   # needs scripts/sync-testnet-env.sh
```

## Retired prior vault (disclose only — do not demo)

| Item | Value |
|------|-------|
| Contract | [`CCQEAW5T6LFIANNOYFVIATYYXBEOERAXGCGRLLSHBQDU6XSCCJCOHL5J`](https://stellar.expert/explorer/testnet/contract/CCQEAW5T6LFIANNOYFVIATYYXBEOERAXGCGRLLSHBQDU6XSCCJCOHL5J) |
| Created | **2026-10-18** 02:27:47 UTC |
| Role | Early scaffold / prior work — superseded 2026-10-25 |

Full disclosure: [`PRIOR_WORK.md`](./PRIOR_WORK.md).

## COVER claims rail (Unlocked)

| Item | Value |
|------|-------|
| Asset | `COVER:GCIYYORXS2E3LVSEZTVTVUNQQVX5YIJFNQFJCGR73GY234OBU3MPYC4P` |
| Flags | `AUTH_REQUIRED`, `AUTH_REVOCABLE`, `AUTH_CLAWBACK_ENABLED` |
| SAC | [`CAZGFSWXBWZIOZGRV42GXEKLZTP7MCJ74LVJZ6UYLHAOVHT52NMNP5Z2`](https://stellar.expert/explorer/testnet/contract/CAZGFSWXBWZIOZGRV42GXEKLZTP7MCJ74LVJZ6UYLHAOVHT52NMNP5Z2) |
| Created | **2026-10-25** 11:17 UTC |
| Smoke | mint → **Classic clawback** → remint |

```bash
npm run testnet:cover
```

Full dump: [`testnet.addresses.json`](./testnet.addresses.json).
