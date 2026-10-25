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
| Vault LIVE (evento) | **CDGNKK…KZIJ** | created **2026-10-25** 21:10 UTC |
| Vault prior (retirado) | **CCQEAW…HL5J** | created **2026-10-18** — ver [`PRIOR_WORK.md`](./PRIOR_WORK.md) |
| COVER clawback | **Lista** | 2026-10-25 ~11:18 UTC |
| Dual-track | **Lista** | `/demo` sim · `/live` Freighter · `/por` |
| DocsSite + llms.txt | **Lista** | EN/ES/PT |
| Faucet + resolve ops | **Lista en main** | `/api/v1/chain/faucet`, `/tx/resolve` |
| `testnet:e2e` | **Verde** | mint→dispute→resolve→settle→unwrap |
| Repo público | **Pendiente** | API GitHub: `private: true` |
| Video / deck | **Pendiente** | no hay Loom/deck en repo |
| Deploy = main | **Acción** | redeploy Vercel tras push; health debe reportar `tracks.chain` |

---

## Risk board (jurado) → mitigación

| Riesgo | Sev | Estado ahora | Acción restante |
|--------|-----|--------------|-----------------|
| Repo privado | Crítica | Detectado `private: true` | `gh repo edit --visibility public` + accept |
| Prior work mal declarado | Crítica | **Mitigado en docs** | PRIOR_WORK + EVIDENCE + `retiredPrior` JSON; vault live = 25 Oct |
| Sin atribución IA | Alta | **Mitigado** | [`AI_ATTRIBUTION.md`](./AI_ATTRIBUTION.md) + README/HACKATHON |
| Sin video ni deck | Alta | **Abierto** | Grabar Loom 2–3 min: landing → demo → live faucet → por |
| Deploy ≠ repo | Alta | Código faucet/e2e **ya en main** local; Vercel puede estar stale | Push + redeploy; verificar `/api/v1/chain/por` → `CDGNKK…` |
| Vaults inconsistentes | Media | **Local OK** (JSON + API leen CDGNKK) | Si prod muestra CCQEAW → redeploy; no mezclar retired |
| Jurado no completa `/live` | Media | Faucet + trustline en UI | Prod necesita `BIND_*` + `NEXT_PUBLIC_BIND_OPS_TOKEN` (demo) o faucet pre-mint a wallet juez |
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
| Prior `CCQEAW…` | retired only |
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

1. **P0:** repo **público** + push + **redeploy Vercel** (mismas env BIND_* / vault CDGNKK).
2. **P0:** video Loom (script en HACKATHON.md) + link en form.
3. **P1:** faucet prod con token rotado o prefund wallet Freighter del pitch.
4. **P2:** multisig arbiter; Circle USDC; unificar sessions≠vault (seguir dual-track).

---

## Historial

| Fecha | Nota |
|-------|------|
| 2026-10-25u | P0 perfection vault CDGNKK + e2e |
| 2026-10-25v | Prior disclosure CCQEAW vs CDGNKK |
| 2026-10-25w | Risk board: AI_ATTRIBUTION, LICENSE, health tracks, hygiene curl/ops token |
