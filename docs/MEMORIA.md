# Bind — Memoria operativa

**Actualizado:** 2026-10-25 (Bind rename + business model)  
**Producto:** **Bind** (Keel retirado como marca)  
**Autor de commits/repo:** `wrever` (único uploader)  
**Norte:** [`VISION.md`](./VISION.md) · Negocio: [`BIND_BUSINESS.md`](./BIND_BUSINESS.md) · Plan: [`ROADMAP.md`](./ROADMAP.md)

Este archivo es el orden de lo que **existe de verdad** vs lo que solo está en docs. Releer antes de expandir scope.

---

## Snapshot (25 oct 2026)

| Capa | Estado | Evidencia |
|------|--------|-----------|
| Visión / producto transfer-insurance | **Lista** | `VISION.md`, `CLAW_PRODUCT.md`, framing Unlocked |
| Motor TS settled/unsettled | **Lista** | `src/lib/keel/engine.ts` · `npm run test:engine` ✅ |
| API partner `/api/v1/*` | **Lista** | health, sessions, actions, keeper, por, openapi, network |
| UI demo / ops / por / integrate | **Lista** | build Next ✅ rutas estáticas + API |
| SDK `@keel/sdk` | **Lista (surface)** | Safe Mode + `KeelClient` demo; no HTTP client prod |
| `keel-core` Rust parity | **Lista** | 4/4 tests ✅ |
| `keel-vault` Soroban | **Lista + testnet LIVE** | 4/4 tests ✅ · vault `CCQEAW…HL5J` · RPC healthy; CLI `por` hit fee-config noise hoy |
| COVER clawback claims rail | **Lista (smoke)** | issuer + SAC · `testnet:cover` documentado |
| PoR HMAC + verify | **Lista (demo)** | off-chain; on-chain `por()` leído en smoke |
| Supabase schema | **Aplicada hoy** | tablas + RLS · proyecto `nllasdybyyxgvrtcsvjy` |
| Persistencia runtime → Supabase | **Verificada live** | `.env.local` local; smoke → 1 session + claim + por row |
| SDK HTTP `KeelApi` | **Listo** | `packages/sdk/src/http.ts` → health/sessions/actions/por/claims |
| Claims audit API | **Listo** | `GET /api/v1/sessions/:id/claims` |
| UI Fuzz American Dynamism | **Aplicado** | tokens + landing/header/buttons; cyan=live, orange=CTA |
| CI lint | **Arreglado** | Next 16 → `eslint` |
| Deploy público demo | **Pendiente** | sin URL Vercel/Fly en submit |
| Repo GitHub | **Privado (canónico)** | https://github.com/wrever/bind · legacy: `wrever/Keel` |
| Auditoría / mainnet / LOIs | **Pendiente** | Fase 1–2 |

---

## Qué está realmente listo (supervisión código)

### Motor (`src/lib/keel/`)

- **Listo:** deposit, transfer→unsettled, settle / settle_all, unwrap solo settled, exit pool + fee, dispute/freeze/resolve, pause, maxSupply, peg `vault ≥ supply`, roles, rate limits, migrateState.
- **Demo-only:** faucet USDC, roles string (`ops_*`), store en memoria + JSON; no firmas wallet.
- **Store:** `ensureStoreReady` hydrata desde Supabase (hasta 200 sessions) + merge por `updated_at`; miss → fetch row remota; upsert + PoR snapshots + claim events.

### API (`src/app/api/v1/`)

| Ruta | Listo |
|------|-------|
| `GET /health` | sí |
| `GET /network` | sí (lee `testnet.addresses.json`) |
| `GET /openapi` | sí |
| `POST /sessions` + actions/keeper/por | sí |
| `POST /por/verify` | sí |
| `GET /sessions/:id/claims` | sí |

Auth partner real / API keys: **no** (SDK acepta Bearer futuro). Rate limit in-memory: **sí (demo)**.

### Frontend

