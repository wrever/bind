#!/usr/bin/env bash
# Export keel-* CLI secrets into .env.local for faucet / resolve / e2e.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${HOME}/.cargo/bin:${HOME}/.local/bin:${PATH}"

need() { command -v "$1" >/dev/null || { echo "missing $1"; exit 1; }; }
need stellar

for id in keel-admin keel-arbiter keel-alice keel-bob; do
  if ! stellar keys address "$id" >/dev/null 2>&1; then
    echo "missing identity $id — run: npm run testnet:up"
    exit 1
  fi
done

ADMIN_S="$(stellar keys secret keel-admin)"
ARBITER_S="$(stellar keys secret keel-arbiter)"
ALICE_S="$(stellar keys secret keel-alice)"
BOB_S="$(stellar keys secret keel-bob)"
OPS_TOKEN="${BIND_OPS_TOKEN:-bind-demo-ops-local}"

ENV_FILE="${ROOT}/.env.local"
touch "$ENV_FILE"

upsert() {
  local key="$1" val="$2"
  python3 - "$ENV_FILE" "$key" "$val" <<'PY'
import sys
path, key, val = sys.argv[1], sys.argv[2], sys.argv[3]
lines = open(path).read().splitlines() if __import__("os").path.exists(path) else []
out = []
found = False
for line in lines:
    if line.startswith(key + "="):
        out.append(f"{key}={val}")
        found = True
    else:
        out.append(line)
if not found:
    out.append(f"{key}={val}")
open(path, "w").write("\n".join(out) + "\n")
PY
}

upsert BIND_TUSDC_ISSUER_SECRET "$ADMIN_S"
upsert BIND_ARBITER_SECRET "$ARBITER_S"
upsert BIND_ALICE_SECRET "$ALICE_S"
upsert BIND_BOB_SECRET "$BOB_S"
upsert BIND_OPS_TOKEN "$OPS_TOKEN"
upsert NEXT_PUBLIC_BIND_OPS_TOKEN "$OPS_TOKEN"

echo "ok wrote secrets into .env.local (gitignored)"
echo "  admin=$(stellar keys address keel-admin)"
echo "  arbiter=$(stellar keys address keel-arbiter)"
echo "  alice=$(stellar keys address keel-alice)"
echo "  bob=$(stellar keys address keel-bob)"
echo "  BIND_OPS_TOKEN set"
