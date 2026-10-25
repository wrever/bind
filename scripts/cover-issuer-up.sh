#!/usr/bin/env bash
# Stellar Unlocked — clawback-enabled COVER asset as the claims rail.
# Product: transfer insurance indemnity. Mechanism: Classic clawback + remint.
set -euo pipefail
export PATH="${HOME}/.local/bin:${PATH}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
NETWORK=testnet
ASSET_CODE="${KEEL_COVER_CODE:-COVER}"
AMT="${KEEL_COVER_AMT:-100000000}"  # 10 units @ 7 decimals
OUT="${ROOT}/docs/testnet.addresses.json"

need() { command -v "$1" >/dev/null || { echo "missing $1"; exit 1; }; }
need stellar
need curl
need python3
mkdir -p "${ROOT}/.data"

gen_key() {
  local name="$1"
  if ! stellar keys address "$name" >/dev/null 2>&1; then
    stellar keys generate "$name" --network "$NETWORK" --fund
  else
    curl -fsS "https://friendbot.stellar.org?addr=$(stellar keys address "$name")" >/dev/null 2>&1 || true
  fi
  stellar keys address "$name"
}

echo "==> Keys"
ISSUER="$(gen_key keel-cover-issuer)"
HOLDER="$(gen_key keel-cover-holder)"
CLAIMANT="$(gen_key keel-cover-claimant)"
echo "    issuer=$ISSUER"
echo "    holder=$HOLDER"
echo "    claimant=$CLAIMANT"

ASSET="${ASSET_CODE}:${ISSUER}"

echo "==> Enable issuer flags (required + revocable + clawback)"
set +e
stellar tx new set-options \
  --source-account keel-cover-issuer \
  --network "$NETWORK" \
  --set-required \
  --set-revocable \
  --set-clawback-enabled >/dev/null 2>&1
set -e

echo "==> Trustlines"
for id in keel-cover-holder keel-cover-claimant; do
  stellar tx new change-trust --source-account "$id" --line "$ASSET" --network "$NETWORK" >/dev/null || true
done

echo "==> Authorize trustlines (clawback flag is automatic on new TLs)"
stellar tx new set-trustline-flags \
  --source-account keel-cover-issuer --network "$NETWORK" \
  --asset "$ASSET" --trustor "$HOLDER" --set-authorize >/dev/null
stellar tx new set-trustline-flags \
  --source-account keel-cover-issuer --network "$NETWORK" \
  --asset "$ASSET" --trustor "$CLAIMANT" --set-authorize >/dev/null

echo "==> Deploy SAC"
set +e
SAC_OUT="$(stellar contract asset deploy --asset "$ASSET" --source-account keel-cover-issuer --network "$NETWORK" 2>&1)"
SAC_RC=$?
set -e
if [[ $SAC_RC -eq 0 ]]; then
  COVER_SAC="$(echo "$SAC_OUT" | tail -n1 | tr -d '[:space:]')"
else
  COVER_SAC="$(stellar contract id asset --asset "$ASSET" --network "$NETWORK" | tr -d '[:space:]')"
fi
echo "    cover_sac=$COVER_SAC"

echo "==> Mint COVER to holder (covered unsettled stand-in)"
stellar contract invoke --id "$COVER_SAC" --source-account keel-cover-issuer --network "$NETWORK" -- \
  mint --to "$HOLDER" --amount "$AMT" >/dev/null

echo "==> Claim rail: Classic clawback from holder"
stellar tx new clawback \
  --source-account keel-cover-issuer --network "$NETWORK" \
  --from "$HOLDER" --asset "$ASSET" --amount "$AMT" >/dev/null

echo "==> Remint indemnity to claimant"
stellar contract invoke --id "$COVER_SAC" --source-account keel-cover-issuer --network "$NETWORK" -- \
  mint --to "$CLAIMANT" --amount "$AMT" >/dev/null

BAL_H="$(stellar contract invoke --id "$COVER_SAC" --source-account keel-cover-issuer --network "$NETWORK" -- \
  balance --id "$HOLDER" 2>/dev/null | tail -1 | tr -d '"' || echo 0)"
BAL_C="$(stellar contract invoke --id "$COVER_SAC" --source-account keel-cover-issuer --network "$NETWORK" -- \
  balance --id "$CLAIMANT" 2>/dev/null | tail -1 | tr -d '"' || echo 0)"
echo "    holder_bal=$BAL_H claimant_bal=$BAL_C"

if [[ "$BAL_H" != "0" ]] || [[ "$BAL_C" != "$AMT" ]]; then
  echo "WARN: unexpected balances (claim smoke may be partial)"
fi

python3 - <<PY
import json, pathlib, datetime
root = pathlib.Path(r"$ROOT")
path = root / "docs" / "testnet.addresses.json"
data = json.loads(path.read_text()) if path.exists() else {}
data["cover"] = {
  "assetCode": "$ASSET_CODE",
  "asset": "$ASSET",
  "issuer": "$ISSUER",
  "sac": "$COVER_SAC",
  "holder": "$HOLDER",
  "claimant": "$CLAIMANT",
  "flags": ["AUTH_REQUIRED", "AUTH_REVOCABLE", "AUTH_CLAWBACK_ENABLED"],
  "smoke": {
    "mintToHolder": True,
    "clawbackClaim": True,
    "remintToClaimant": True,
    "holderBalanceAfter": "$BAL_H",
    "claimantBalanceAfter": "$BAL_C",
  },
  "explorer": {
    "sac": "https://stellar.expert/explorer/testnet/contract/$COVER_SAC",
    "issuer": "https://stellar.expert/explorer/testnet/account/$ISSUER",
  },
  "updatedAt": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
  "notes": "COVER = Unlocked claims rail. Product = transfer insurance indemnity via L1 clawback + remint.",
}
data["hackathon"] = {
  "category": "Genesis",
  "track": "Stellar Unlocked",
  "product": "transfer-insurance",
}
path.write_text(json.dumps(data, indent=2) + "\n")
print("updated", path)
PY

echo "==> DONE cover issuer + clawback claim smoke"