- `/demo`, `/ops`, `/por`, `/integrate`, `/policy`, `/docs`, landing: **compilan**.
- Freighter / wallet connect: **no**.
- URL pública hackathon: **no desplegada** (README lo declara).

### Contratos

- `keel-vault`: deposit/transfer/settle/unwrap/exit/dispute/pause/`por` — tests + smoke testnet documentados.
- COVER Classic: clawback + remint smoke — **mecanismo claims**, no producto retail.
- Circle USDC real en vault: **stand-in TUSDC**; swap Circle documentado como pendiente.

### Supabase (`user-supabase-keel`) — audit 2026-10-25

| Item | Estado |
|------|--------|
| URL | `https://nllasdybyyxgvrtcsvjy.supabase.co` |
| Migración `001_keel_core` | **aplicada** (antes: 0 tablas / 0 migrations) |
| `keel_sessions` | existe, RLS on, 0 rows |
| `keel_claim_events` | existe, RLS on, 0 rows |
| `keel_por_snapshots` | existe, RLS on, policy read pública |
| Writes desde app | requieren `SUPABASE_SERVICE_ROLE_KEY` (o anon sin policies de write → fallará en silencio) |
| Advisor seguridad | `public.rls_auto_enable()` ejecutable por anon/authenticated (WARN preexistente, no de Keel) |
| Indexes | “unused” esperable con 0 rows |

---

## Roadmap vs realidad

Alineado a [`ROADMAP.md`](./ROADMAP.md):

- **Fase 0:** prácticamente cerrada (spec + demo + API + integrate + OpenAPI).
- **Fase 1:** fuerte en código/testnet; quedan auditoría scoped, Circle faucet wiring, Freighter.
- **Fase 2:** Safe Mode SDK + `/ops` hechos; faltan LOIs y métricas TVL/partners.
- **Fase 3–4:** Exit Pool real, settled-only DeFi, SEP draft — **no**.

Hackathon Genesis/Unlocked: pack docs + evidence **listos**; falta **repo público + demo URL o video** en el form ([`HACKATHON.md`](./HACKATHON.md)).

---

## Cómo correr (orden corto)

```bash
npm install
cp .env.example .env.local   # rellenar Supabase si quieres persistencia remota
npm run test:engine
npm run test:contracts
npm run build
npm run dev                  # :3847
```

Supabase ya tiene schema; sin keys en local el motor sigue funcionando file-backed.

---

## Próximos movimientos (prioridad)

1. Deploy URL pública (Vercel project name: `bind`) + pitch.
2. Counsel-reviewed ToS (hoy hay demo `TOS.md` / `COVER_SCHEDULE.md`).
3. Multisig arbiter + audit scoped antes de TVL real.
4. 1 LOI protocolo/wallet.
5. No lending/checkout/tokenomics; no cubrir exploits del partner en v1.

---

## Historial de esta memoria

| Fecha | Nota |
|-------|------|
| 2026-10-25 | Creación + migración Supabase + lint Next16. |
| 2026-10-25b | Hydrate store, claims API, KeelApi SDK, health persistence, Fuzz American Dynamism UI. |
| 2026-10-25c | `.env.local` live, smoke persist OK, demo/ops AD + audit trail, repo public push. |
| 2026-10-25d | Producto = **Bind**. `BIND_BUSINESS.md` (protocol cover, revenue, legales). Keel fuera de marca. |
| 2026-10-25e | Cutover UI Bind, TOS+Cover Schedule, caps engine, Safe Deposit SDK, /cover /terms. |
| 2026-10-25f | `/docs` hub Bind + `PITCH_FAQ.md` (1-sentence, clawback safety, FAQ defensa). |
| 2026-10-25g | Posición = seguro contratado por protocolos DeFi (`PROTOCOL_INSURANCE.md`); clawback solo ops. |
| 2026-10-25h | Retención sin KYC + Fast Lane + viabilidad LP (`RETENTION_SECURITY.md`); tiers 1–3. |
| 2026-10-25i | Ejecución Tier1/2: `retention.ts`, API profiles, demo lanes, `set_retention`. |
