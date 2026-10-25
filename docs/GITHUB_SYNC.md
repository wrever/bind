# Sync to GitHub (`wrever/Keel`)

**Updated:** 2026-10-25

Cloud agents authenticate to Origin, not always to GitHub. This repo’s canonical public/private home is:

**https://github.com/wrever/Keel**

## From a machine with `gh` auth (your Mac)

```bash
cd /path/to/Keel   # empty or existing clone of wrever/Keel
# Option A — if you have the agent bundle artifact:
git pull /path/to/keel-main.bundle main
git push -u origin main

# Option B — helper (PAT or gh):
export GITHUB_TOKEN=ghp_...   # or rely on `gh auth`
npm run push:github
```

## Remotes expected

| Remote | URL |
|--------|-----|
| `origin` (desired) | `https://github.com/wrever/Keel.git` |
| `github` | same (helper) |

After the first successful push, CI (`.github/workflows/ci.yml`) runs on GitHub.
