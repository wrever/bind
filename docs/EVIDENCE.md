# On-chain evidence (Stellar Testnet)

**Updated:** 2026-10-25 (redeploy with `credits` / `lots_of`)

## Policy vault

| Item | Value |
|------|-------|
| Contract | [`CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ`](https://stellar.expert/explorer/testnet/contract/CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ) |
| Smoke | deposit → transfer → dispute/resolve → exit → `por().fully_backed` |
| E2E | `npm run testnet:e2e` (mint → dispute/resolve → settle/unwrap) |

Reproduce:

```bash
npm run testnet:smoke
npm run testnet:e2e   # needs scripts/sync-testnet-env.sh
```

## COVER claims rail (Unlocked)

| Item | Value |
|------|-------|
| Asset | `COVER:GCIYYORXS2E3LVSEZTVTVUNQQVX5YIJFNQFJCGR73GY234OBU3MPYC4P` |
| Flags | `AUTH_REQUIRED`, `AUTH_REVOCABLE`, `AUTH_CLAWBACK_ENABLED` |
| SAC | [`CAZGFSWXBWZIOZGRV42GXEKLZTP7MCJ74LVJZ6UYLHAOVHT52NMNP5Z2`](https://stellar.expert/explorer/testnet/contract/CAZGFSWXBWZIOZGRV42GXEKLZTP7MCJ74LVJZ6UYLHAOVHT52NMNP5Z2) |
| Smoke | mint → **Classic clawback** → remint (holder bal `0`, claimant `100000000`) |

Reproduce:

```bash
npm run testnet:cover
```

Full machine-readable dump: [`testnet.addresses.json`](./testnet.addresses.json).
