# Bind — Memoria operativa

**Actualizado:** 2026-10-25 (tarde — UI institucional + hardening API + audit arch/sec)  
**Producto:** **Bind** (Keel retirado como marca; paths de código pueden seguir en `keel/`)  
**Autor de commits/repo:** `wrever` (único; sin Co-authored-by Cursor)  
**Repo canónico:** https://github.com/wrever/bind (privado) · legacy mirror: `wrever/Keel`  
**Norte:** [`VISION.md`](./VISION.md) · Negocio: [`BIND_BUSINESS.md`](./BIND_BUSINESS.md) · Plan: [`ROADMAP.md`](./ROADMAP.md) · Threat: [`THREAT_MODEL.md`](./THREAT_MODEL.md)

Este archivo es el orden de lo que **existe de verdad** vs lo que solo está en docs. Releer antes de expandir scope.

---

## Snapshot (25 oct 2026 — fin de día)

| Capa | Estado | Evidencia |
|------|--------|-----------|
| Visión / protocol insurance | **Lista** | `VISION.md`, `BIND_BUSINESS.md`, `PROTOCOL_INSURANCE.md` |
| Motor TS settled/unsettled | **Lista** | `src/lib/keel/engine.ts` · `npm run test:engine` ✅ |
| Retention Standard / Fast Lane | **Lista** | `retention.ts` + demo lanes + `set_retention` |
| API partner `/api/v1/*` | **Lista (simulador)** | No es custodia; ver hardening abajo |
| UI storefront institucional | **Lista (pass 6)** | Hero + VoxelArc + quick demo + i18n en/es/pt (`next-intl`) |
| Brand assets Bind | **Integrados** | `src/img/` + `public/brand/` + `BrandMark` |
| Freighter | **Identity + sign vault txs** | `/live` prepare→sign→submit; ID-only badge elsewhere |
| SDK `@keel/sdk` / BindClient | **Lista (surface)** | Safe Mode + HTTP thin; sin Soroban client |
| `keel-core` Rust parity | **Lista** | 4/4 tests ✅ |
| `keel-vault` Soroban | **Lista + testnet LIVE** | vault `CCQEAW…HL5J`; TUSDC stand-in |
| COVER clawback claims rail | **Lista (smoke)** | No storefront |
| PoR HMAC | **Demo marcado** | `demo: true` si secreto default; on-chain `por()` en smoke |
| Supabase schema + hydrate | **Lista** | service role writes; PoR read pública |
| Security headers Next | **Lista** | CSP / nosniff / frame-deny |
| API hardening pass | **Parcial** | actor ops obligatorio, UUID sessions, clamp windowMs |
| CI workflow en GitHub | **Pendiente push** | Token sin scope `workflow`; `.github/` local untracked |
| Deploy público demo | **Pendiente** | sin Vercel/Fly |
| API ↔ vault cableado | **No** | Dos verdades; gap estructural #1 |
| Auth partner / multisig | **No** | Strings `ops_*` spoofables si conoces el nombre |
| Circle USDC en vault | **No** | TUSDC |
| Freighter firmas cover | **Sí (testnet)** | deposit/transfer/settle/unwrap vía `/live` |
| Auditoría scoped / LOIs | **Pendiente** | Fase 1–2 |

---

## Git / remotes (esta Mac)

| Remote | URL | Uso |
|--------|-----|-----|
| `origin` | `https://github.com/wrever/bind.git` | Canónico — push aquí |
| `keel` | `https://github.com/wrever/Keel.git` | Legacy archive |

- Branch `main` trackea `origin/main`.
- Commits solo como `wrever` (rebuild con `commit-tree` si el entorno inyecta Co-authored-by).
- CI: falta `gh auth refresh -h github.com -s workflow` para subir `.github/workflows/ci.yml`.
- Visibilidad: **privada** hasta submit hackathon (entonces public + accept consequences).

---

## Qué está realmente listo (supervisión código)

### Motor (`src/lib/keel/`)

