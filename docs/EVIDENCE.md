# On-chain evidence (Stellar Testnet)

**Updated:** 2026-10-25

## Policy vault

| Item | Value |
|------|-------|
| Contract | [`CCQEAW5T6LFIANNOYFVIATYYXBEOERAXGCGRLLSHBQDU6XSCCJCOHL5J`](https://stellar.expert/explorer/testnet/contract/CCQEAW5T6LFIANNOYFVIATYYXBEOERAXGCGRLLSHBQDU6XSCCJCOHL5J) |
| Deploy tx | [`30d08e65218d424acf2a685d574ac9a949b3b62acdf6b0bb06503acb20282368`](https://stellar.expert/explorer/testnet/tx/30d08e65218d424acf2a685d574ac9a949b3b62acdf6b0bb06503acb20282368) |
| Smoke | deposit → transfer → dispute/resolve → exit → `por().fully_backed` |

Reproduce:

```bash
npm run testnet:smoke
# or
stellar contract invoke --id CCQEAW5T6LFIANNOYFVIATYYXBEOERAXGCGRLLSHBQDU6XSCCJCOHL5J \
  --source keel-admin --network testnet -- por
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
