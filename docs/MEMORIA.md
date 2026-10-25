# Bind — Memoria operativa

**Actualizado:** 2026-10-25 (noche — P0 testnet perfection)  
**Producto:** **Bind** (Keel retirado como marca; paths de código pueden seguir en `keel/`)  
**Autor de commits/repo:** `wrever` (único; sin Co-authored-by Cursor)  
**Repo canónico:** https://github.com/wrever/bind (privado) · legacy mirror: `wrever/Keel`  
**Norte:** [`VISION.md`](./VISION.md) · Negocio: [`BIND_BUSINESS.md`](./BIND_BUSINESS.md) · Plan: [`ROADMAP.md`](./ROADMAP.md) · Threat: [`THREAT_MODEL.md`](./THREAT_MODEL.md)

Este archivo es el orden de lo que **existe de verdad** vs lo que solo está en docs. Releer antes de expandir scope.

---

## Snapshot (25 oct 2026 — noche P0)

| Capa | Estado | Evidencia |
|------|--------|-----------|
| Visión / protocol insurance | **Lista** | `VISION.md`, `BIND_BUSINESS.md` |
| Motor TS settled/unsettled | **Lista** | `npm run test:engine` |
| Retention Standard / Fast Lane | **Lista** | `retention.ts` + demo lanes |
| API partner `/api/v1/*` | **Lista (simulador)** | No es custodia |
| DocsSite product | **Lista** | `/docs/*` + `/llms.txt` EN/ES/PT |
| UI storefront | **Lista** | VoxelArc + Remotion + i18n (`localePrefix: always`) |
| Freighter live rail | **Lista** | `/live`: faucet, deposit/transfer/settle/unwrap/exit/dispute + resolve ops |
| `keel-vault` Soroban | **Lista + testnet LIVE** | vault `CDGNKK…KZIJ` + views `credits` / `lots_of` |
| TUSDC faucet (ops) | **Lista** | `POST /api/v1/chain/faucet` + `BIND_OPS_TOKEN` |
| Resolve claims (ops) | **Lista** | `POST /api/v1/chain/tx/resolve` + `BIND_ARBITER_SECRET` |
| COVER clawback rail | **Lista (smoke histórico)** | preservado en JSON `cover` |
| PoR on-chain | **Lista** | `testnet:smoke` + `testnet:e2e` ✅ |
| Secrets sync | **Lista (local)** | `npm run testnet:sync-env` → `.env.local` |
| CI workflow push | **Pendiente** | token sin scope `workflow` |
| Deploy público demo | **Pendiente** | Vercel / video |
| API ↔ vault unify | **No** | dual-track honesto |
| Circle USDC | **No** | TUSDC stand-in |
| Auth partner / auditoría | **Pendiente** | Fase 1+/2 |

---

## Testnet — checklist P0 (verificado)

| Check | Resultado |
|-------|-----------|
| Vault live `CDGNKK…KZIJ` | ✅ |
| Views `credits` / `lots_of` | ✅ (5/5 contract tests) |
| `por()` fully backed | ✅ |
| `npm run testnet:smoke` | ✅ por + prepare deposit/transfer/settle |
| `npm run testnet:e2e` | ✅ mint→deposit→transfer→dispute→resolve→settle→unwrap |
| Faucet + trustline API | ✅ código + env |
| Live UI ciclo completo | ✅ |
| CLI identities `keel-*` | ✅ regeneradas en `testnet:up` |
| COVER metadata | ✅ preservada en addresses JSON |
| Vercel / repo público | ❌ go-to-market (fuera P0 chain) |

### Comandos

```bash
npm run build:vault
npm run testnet:up
npm run testnet:sync-env   # BIND_* → .env.local
npm run testnet:smoke
npm run testnet:e2e
npm run dev                # :3847 — /en/live con NEXT_PUBLIC_BIND_OPS_TOKEN
```

---

## Git / remotes (esta Mac)

| Remote | URL | Uso |
|--------|-----|-----|
| `origin` | `https://github.com/wrever/bind.git` | Canónico |
| `keel` | `https://github.com/wrever/Keel.git` | Legacy |

---

## Qué está realmente listo

### Motor / API / chain

- Simulator sessions: deposit/transfer/settle/unwrap/exit/dispute/resolve/pause.
- Chain: prepare (deposit|transfer|settle|unwrap|exit|dispute), submit (+ returnValue), por, account (+ credits/lots), faucet, resolve.
- Dual-track: `/demo` sim · `/live` Freighter · `/por` ambos.

### Frontend

- DocsSite search + sidebar + TOC + LLM.
- Live: Get TUSDC, trustline, lots list, dispute, ops approve/reject.

### Contratos

- `keel-vault`: + `credits(who)`, `lots_of(who)`.
- COVER Classic: clawback smoke histórico.

### Supabase

- Schema `001_keel_core` aplicado; service role writes.

---

## Roadmap vs realidad

- **Fase 0–1 chain:** cerrada para demo testnet presentable.
- **Gaps restantes:** deploy URL pública, repo público, Circle USDC, API keys partner, auditoría, unificar API↔vault.

Hackathon: pack docs listo; falta **repo público + demo URL o video** ([`HACKATHON.md`](./HACKATHON.md)).

---

## Próximos movimientos

1. **P0 go-to-market:** Vercel + repo público + video.
2. **P1:** Circle USDC swap opcional; CI workflow scope.
3. **P2:** LOI partner, auditoría scoped.
4. No lending / checkout / tokenomics; no vender clawback off-rail sin Tier 3.

### Cierre plataforma demo

| Track | Superficie | Verdad |
|-------|------------|--------|
| Policy engine | `/demo`, `/ops`, `/api/v1/sessions/*` | Simulador |
| Unlocked vault | `/live`, `/api/v1/chain/*` | Testnet + Freighter + ops faucet/resolve |
| PoR + COVER | `/por`, `GET /api/v1/chain/por` | RPC + metadata |

---

## Historial de esta memoria

| Fecha | Nota |
|-------|------|
| 2026-10-25 | Creación + migración Supabase + lint Next16. |
| 2026-10-25q | Dual-track `/live` Freighter→vault. |
| 2026-10-25s | DocsSite + `localePrefix:always`. |
| 2026-10-25t | Gap audit testnet. |
| 2026-10-25u | **P0 perfection:** credits/lots_of, redeploy `CDGNKK…`, faucet+resolve, Live UI, `testnet:e2e` verde. |
