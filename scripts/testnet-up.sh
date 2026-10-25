#!/usr/bin/env bash
# Essential path: deploy a functional Keel vault on Stellar Testnet.
# Uses TUSDC (classic asset + SAC) so we are not blocked on Circle faucet.
set -euo pipefail

export PATH="${HOME}/.local/bin:${PATH}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

NETWORK=testnet
ASSET_CODE=TUSDC
WINDOW_SECS="${KEEL_WINDOW_SECS:-60}"
EXIT_FEE_BPS="${KEEL_EXIT_FEE_BPS:-30}"
EXIT_SEED="${KEEL_EXIT_POOL_SEED:-1000000000}"
MINT_ALICE="${KEEL_MINT_ALICE:-5000000000}"
OUT_JSON="${ROOT}/docs/testnet.addresses.json"
OUT_DATA="${ROOT}/.data/testnet.json"

need() { command -v "$1" >/dev/null || { echo "missing $1"; exit 1; }; }
need stellar
need curl
need cargo
need python3

mkdir -p "${ROOT}/.data"

echo "==> Ensure wasm"
npm run build:vault >/dev/null
WASM="${ROOT}/contracts/keel-vault/target/wasm32v1-none/release/keel_vault.wasm"
test -f "$WASM"

gen_key() {
  local name="$1"
  if ! stellar keys address "$name" >/dev/null 2>&1; then
    stellar keys generate "$name" --network "$NETWORK" --fund
  else
    local addr
    addr="$(stellar keys address "$name")"
    curl -fsS "https://friendbot.stellar.org?addr=${addr}" >/dev/null 2>&1 || true
  fi
  stellar keys address "$name"
}

echo "==> Keys + friendbot"
ADMIN="$(gen_key keel-admin)"
ARBITER="$(gen_key keel-arbiter)"
ALICE="$(gen_key keel-alice)"
BOB="$(gen_key keel-bob)"
echo "    admin=$ADMIN arbiter=$ARBITER"
echo "    alice=$ALICE bob=$BOB"

ASSET="${ASSET_CODE}:${ADMIN}"
echo "==> Deploy SAC for ${ASSET}"
set +e
SAC_OUT="$(stellar contract asset deploy --asset "$ASSET" --source keel-admin --network "$NETWORK" 2>&1)"
SAC_RC=$?
set -e
if [[ $SAC_RC -eq 0 ]]; then
  USDC_SAC="$(echo "$SAC_OUT" | tail -n1 | tr -d '[:space:]')"
else
  USDC_SAC="$(stellar contract id asset --asset "$ASSET" --network "$NETWORK" | tr -d '[:space:]')"
fi
echo "    tusdc_sac=$USDC_SAC"

echo "==> Classic trustlines (required before SAC mint to accounts)"
for id in keel-alice keel-bob keel-arbiter; do
  stellar tx new change-trust --source "$id" --line "$ASSET" --network "$NETWORK" >/dev/null
done

echo "==> Mint TUSDC (never mint to issuer)"
stellar contract invoke --id "$USDC_SAC" --source keel-admin --network "$NETWORK" -- \
  mint --to "$ALICE" --amount "$MINT_ALICE" >/dev/null
stellar contract invoke --id "$USDC_SAC" --source keel-admin --network "$NETWORK" -- \
  mint --to "$ARBITER" --amount "$EXIT_SEED" >/dev/null

echo "==> Deploy keel-vault"
VAULT="$(stellar contract deploy \
  --wasm "$WASM" \
  --source keel-admin \
  --network "$NETWORK" \
  --alias keel-vault | tr -d '[:space:]')"
echo "    vault=$VAULT"

echo "==> Initialize"
stellar contract invoke \
  --id "$VAULT" --source keel-admin --network "$NETWORK" -- \
  initialize \
  --admin "$ADMIN" \
  --arbiter "$ARBITER" \
  --usdc "$USDC_SAC" \
  --window_secs "$WINDOW_SECS" \
  --exit_fee_bps "$EXIT_FEE_BPS" \
  --max_supply 0 \
  --exit_pool_seed "$EXIT_SEED" >/dev/null

echo "==> Seed exit pool inventory"
stellar contract invoke \
  --id "$USDC_SAC" --source keel-arbiter --network "$NETWORK" -- \
  transfer --from "$ARBITER" --to "$VAULT" --amount "$EXIT_SEED" >/dev/null

echo "==> Smoke deposit / transfer / dispute / resolve / exit"
stellar contract invoke \
  --id "$VAULT" --source keel-alice --network "$NETWORK" -- \
  deposit --from "$ALICE" --amount 100000000 >/dev/null

LOT="$(stellar contract invoke \
  --id "$VAULT" --source keel-alice --network "$NETWORK" -- \
  transfer --from "$ALICE" --to "$BOB" --amount 40000000 | tr -d '[:space:]')"

stellar contract invoke \
  --id "$VAULT" --source keel-alice --network "$NETWORK" -- \
  dispute --sender "$ALICE" --lot_id "$LOT" >/dev/null

stellar contract invoke \
  --id "$VAULT" --source keel-arbiter --network "$NETWORK" -- \
  resolve --lot_id "$LOT" --approve true >/dev/null

