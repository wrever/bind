<p align="center">
  <a href="https://bind-beta.vercel.app">
    <img src="public/brand/bind-readme-hero.svg" alt="Bind" width="560" />
  </a>
</p>

**Updated:** 2026-10-26

**DeFi deposit insurance on Stellar** · Genesis · **Stellar Unlocked**

Protocols **contract Bind**; users get a timed protected window before free exit.  
**Unlocked thesis:** Stellar clawback + Soroban policy vault = claims rail + retention. See [`docs/UNLOCKED.md`](./docs/UNLOCKED.md).  
Product language = insurance; clawback stays claims ops.

| Field | Value |
|-------|-------|
| Product | **Bind** |
| Category / track | **Genesis** · **Stellar Unlocked** |
| Repo | https://github.com/wrever/bind |
| Live demo | https://bind-beta.vercel.app |
| Why Unlocked | [`docs/UNLOCKED.md`](./docs/UNLOCKED.md) |
| AI tooling | [`docs/AI_ATTRIBUTION.md`](./docs/AI_ATTRIBUTION.md) |
| Architecture | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |

---

## On-chain proof (Stellar Testnet) — keep this handy

**Last signed e2e:** 2026-10-25 22:58 UTC · `fully_backed: true` · vault `CDGNKK…`

### Contracts & accounts

