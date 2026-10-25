# Bind — Memoria operativa

**Actualizado:** 2026-10-25 (noche — risk board hackathon)  
**Producto:** **Bind** (paths de código pueden seguir en `keel/`)  
**Autor git:** `wrever` · AI tooling: [`AI_ATTRIBUTION.md`](./AI_ATTRIBUTION.md)  
**Repo:** https://github.com/wrever/bind (**debe ser público** antes del submit)  
**Norte:** [`VISION.md`](./VISION.md) · [`BIND_BUSINESS.md`](./BIND_BUSINESS.md) · [`ROADMAP.md`](./ROADMAP.md)

---

## Snapshot

| Capa | Estado | Evidencia |
|------|--------|-----------|
| Vault LIVE | **CDGNKK…KZIJ** | created **2026-10-25** 21:10 UTC |
| COVER clawback | **Lista** | 2026-10-25 ~11:18 UTC |
| Dual-track | **Lista** | `/demo` sim · `/live` Freighter · `/por` |
| DocsSite + llms.txt | **Lista** | EN/ES/PT |
| Faucet + resolve ops | **Lista en main** | `/api/v1/chain/faucet`, `/tx/resolve` |
| `testnet:e2e` | **Verde** | mint→dispute→resolve→settle→unwrap |
| Repo público | **Hecho** | https://github.com/wrever/bind |
| Deploy prod | **Hecho** | https://bind-beta.vercel.app · vault `CDGNKK…` · faucet OK |
| Tx proof in README | **Hecho** | e2e 2026-10-25 22:58 UTC · links en README + EVIDENCE |

---

## Risk board (jurado) → mitigación

| Riesgo | Sev | Estado ahora | Acción restante |
|--------|-----|--------------|-----------------|
| Repo privado | Crítica | Detectado `private: true` | `gh repo edit --visibility public` + accept |
| Sin atribución IA | Alta | **Mitigado** | [`AI_ATTRIBUTION.md`](./AI_ATTRIBUTION.md) + README/HACKATHON |
| Sin txs documentadas | Alta | **Mitigado** | README + EVIDENCE con vault + 8 txs e2e explorables |
| Deploy ≠ repo | Alta | **Mitigado** | `bind-beta` en commit reciente + env BIND_* + faucet prod OK |
| Vaults inconsistentes | Media | **Mitigado** | prod `/chain/por` → `CDGNKK…` fullyBacked |
| Jurado no completa `/live` | Media | **Mitigado en prod** | faucet+trustline + `NEXT_PUBLIC_BIND_OPS_TOKEN` en Vercel |
| Demo principal simulada | Media | **Honesto** | `/health` expone `tracks.simulator` vs `tracks.chain` |
| Claim centralizado | Media | **Declarado** | single arbiter secret; multisig en roadmap |
| Higiene | Baja | **Parcial** | LICENSE MIT; curl `$HOST`; ops token vacío en `.env.example`; health `service: bind` |

**A favor (mantener en pitch):** COVER clawback 25 Oct; vault con roles/pause/dispute/exit/PoR + tests; PoR on-chain; docs trilingües.

---

## Testnet canónico

```bash
npm run testnet:sync-env
npm run testnet:smoke
npm run testnet:e2e
```

| Check | Resultado |
|-------|-----------|
| Vault `CDGNKK…` | ✅ LIVE |
| Smoke + e2e | ✅ |

---

## Cómo correr

```bash
npm install
cp .env.example .env.local
npm run testnet:sync-env   # secrets locales faucet/resolve/e2e
npm run dev                # :3847 → /en/live
```

---

## Próximos movimientos (orden submit)

1. **P0 seguridad:** rotar token Vercel (quedó expuesto en chat) y rotar `BIND_OPS_TOKEN` si el form es público.
2. **P1:** re-correr `npm run testnet:e2e` antes del submit y pegar hashes frescos en README si hace falta.
3. **P1:** prefund wallet Freighter del presentador; multisig arbiter.
4. **P2:** Circle USDC; partner API keys; unificar sessions≠vault (dual-track OK).

---

## Historial

| Fecha | Nota |
|-------|------|
| 2026-10-25u | P0 perfection vault CDGNKK + e2e |
| 2026-10-25v | (hist) vault live CDGNKK |
| 2026-10-25w | Risk board: AI_ATTRIBUTION, LICENSE, health tracks, hygiene curl/ops token |
| 2026-10-25x | Vercel `bind-beta`: env BIND_* + redeploy; faucet prod OK; repo público. |
| 2026-10-25y | Blindaje Unlocked: `UNLOCKED.md`, dual-track copy, landing unlockLine, ARCHITECTURE/HACKATHON. |
| 2026-10-25z | Frontend copy alineado a visión (Unlocked + dual-track + insurance lock); limpia de em dashes `—` en i18n/DocsSite/UI. |
| 2026-10-25aa | E2E firmado documentado en README (vault + 8 txs explorer); foco proof on-chain. |
| 2026-10-25ab | Live UX: exige Freighter Testnet, muestra link vault CDGNKK; Freighter copy ya no dice “solo identity”. |
| 2026-10-25ac | Quita ruido vault antiguo / prior-work de README y docs; foco solo CDGNKK. |
| 2026-10-25aa | Video demo flow Remotion: `public/bind-demo-flow.mp4` + `npm run demo:render`. |
