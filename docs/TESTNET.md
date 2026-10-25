# Keel — Testnet (transfer insurance MVP)

**Updated:** 2026-10-25

**Status: LIVE** · Genesis / **Stellar Unlocked**

## Addresses

Machine-readable: [`testnet.addresses.json`](./testnet.addresses.json)

| Artefacto | Value |
|-----------|-------|
| Policy vault (Soroban) | [`CCQEAW5T…HL5J`](https://stellar.expert/explorer/testnet/contract/CCQEAW5T6LFIANNOYFVIATYYXBEOERAXGCGRLLSHBQDU6XSCCJCOHL5J) |
| TUSDC SAC (collateral stand-in) | see JSON |
| **COVER** issuer (clawback claims rail) | see `cover` in JSON |
| **COVER** SAC | see `cover.sac` in JSON |

## Essential paths

**Policy vault** (`npm run testnet:up` / `testnet:smoke`):

deposit → transfer (unsettled policy) → dispute/resolve → exit → peg

**Claims rail Unlocked** (`npm run testnet:cover`):

mint COVER to holder → **Classic clawback** → remint indemnity to claimant

Product language: insurance claim. Mechanism: `AUTH_CLAWBACK_ENABLED`.

## Demo

```bash
npm run demo:hackathon
```

See [`HACKATHON.md`](./HACKATHON.md).

## Reproduce

```bash
export PATH="$HOME/.local/bin:$PATH"   # stellar CLI v25+
npm run build:vault
npm run testnet:up
npm run testnet:cover
npm run testnet:smoke
```