| What | ID / link |
|------|-----------|
| **Policy vault (LIVE)** | [`CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ`](https://stellar.expert/explorer/testnet/contract/CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ) |
| TUSDC SAC (collateral) | [`CBTMLE4GB2JGXPW4IQKK3XHFDRQMTSOI2IQ4DG5REP4WPWRD54GTMYKO`](https://stellar.expert/explorer/testnet/contract/CBTMLE4GB2JGXPW4IQKK3XHFDRQMTSOI2IQ4DG5REP4WPWRD54GTMYKO) |
| COVER SAC (claims rail) | [`CAZGFSWXBWZIOZGRV42GXEKLZTP7MCJ74LVJZ6UYLHAOVHT52NMNP5Z2`](https://stellar.expert/explorer/testnet/contract/CAZGFSWXBWZIOZGRV42GXEKLZTP7MCJ74LVJZ6UYLHAOVHT52NMNP5Z2) |
| COVER issuer | [`GCIYYORXS2E3LVSEZTVTVUNQQVX5YIJFNQFJCGR73GY234OBU3MPYC4P`](https://stellar.expert/explorer/testnet/account/GCIYYORXS2E3LVSEZTVTVUNQQVX5YIJFNQFJCGR73GY234OBU3MPYC4P) |
| Admin / TUSDC issuer | [`GCNPSYT4C5DOYXHYPFZ6ZJJPE7ER7I2Y63UJKYDKRD6GSA3NRBE4KD7X`](https://stellar.expert/explorer/testnet/account/GCNPSYT4C5DOYXHYPFZ6ZJJPE7ER7I2Y63UJKYDKRD6GSA3NRBE4KD7X) |
| Arbiter | [`GDPQVHY2VUAOIZO2FTHELDVEXCBY5GGBHSVKDB5EDS7LLOMQ5OJN4PID`](https://stellar.expert/explorer/testnet/account/GDPQVHY2VUAOIZO2FTHELDVEXCBY5GGBHSVKDB5EDS7LLOMQ5OJN4PID) |
| Alice (demo user) | [`GB5FFYJRMUWIVSSRQAGA36LQPLL7O5G36IBWQJO4YTSIMRHQ27FR7ABI`](https://stellar.expert/explorer/testnet/account/GB5FFYJRMUWIVSSRQAGA36LQPLL7O5G36IBWQJO4YTSIMRHQ27FR7ABI) |
| Bob (demo counterparty) | [`GDMSZX33BT3WDDQNFGY4HYHWKN532WWADL3FO6YZ7Z3XBWM2TZMXEFDH`](https://stellar.expert/explorer/testnet/account/GDMSZX33BT3WDDQNFGY4HYHWKN532WWADL3FO6YZ7Z3XBWM2TZMXEFDH) |
| Live PoR JSON | https://bind-beta.vercel.app/api/v1/chain/por |
| Live UI | https://bind-beta.vercel.app/en/live · https://bind-beta.vercel.app/en/por |

### Signed e2e txs (mint → claim → settle → unwrap)

Path: mint TUSDC → deposit → transfer → **dispute** → **resolve (approve)** → transfer → settle → unwrap → `por()` peg OK.

| Step | Explorer |
|------|----------|
| Mint 20 TUSDC → Alice | https://stellar.expert/explorer/testnet/tx/3a41f41298e7ba86c4fdd2bb1a98284417e57b5241571d535b6f775440b03ecc |
| Deposit 15 | https://stellar.expert/explorer/testnet/tx/5bc631a213acc70a25fcd89649932708ea1d36582da3f6aa157d0d0c9634c71a |
| Transfer 5 → Bob (open lot) | https://stellar.expert/explorer/testnet/tx/c5ed384611af02f4d3043fcf3a899730d0b56c175f706fbab61612e65d3dc254 |
| Dispute lot | https://stellar.expert/explorer/testnet/tx/ef8bad73d0bf04c5286a278b57c0c4edaede4cced407292a4c0b14e52748765e |
| Resolve approve (arbiter) | https://stellar.expert/explorer/testnet/tx/5a4042262c99e30fb678dfa7077091ffc9a520de9281b66dbe4241169786fbca |
| Transfer 3 → Bob | https://stellar.expert/explorer/testnet/tx/e794f11794ed895f5e77ba9d22bed42cc04ef838644ba746a4b68bbc54e253ce |
| Settle (Bob) | https://stellar.expert/explorer/testnet/tx/092d2d3926b78613a511756a9b6d98e2e34638194e1665a45517ab67db23e79a |
| Unwrap 3 | https://stellar.expert/explorer/testnet/tx/62e6b8a97a45d01d0171585ee43ea901fec1f3e6e777125da66e01b9a7236675 |

Reproduce anytime:

```bash
bash scripts/sync-testnet-env.sh
npm run testnet:e2e      # signed path above (prints fresh explorer links)
npm run testnet:smoke    # prepare deposit/transfer/settle + live por()
npm run testnet:cover    # COVER clawback claims rail
```

Full dump: [`docs/testnet.addresses.json`](./docs/testnet.addresses.json) · narrative: [`docs/EVIDENCE.md`](./docs/EVIDENCE.md).

---

## Problem

Stellar settles in seconds with **no chargeback**. Protocols and wallets absorb phishing / mis-sign risk while value moves.

## Solution

**Bind** cover: unsettled policy window `T`, transparent claims, PoR, Exit Pool, Safe Deposit adapter for money markets.  
**Not covered in v1:** partner smart-contract exploits, oracles, liquidations, bad debt.

## Setup

```bash
npm install
cp .env.example .env.local
bash scripts/sync-testnet-env.sh   # local faucet / e2e secrets
npm run dev                        # http://127.0.0.1:3847
```

### Tests

```bash
npm run test:engine
npm run test:persist
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

### How to drive `/live` (two wallets)

Happy path needs **sender + recipient** (Freighter Testnet). *Transfer to* is only used by Transfer.

| Step | Who signs | What happens |
|------|-----------|--------------|
| Deposit | You | TUSDC → **settled** cover on your wallet |
| Transfer | Sender | Opens an **unsettled** lot on the **recipient** (retention window ~60s on this vault) |
| Settle | **Recipient** | Ready lots → settled on the signing wallet (ignores Transfer to; returns 0 if you are still the sender) |
| Unwrap | Whoever holds settled | Settled cover → free TUSDC out |
| Exit (fee) | Unsettled holder | Skip the window; pay fee if exit pool has liquidity |
| Dispute | **Sender** of the lot | Freeze during the window; arbiter resolve is ops |

UI blocks Settle when your unsettled is 0 and you just sent lots (“Settle runs on the recipient”). Full ops notes: [`docs/MEMORIA.md`](./docs/MEMORIA.md).

## License

MIT — see [`LICENSE`](./LICENSE).