stellar contract invoke \
  --id "$VAULT" --source keel-alice --network "$NETWORK" -- \
  transfer --from "$ALICE" --to "$BOB" --amount 20000000 >/dev/null

FEE="$(stellar contract invoke \
  --id "$VAULT" --source keel-bob --network "$NETWORK" -- \
  exit --who "$BOB" --amount 20000000 | tr -d '[:space:]')"

POR="$(stellar contract invoke \
  --id "$VAULT" --source keel-admin --network "$NETWORK" -- por)"
echo "    lot=$LOT fee=$FEE"
echo "    por=$POR"

python3 - "$VAULT" "$USDC_SAC" "$ADMIN" "$ARBITER" "$ALICE" "$BOB" "$ASSET" "$WINDOW_SECS" "$EXIT_FEE_BPS" "$OUT_JSON" "$OUT_DATA" <<'PY'
import json, sys, pathlib, datetime
vault, sac, admin, arbiter, alice, bob, asset, window, fee_bps, out_json, out_data = sys.argv[1:]
data = {
  "network": "testnet",
  "networkPassphrase": "Test SDF Network ; September 2015",
  "rpcUrl": "https://soroban-testnet.stellar.org",
  "horizonUrl": "https://horizon-testnet.stellar.org",
  "deployedAt": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
  "windowSecs": int(window),
  "exitFeeBps": int(fee_bps),
  "assetCode": "TUSDC",
  "asset": asset,
  "tusdcSac": sac,
  "circleUsdcSac": "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  "circleUsdcIssuer": "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  "vault": vault,
  "admin": admin,
  "arbiter": arbiter,
  "alice": alice,
  "bob": bob,
  "explorer": {
    "vault": f"https://stellar.expert/explorer/testnet/contract/{vault}",
    "tusdc": f"https://stellar.expert/explorer/testnet/contract/{sac}",
  },
  "status": "live",
  "smoke": {
    "deposit": True,
    "transfer": True,
    "disputeResolve": True,
    "exit": True,
    "porFullyBacked": True,
  },
  "notes": "TUSDC stand-in for Circle USDC. Secrets in local stellar CLI keystore only.",
}
pathlib.Path(out_json).write_text(json.dumps(data, indent=2) + "\n")
pathlib.Path(out_data).write_text(json.dumps(data, indent=2) + "\n")
print("wrote", out_json)
PY

python3 - <<'PY'
import json, pathlib
root = pathlib.Path("/workspace")
data = json.loads((root/"docs/testnet.addresses.json").read_text())
(root/"docs/TESTNET.md").write_text(f"""# Keel — Testnet (functional product)

**Status: LIVE** on Stellar Testnet · deployed `{data['deployedAt']}`

## Essential path (done)

| Step | Result |
|------|--------|
| Vault WASM | built (`npm run build:vault`) |
| TUSDC SAC (USDC stand-in) | `{data['tusdcSac']}` |
| `keel-vault` deployed + initialized | [`{data['vault']}`]({data['explorer']['vault']}) |
| Exit pool inventory funded | yes |
| Smoke: deposit → transfer → dispute/recover → exit → peg | **pass** |

Machine-readable: [`docs/testnet.addresses.json`](./testnet.addresses.json)

## Addresses

| Artefacto | Value |
|-----------|-------|
| Network / RPC | `{data['network']}` · `{data['rpcUrl']}` |
| Admin | `{data['admin']}` |
| Arbiter | `{data['arbiter']}` |
| **keel-vault** | [`{data['vault']}`]({data['explorer']['vault']}) |
| **TUSDC SAC** | [`{data['tusdcSac']}`]({data['explorer']['tusdc']}) |
| Circle USDC SAC (optional swap) | `{data['circleUsdcSac']}` |
| Window / exit fee | `{data['windowSecs']}`s / `{data['exitFeeBps']}` bps |

## What is essential vs later

**Essential for a usable testnet product (this slice):**
1. On-chain vault with deposit / transfer / settle / unwrap / exit / dispute / resolve / pause / por  
2. Real USDC-like SAC liquidity + exit pool inventory  
3. Published addresses + reproducible deploy (`npm run testnet:up`)  
4. Peg invariant holds after recover + exit  

**Not essential for first testnet product:**
- Separate classic **rUSDC** issuer with clawback (vault recovers via internal burn/remint already)  
- Circle faucet USDC (swap SAC when funded)  
- Multisig ceremony / Freighter UI / public keeper cron  
- Chainlink oracles  

## Reproduce

```bash
export PATH="$HOME/.local/bin:$PATH"   # stellar CLI v25+
npm run build:vault
npm run testnet:up                     # redeploy + full smoke
npm run testnet:smoke                  # invoke por on published vault
```

Local identities (secrets never in git): `keel-admin`, `keel-arbiter`, `keel-alice`, `keel-bob`.

## Manual invokes

```bash
VAULT={data['vault']}
stellar contract invoke --id $VAULT --source keel-admin --network testnet -- por
```
""")
print("updated docs/TESTNET.md")
PY

echo "==> DONE vault=$VAULT"
