#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/contracts/keel-vault"
rustup target add wasm32v1-none >/dev/null 2>&1 || true
cargo build --release --target wasm32v1-none
WASM="target/wasm32v1-none/release/keel_vault.wasm"
ls -lh "$WASM"
echo "OK $ROOT/contracts/keel-vault/$WASM"
