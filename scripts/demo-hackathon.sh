#!/usr/bin/env bash
# ~3 min hackathon demo script (Genesis / Unlocked — transfer insurance)
set -euo pipefail
export PATH="${HOME}/.local/bin:${PATH}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
ADDR="$ROOT/docs/testnet.addresses.json"

echo "============================================"
echo " Keel — Transfer insurance demo (Testnet)"
echo " Genesis · Stellar Unlocked"
echo "============================================"
echo
echo "Product: opt-in cover on USDC transfers"
echo "Mechanism (under the hood): clawback-enabled COVER asset + Soroban policy vault"
echo

if [[ ! -f "$ADDR" ]]; then
  echo "Missing $ADDR — run npm run testnet:up && npm run testnet:cover"
  exit 1
fi

python3 - <<'PY'
import json, pathlib
d = json.loads(pathlib.Path("docs/testnet.addresses.json").read_text())
print("1) Policy vault (Soroban)")
print("   ", d.get("vault") or "(redeploy with npm run testnet:up)")
print("   explorer:", (d.get("explorer") or {}).get("vault"))
print()
print("2) Cover / claims rail (Classic clawback asset)")
c = d.get("cover") or {}
print("   asset:", c.get("asset"))
print("   sac:", c.get("sac"))
print("   flags:", ", ".join(c.get("flags") or []))
print("   explorer:", (c.get("explorer") or {}).get("sac"))
print()
smoke = c.get("smoke") or {}
print("3) Claim smoke already recorded:")
for k, v in smoke.items():
    print(f"   - {k}: {v}")
print()
print("4) Narrative beats for judges:")
print("   deposit → covered credit")
print("   transfer → unsettled POLICY window T")
print("   claim approve → L1 CLAWBACK from holder + remint to claimant")
print("   PoR → vault ≥ supply (solvency of cover pool)")
print("   exit pool → pay fee to exit cover early")
print()
h = d.get("hackathon") or {"category": "Genesis", "track": "Stellar Unlocked"}
print("Entry:", h.get("category"), "/", h.get("track"))
print()
print("Commands:")
print("  npm run testnet:smoke     # vault por()")
print("  npm run testnet:cover     # (re)run clawback claim rail")
print("  open /demo and /ops locally for UI")
print("  docs/HACKATHON.md         # full checklist")
PY

if command -v stellar >/dev/null && jq -e '.vault' "$ADDR" >/dev/null 2>&1; then
  VAULT="$(python3 -c "import json;print(json.load(open('$ADDR'))['vault'])")"
  echo
  echo "==> Live vault PoR"
  stellar contract invoke --id "$VAULT" --source keel-admin --network testnet -- por 2>/dev/null | tail -3 || \
    echo "(vault invoke skipped — keys may be missing on this machine; addresses still valid on-chain)"
fi

echo
echo "Demo pack ready."