- **Listo:** deposit, transfer→unsettled, settle / settle_all, unwrap solo settled, exit pool + fee, dispute/freeze/resolve, pause, maxSupply, peg `vault ≥ supply`, roles, rate limits, migrateState, retention profiles.
- **Demo-only:** faucet USDC, roles string (`ops_*`), store memoria + `.data/sessions.json`; no firmas wallet.
- **Store (hardening 25 oct):**
  - Session id = `sess_` + `crypto.randomUUID()`
  - `windowMs` clamp (min 1s, max del profile demo/prod)
  - KYC **no** self-attest por body (solo profile `kyc_fast_lane`)
  - freeze / resolve / pause / unpause: **actor obligatorio** (sin default silencioso a `ops_*`)
  - Rate limits también en pause, faucet, session_create
  - Faucet off si `BIND_STRICT=1` o `KEEL_NETWORK=mainnet`

### API (`src/app/api/v1/`)

| Ruta | Listo |
|------|-------|
| `GET /health` | sí |
| `GET /network` | sí |
| `GET /openapi` | sí |
| `POST /sessions` + actions/keeper/por | sí (simulador) |
| `POST /por/verify` | sí — responde `demo` / attestation label |
| `GET /sessions/:id` | sí — disclaimer + `mode: demo-simulator`; **ya no expone `roles`** |
| `GET /sessions/:id/claims` | sí |

**Auth partner real / API keys: no.** Bearer en SDK ignorado por server.  
**Honestidad:** cualquiera con `sessionId` puede deposit/transfer/dispute. Ops roles spoofables si envías `actor: ops_recoverer`. Confianza de dinero → vault on-chain, no esta API.

### Frontend / marca

| Item | Estado |
|------|--------|
| Logos `src/img/` (15 assets + README uso) | **Sí** |
| `public/brand/` + `BrandMark` | **Sí** |
| Landing sin códigos `[ SI-001 ]` / grid HUD | **Sí** (pass institucional) |
| Nav corta (Integrate · Cover · Docs · Reserves) | **Sí** |
| `SiteFooter` multi-columna en páginas | **Sí** |
| Botones sentence-case (no ALL CAPS mono) | **Sí** |
| Freighter connect identity | **Sí** |
| Freighter sign deposit/transfer/settle/unwrap | **Sí** (`/live` + `/api/v1/chain/tx/*`) |
| Live `por()` RPC | **Sí** (`GET /api/v1/chain/por`) |
| COVER evidence en UI | **Sí** (`/por`) |
| URL pública | **No** (pendiente Vercel) |

Fuzz American Dynamism tokens se mantienen (`#0E100D` / `#F54307`); se **dejó de abusar** el estilo HUD en marketing. Diseño Figma externo: prompt listo para Grok (chat); aún no importado.

### Contratos

- `keel-vault`: deposit/transfer/settle/unwrap/exit/dispute/pause/`por` — tests + smoke testnet.
- **Sí** desde Next `/api/v1/chain/*` (prepare/submit Freighter + live `por`). Sessions API sigue siendo simulador.
- COVER Classic: clawback + remint smoke — claims ops; evidence en `/por`.
- Circle USDC: **pendiente** (TUSDC stand-in).

### Supabase

| Item | Estado |
|------|--------|
| Proyecto | `nllasdybyyxgvrtcsvjy` |
| Migración `001_keel_core` | aplicada |
| Writes | `SUPABASE_SERVICE_ROLE_KEY` |
| PoR snapshots | SELECT público (ok demo; restringir en prod) |
| Advisor `rls_auto_enable` | WARN preexistente |

### Seguridad (pass 25 oct tarde)

Hecho:
- Actor ops obligatorio
- UUID sessions + window clamp + KYC no spoof
- PoR demo marcado; `BIND_STRICT` exige secret
- Headers Next (CSP básica, frame deny, nosniff)
- Rate limits ampliados
- Threat model actualizado con honestidad API vs vault

Pendiente (P0–P1):
- API keys / firmas Stellar
- Cablear API↔vault o no vender API como rail
- Redis rate limits
- Multisig on-chain
- Auditoría scoped

---

## Roadmap vs realidad

- **Fase 0:** cerrada (spec + demo + API + integrate + OpenAPI).
- **Fase 1:** fuerte en código/testnet; Freighter firmas vault = `[x]` vía `/live`; **gaps:** Circle, auth partner, deploy público, auditoría.
- **Fase 2:** Safe Mode + `/ops` hechos; faltan LOIs + métricas.
- **Fase 3–4:** Exit Pool real capital, settled-only DeFi, SEP — **no**.

