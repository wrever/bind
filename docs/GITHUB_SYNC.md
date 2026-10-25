# Sync to GitHub (`wrever/bind`)

**Updated:** 2026-10-25

Canonical repo:

**https://github.com/wrever/bind**

Legacy mirror (Keel name, do not push Bind product there by default): `https://github.com/wrever/Keel`

## Remotes (this Mac)

| Remote | URL |
|--------|-----|
| `origin` | `https://github.com/wrever/bind.git` |
| `keel` | `https://github.com/wrever/Keel.git` (archive) |

```bash
cd /Users/mac/Documents/GitHub/Bind
git remote -v
git push -u origin main
```

## Helper

```bash
npm run push:github   # pushes to origin = wrever/bind
```

CI (`.github/workflows/ci.yml`) needs a GitHub token with the `workflow` scope the first time it is added. Until then, keep the file local or push after:

```bash
gh auth refresh -h github.com -s workflow
```
