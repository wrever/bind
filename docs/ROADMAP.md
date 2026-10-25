# Keel — Roadmap

Estado alineado a [`VISION.md`](./VISION.md).  
Revisión operativa: [`MEMORIA.md`](./MEMORIA.md) · **actualizado 2026-10-25**.  
Leyenda: `[x]` hecho · `[~]` en curso · `[ ]` pendiente

---

## Fase 0 — Spec + demo (ahora)

- [x] Tesis producto / negocio (`CLAW_PRODUCT.md`)
- [x] Playbook infra (`CLAW_INFRA_PLAYBOOK.md`)
- [x] Visión canónica (`VISION.md`)
- [x] Motor settled/unsettled (TS)
- [x] Demo console + PoR + landing
- [x] SDK surface `@keel/sdk`
- [x] Scaffold contrato Soroban
- [x] Política de disputes publicada
- [x] API HTTP demo `/api/v1/*` (para partners)
- [x] Página `/integrate` (B2B, no checkout)
- [x] Threat model v1 en docs
- [x] OpenAPI servida en `/api/v1/openapi`

## Fase 1 — Credibilidad técnica

- [x] Motor endurecido: pause, maxSupply, settle_all, fee accounting
- [x] Keeper HTTP `POST /api/v1/sessions/:id/keeper/settle`
- [x] Persistencia demo sessions (`.data/sessions.json`)
- [x] `keel-core` Rust parity + tests
- [x] `keel-vault` Soroban (`soroban-sdk` 25) + tests (deposit/settle/exit/dispute)
- [x] Roles arbiter: admin / pauser / recoverer / freezer (engine + API)
- [x] Rate limits demo (dispute / transfer / resolve)
- [x] PoR firmado HMAC + `POST /api/v1/por/verify`
- [x] Multisig mock / threshold docs (`MULTISIG.md`)
- [x] CI GitHub Actions (node + rust)
- [x] Runbook testnet + scripts deploy/issuer (`TESTNET.md`, `build:vault`)
- [x] Deploy vault **testnet** + direcciones (`testnet.addresses.json`, smoke pass)
- [x] TUSDC SAC stand-in (Circle USDC swap opcional)
- [x] Framing **transfer insurance** (Genesis / Unlocked) — clawback = claims rail
- [x] COVER issuer `AUTH_CLAWBACK_ENABLED` + claim smoke (`testnet:cover`)
- [x] Hackathon pack (`HACKATHON.md`, `demo:hackathon`)
- [x] PoR on-chain `por()` leído en testnet (+ HMAC demo off-chain)
- [x] Nota Chainlink: útil later, no core (`CHAINLINK.md`)
- [x] Schema Supabase `001_keel_core` aplicado (sessions / claims / por)
- [x] Hydrate sessions desde Supabase + claims API + PoR snapshots
- [x] SDK HTTP `KeelApi` + health persistence readout
- [x] UI American Dynamism (Fuzz) — landing/header/CTA
- [ ] `.env.local` service role en cada deploy
- [ ] Auditoría scoped (antes de TVL real)
- [ ] Circle USDC faucet wiring (swap SAC)
- [~] Freighter / partner wallet connect (identity + network on `/demo` + `/integrate`; cover signing TBD)
- [ ] Deploy demo URL pública (submit hackathon)

## Fase 2 — Design partners

- [ ] 2 LOIs (wallet + neobank/remesa)
- [x] Safe Mode SDK embebible (`safeModeSnapshot` + `useSafeMode`)
- [x] Ops console arbiter (`/ops`, no retail)
- [ ] Métricas: TVL, recovers, % volumen partner

## Fase 3 — Liquidez + DeFi

- [ ] Exit Pool con liquidez real (no solo sim)
- [ ] 1 protocolo settled-only
- [x] Caps / rate limits / pause (demo; prod on-chain pendiente)
- [ ] Chainlink Data Feeds opcional (pricing DeFi / PoR externa) — ver `CHAINLINK.md`

## Fase 4 — Estándar abierto

- [ ] Interfaz `RecoverableAsset` / draft SEP
- [ ] Multi-asset (EURC…)
- [ ] Gobernanza arbiter progresiva

## Fuera de roadmap (rechazar)

- Checkout merchant genérico
- App de remesas propia
- Lending / yield como producto core
- Tokenomics de governance token prematuro
