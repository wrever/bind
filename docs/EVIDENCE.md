# On-chain evidence (Stellar Testnet)

**Updated:** 2026-10-26  
**Submission vault created:** 2026-10-25 21:10 UTC (not the 18 Oct prior vault).  
**Last signed e2e:** 2026-10-26 (hashes below + mirrored in [`README.md`](../README.md)).

## Policy vault (LIVE — use this)

| Item | Value |
|------|-------|
| Contract | [`CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ`](https://stellar.expert/explorer/testnet/contract/CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ) |
| Created | **2026-10-25** 21:10:52 UTC |
| `deployedAt` (JSON) | `2026-10-25T21:12:16Z` |
| Live PoR | https://bind-beta.vercel.app/api/v1/chain/por |
| Smoke | deposit / transfer / settle prepare + `por().fully_backed` |
| E2E | `npm run testnet:e2e` |

### Latest e2e transaction links

| Step | Tx |
|------|----|
| Mint | https://stellar.expert/explorer/testnet/tx/3a41f41298e7ba86c4fdd2bb1a98284417e57b5241571d535b6f775440b03ecc |
| Deposit | https://stellar.expert/explorer/testnet/tx/5bc631a213acc70a25fcd89649932708ea1d36582da3f6aa157d0d0c9634c71a |
| Transfer (lot open) | https://stellar.expert/explorer/testnet/tx/c5ed384611af02f4d3043fcf3a899730d0b56c175f706fbab61612e65d3dc254 |
| Dispute | https://stellar.expert/explorer/testnet/tx/ef8bad73d0bf04c5286a278b57c0c4edaede4cced407292a4c0b14e52748765e |
| Resolve approve | https://stellar.expert/explorer/testnet/tx/5a4042262c99e30fb678dfa7077091ffc9a520de9281b66dbe4241169786fbca |
| Transfer | https://stellar.expert/explorer/testnet/tx/e794f11794ed895f5e77ba9d22bed42cc04ef838644ba746a4b68bbc54e253ce |
| Settle | https://stellar.expert/explorer/testnet/tx/092d2d3926b78613a511756a9b6d98e2e34638194e1665a45517ab67db23e79a |
| Unwrap | https://stellar.expert/explorer/testnet/tx/62e6b8a97a45d01d0171585ee43ea901fec1f3e6e777125da66e01b9a7236675 |

```bash
bash scripts/sync-testnet-env.sh
npm run testnet:smoke
npm run testnet:e2e
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
| Issuer | [`GCIYYORXS2E3LVSEZTVTVUNQQVX5YIJFNQFJCGR73GY234OBU3MPYC4P`](https://stellar.expert/explorer/testnet/account/GCIYYORXS2E3LVSEZTVTVUNQQVX5YIJFNQFJCGR73GY234OBU3MPYC4P) |
| Created | **2026-10-25** 11:17 UTC |
| Smoke | mint → **Classic clawback** → remint |

```bash
npm run testnet:cover
```

Full dump: [`testnet.addresses.json`](./testnet.addresses.json).
