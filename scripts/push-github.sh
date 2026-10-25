#!/usr/bin/env bash
# Push main to https://github.com/wrever/bind.git
# Prefers GITHUB_TOKEN / GH_TOKEN; falls back to gh auth.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
REPO="https://github.com/wrever/bind.git"

if [[ -n "${GITHUB_TOKEN:-}${GH_TOKEN:-}" ]]; then
  TOKEN="${GITHUB_TOKEN:-$GH_TOKEN}"
  git remote remove github 2>/dev/null || true
  git remote add github "https://x-access-token:${TOKEN}@github.com/wrever/bind.git"
  if git remote get-url origin 2>/dev/null | grep -q origin.cursor.com; then
    git remote rename origin cursor-origin 2>/dev/null || true
    git remote add origin "https://x-access-token:${TOKEN}@github.com/wrever/bind.git" 2>/dev/null || \
      git remote set-url origin "https://x-access-token:${TOKEN}@github.com/wrever/bind.git"
  else
    git remote set-url origin "$REPO" 2>/dev/null || true
  fi
  git push -u github main
  git push -u origin main 2>/dev/null || true
  echo "Pushed to GitHub via token"
  exit 0
fi

if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  git remote remove github 2>/dev/null || true
  git remote add github "$REPO"
  if git remote get-url origin 2>/dev/null | grep -q origin.cursor.com; then
    git remote rename origin cursor-origin 2>/dev/null || true
    git remote add origin "$REPO" 2>/dev/null || git remote set-url origin "$REPO"
  else
    git remote set-url origin "$REPO" 2>/dev/null || true
  fi
  git push -u origin main
  echo "Pushed to GitHub via gh"
  exit 0
fi

echo "No GITHUB_TOKEN / gh auth. Set GITHUB_TOKEN and re-run: npm run push:github"
exit 2
