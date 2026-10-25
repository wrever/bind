# Bind — Testnet (functional product)

**Updated:** 2026-10-25
**Status: LIVE** on Stellar Testnet · Genesis / **Stellar Unlocked**

## Essential path (done)

| Step | Result |
|------|--------|
| Vault WASM | built (`npm run build:vault`) + `credits` / `lots_of` views |
| TUSDC SAC (USDC stand-in) | `CBTMLE4GB2JGXPW4IQKK3XHFDRQMTSOI2IQ4DG5REP4WPWRD54GTMYKO` |
| `keel-vault` deployed + initialized | [`CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ`](https://stellar.expert/explorer/testnet/contract/CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ) |
| Exit pool inventory funded | yes |
| Smoke: deposit → transfer → dispute/recover → exit → peg | **pass** |

Machine-readable: [`docs/testnet.addresses.json`](./testnet.addresses.json)

## Live rail secrets (local only)

```bash
npm run testnet:up
bash scripts/sync-testnet-env.sh   # writes BIND_* into .env.local
npm run testnet:smoke
npm run testnet:e2e                # needs BIND_ALICE_SECRET + issuer
```

Env keys (see `.env.example`): `BIND_TUSDC_ISSUER_SECRET`, `BIND_ARBITER_SECRET`, `BIND_OPS_TOKEN`, `NEXT_PUBLIC_BIND_OPS_TOKEN`.

Faucet + resolve: `POST /api/v1/chain/faucet` and `POST /api/v1/chain/tx/resolve` with `Authorization: Bearer $BIND_OPS_TOKEN`.

## Addresses

| Artefacto | Value |
|-----------|-------|
| Network / RPC | `testnet` · `https://soroban-testnet.stellar.org` |
| Admin / TUSDC issuer | `GCNPSYT4C5DOYXHYPFZ6ZJJPE7ER7I2Y63UJKYDKRD6GSA3NRBE4KD7X` |
| Arbiter | `GDPQVHY2VUAOIZO2FTHELDVEXCBY5GGBHSVKDB5EDS7LLOMQ5OJN4PID` |
| **keel-vault** | [`CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ`](https://stellar.expert/explorer/testnet/contract/CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ) |
| **TUSDC SAC** | [`CBTMLE4GB2JGXPW4IQKK3XHFDRQMTSOI2IQ4DG5REP4WPWRD54GTMYKO`](https://stellar.expert/explorer/testnet/contract/CBTMLE4GB2JGXPW4IQKK3XHFDRQMTSOI2IQ4DG5REP4WPWRD54GTMYKO) |
| Window / exit fee | `60`s / `30` bps |

Local identities (secrets never in git): `keel-admin`, `keel-arbiter`, `keel-alice`, `keel-bob`.