Hackathon: pack docs listo; falta **repo público + demo URL o video** ([`HACKATHON.md`](./HACKATHON.md)).

---

## Cómo correr

```bash
cd /Users/mac/Documents/GitHub/Bind
npm install
cp .env.example .env.local   # Supabase + KEEL_POR_SECRET recomendado
npm run test:engine
npm run build
npm run dev                  # :3847
git remote -v                # origin = wrever/bind
```

Strict-ish local:

```bash
BIND_STRICT=1 KEEL_POR_SECRET='…largo…' npm run dev
```

---

## Próximos movimientos (prioridad)

1. **P0 go-to-market:** deploy Vercel + repo público + video/demo URL en form hackathon.
2. **P0 demo script:** `/demo` (sim) → `/live` (Freighter) → `/por` (RPC PoR + COVER) → explorer.
3. **P1:** faucet TUSDC a Freighter address (ops mint); Circle USDC swap opcional.
4. **P1 ops:** API keys partner; multisig; CI workflow scope.
5. **P2:** LOI partner, ToS counsel, auditoría scoped.
6. No lending / checkout / tokenomics; no vender clawback como recupera off-rail / LP sin Tier 3.

### Cierre plataforma demo (25 oct noche)

| Track | Superficie | Verdad |
|-------|------------|--------|
| Policy engine | `/demo`, `/ops`, `/api/v1/sessions/*` | Simulador |
| Unlocked vault | `/live`, `/api/v1/chain/*` | Testnet + Freighter |
| PoR + COVER | `/por`, `GET /api/v1/chain/por`, `/api/v1/network` | RPC + metadata smoke |

---

## Historial de esta memoria

| Fecha | Nota |
|-------|------|
| 2026-10-25 | Creación + migración Supabase + lint Next16. |
| 2026-10-25b | Hydrate store, claims API, KeelApi SDK, health persistence, Fuzz AD UI. |
| 2026-10-25c | `.env.local` live, smoke persist OK, demo/ops AD + audit trail. |
| 2026-10-25d | Producto = **Bind**. `BIND_BUSINESS.md`. Keel fuera de marca. |
| 2026-10-25e | Cutover UI Bind, TOS+Cover Schedule, caps, Safe Deposit, /cover /terms. |
| 2026-10-25f | `/docs` hub + `PITCH_FAQ.md`. |
| 2026-10-25g | Seguro contratado por protocolos; clawback solo ops. |
| 2026-10-25h | Retención + Fast Lane + tiers (`RETENTION_SECURITY.md`). |
| 2026-10-25i | Ejecución Tier1/2: `retention.ts`, API profiles, demo lanes. |
| 2026-10-25j | Repo `wrever/bind` = origin; brand `src/img` + `public/brand`; footer pro; quit status bar BD-001. |
| 2026-10-25k | Freighter identity; docs apuntan a bind; UI storefront anti-HUD (nav/CTA/copy). |
| 2026-10-25l | **Audit arch/sec** + hardening API (actor, UUID, clamp, PoR demo flag, headers, RL). Gap #1: API≠vault. |
| 2026-10-25m | Landing alineada a mock Grok (hero headline, Protected Deposit flow, lanes visual, footer PoR live). |
| 2026-10-25n | Quit Protected Deposit card; hero centrado; shadcn MCP Cursor; fondo voxel-arc Bind (`three`/`r3f`). |
| 2026-10-25o | Landing quick demo (`LandingQuickDemo`): deposit → hold → settle/claim en 4 taps bajo el hero. |
| 2026-10-25p | Voxel Arc a medida (`voxel-arc.tsx` Canvas 2D): paleta Bind, sin licencia React Bits / sin WebGL. |
| 2026-10-25q | Dual-track completo: `/live` Freighter→vault, chain por/account/tx API, COVER evidence UI, PageShell internals. |
| 2026-10-25q | i18n `next-intl`: locales en/es/pt, `messages/*`, `[locale]` routing, language switcher en header. |
| 2026-10-25r | Hero voxel steel/teal; demo = Remotion Player scrubbed por scroll de página (`LandingScrollDemo`). |
