# Keel — Threat model (v0)

**Updated:** 2026-10-25

## Activos

| Activo | Impacto si se pierde |
|--------|----------------------|
| USDC en vault | Pérdida de peg / insolvencia |
| Issuer / clawback keys | Recover malicioso o DoS de usuarios |
| Arbiter keys | Approves falsos |
| Estado settled/unsettled | Contabilidad rota |
| Confianza / PoR | Bank run del wrap |

## Amenazas principales

1. **Admin rug / key compromise** — Mitigar: multisig m-of-n, timelock, pause, ceremony de keys.  
2. **Unwrap race tras robo** — Mitigar: unsettled window + unwrap solo settled.  
3. **False disputes** — Mitigar: bonds, evidencia, appeals, rate limits.  
4. **Exit Pool drain / illiquidity** — Mitigar: caps, fees dinámicos, capital semilla.  
5. **Peg break (bug contable)** — Mitigar: invariant asserts, fuzz tests, auditoría.  
6. **Issuer abuse narrative** — Mitigar: política pública, opt-in, audit log.  
7. **Regulatory seizure of vault** — Mitigar: estructura legal, segregación, disclosure.

## Fuera de alcance (v0)

- MEV / ordering attacks cross-DEX (rUSDC no es AMM core)  
- Seguridad de wallets partners (su superficie)  
- Circle / USDC issuer compromise  

## Controles ya en demo

- Roles `pauser` / `recoverer` / `freezer` / `admin` — **strings demo**; actor **obligatorio** en freeze/resolve/pause (sin default silencioso)
- Rate limit dispute / transfer / resolve / pause / faucet / session_create (in-memory; 429)
- Session ids `crypto.randomUUID()`; `windowMs` clamp; KYC no self-attest por body
- PoR HMAC — si usa secreto demo, respuesta marca `demo: true` (no es attestation de custodia)
- Pause + supply cap + peg assert en motor
- Headers Next: nosniff, frame deny, CSP básica
- Vault Soroban: `require_auth` real (stack **separado** de `/api/v1`)

## Honestidad de seguridad (2026-10-25)

`/api/v1` es un **simulador de sesión**, no el rail de custodia. Cualquiera con `sessionId` puede jugar deposit/transfer/dispute. Ops roles son spoofables si conoces los nombres (`ops_recoverer`). La confianza de dinero debe vivir en **`keel-vault` + multisig**, no en esta API. `BIND_STRICT=1` desactiva faucet y exige `KEEL_POR_SECRET`.

## Controles demo vs prod

| Control | Demo | Prod |
|---------|------|------|
| Peg assert | sí (engine + vault) | sí + monitors |
| Multisig | roles mock + docs | obligatorio on-chain |
| API auth | abierta + actor string | API keys + firmas Stellar |
| Audit log | event log local | indexado público |
| Caps TVL | `maxSupply` + rate limits | sí on-chain |
| Signed PoR | HMAC demo (marcado) | attestation on-chain |
| Legal ToS | draft | firmado partners |
| API ↔ vault | **no cableado** | una sola fuente de verdad |
