# Bind — Claims Policy (v0 · demo)

**Updated:** 2026-10-25

Política de **siniestros / claims** sobre saldos **unsettled** (pólizas en ventana `T`).  
Producto = **Bind** protocol/transfer cover. Mecanismo de indemnización en testnet Unlocked = clawback L1 + remint.

En producción, el arbiter será multisig / tribunal con SLA contractual a partners.  
Detalle de perilas/exclusiones y negocio: [`BIND_BUSINESS.md`](./BIND_BUSINESS.md).

## Alcance

- Solo aplica a saldos **unsettled** (cover activo) dentro de la ventana `T`.
- **Settled** covered credit y USDC libre **no** son reclamables.
- **No** cubre exploits/insolvencía del protocolo partner (Blend-like).
- Opt-in: quien usa Bind acepta estas reglas.

## Quién puede abrir un claim

- El **sender original** del lote (`lot.from`), mientras siga unsettled.
- El partner (wallet) puede abrir en nombre del usuario vía API firmada (fase partners).

## Evidencia mínima (prod)

1. Address del claimant y del holder  
2. `lot_id` / tx hash del transfer  
3. Motivo tipificado: `theft_key` | `phishing` | `fat_finger` | `other`  
4. Timestamp y, si aplica, reporte del partner  

En **demo**, basta motivo texto + freeze del lote.

## SLA (objetivo prod)

| Paso | Tiempo |
|------|--------|
| Freeze tras open | inmediato on-chain |
| Primera revisión | ≤ 24h |
| Resolución | ≤ 72h (casos simples) |
| Appeal | 1 vez, ≤ 5 días |

## Resoluciones

| Decisión | Efecto |
|----------|--------|
| **Approve** | Cierra la póliza unsettled en el holder; indemniza **settled** al claimant (vault) y ejecuta **clawback L1** del COVER asset cuando aplica |
| **Reject** | Unfreeze; sigue el reloj de settle |

La indemnización **nunca** mueve fondos a una hot wallet opaca: o se remintea al claimant, o se libera el freeze.

## Anti-abuse

- Bond / fee de claim en prod  
- Rate limit por address / partner  
- Claims frívolos → cooldown  
- Audit log público de approve/reject (sin PII)

## Lo que Bind no cubre

- Fondos ya **settled** o unwrapped a USDC  
- Valor ya swapado fuera del cover  
- Errores de UX del partner fuera de ventana  
- Pérdida de keys sin transfer unsettled asociado  
- Hack / bug / bad debt / oracle del protocolo partner  
- Liquidaciones legítimas del money market  

## Contacto ops (placeholder)

`ops@bind.local` · Discord partner channel · runbook interno
