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

- Roles `pauser` / `recoverer` / `freezer` / `admin` en acciones ops (403 si no)
- Rate limit en dispute / transfer / resolve (429)
- PoR con HMAC-SHA256 verificable vía `/api/v1/por/verify`
- Pause + supply cap + peg assert en motor

## Controles demo vs prod

| Control | Demo | Prod |
|---------|------|------|
| Peg assert | sí (engine + vault) | sí + monitors |
| Multisig | roles mock + docs | obligatorio on-chain |
| Audit log | event log local | indexado público |
| Caps TVL | `maxSupply` + rate limits | sí on-chain |
| Signed PoR | HMAC demo | attestation on-chain |
| Legal ToS | draft | firmado partners |
