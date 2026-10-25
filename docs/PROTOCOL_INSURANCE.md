# Bind como seguro contratado por protocolos DeFi

**Updated:** 2026-10-25  
**Posición:** Bind es **el seguro / capa de seguridad** que un money market (p.ej. Blend-like) **contrata** — y que protege a **consumidores** vía ese protocolo.  
**Mecánica estrella:** retención (ej. 12h sin KYC) + bloqueo de unwrap/swap libre; si hay brecha en ventana → claim + indemnización.  
**No es** el headline “clawback product”. Clawback = back-office.  
**Viabilidad / tiers:** [`RETENTION_SECURITY.md`](./RETENTION_SECURITY.md).

---

## Cómo se ve (historia de producto)

```
┌─────────────────────────────────────────────────────────┐
│  PROTOCOLO DEFI (Blend-like)                            │
│  · Prestamos / liquidez / yields                        │
│  · Contrata Bind Cover (póliza institucional)           │
│  · UI: “Protected deposit · covered by Bind”            │
└───────────────────────────┬─────────────────────────────┘
                            │ prima (bps / SaaS)
                            ▼
┌─────────────────────────────────────────────────────────┐
│  BIND — asegurador de movimiento                        │
│  · Emite póliza = lote unsettled (ventana T)            │
│  · Pool + PoR (solvencia)                               │
│  · Claims desk (freeze → resolve)                       │
│  · Indemnización on-chain (clawback + remint) ← oculto  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
                     Usuario final
              “Mi depósito está protegido X horas”
```

El usuario **no compra clawback**. El protocolo **compra Bind**. El usuario **recibe protección** como feature del protocolo.

---

## 1 sentence (este enfoque)

> **Bind is DeFi protocol insurance on Stellar:** protocols like Blend contract Bind to wrap deposits and transfers in a timed claim window — so users get “protected in transit,” and Bind settles approved claims under the hood.

ES:

> **Bind es el seguro que contratan los protocolos DeFi en Stellar:** Blend-like paga una prima; sus usuarios obtienen depósitos/movimientos con ventana de claim; Bind liquida siniestros aprobados (clawback queda en ops, no en el marketing).

---

## Qué “póliza” compra el protocolo

| Producto Bind | Qué cubre | Qué no |
|---------------|-----------|--------|
| **Safe Deposit Cover** | Depósito/transfer hacia el protocolo mientras unsettled | Hack del SC del protocolo |
| **Transfer Cover** | Movimientos P2P / withdraw path en ventana T | Liquidaciones legítimas |
| **Partner Safe Mode** | White-label en wallet que mete liquidez al protocolo | Oracle / bad debt |

**Prima:** bps sobre volumen cubierto o TVL bajo póliza + fee SaaS de claims API.  
**Siniestro:** phishing / theft / fat-finger tipificado en Cover Schedule.  
**Indemnización:** remint settled al asegurado; ejecución técnica puede usar clawback L1 **sin** decirle al retail “tenemos clawback”.

---

## Por qué un Blend-like firmaría

1. **Retención / confianza:** “Protected by Bind” reduce miedo a phishing en onboarding.  
2. **No construyen claims desk:** Bind trae política, caps, PoR, ops.  
3. **No compiten por ser aseguradora:** ellos siguen siendo el money market.  
4. **Coste predecible:** prima vs absorber reputación de “me hackearon al depositar”.  
5. **Composable:** settled-only después de la ventana → el protocolo opera normal.

---

## Lenguaje front vs back

| Cara al protocolo / usuario | Cara a engineers / Unlocked |
|----------------------------|-----------------------------|
| Seguro / cover / póliza / prima / siniestro | Vault, unsettled lot, clawback, SAC |
| “Protected deposit” | `safeDeposit()` |
| “Claim filed” | freeze + dispute |
| “Claim paid” | remint settled (+ clawback burn under the hood) |

**Regla de marca:** en landing y pitch partner, **primero seguro para protocolos**; clawback solo en docs técnicos / track Unlocked.

---

## Objeción “entonces ¿aseguráis el TVL de Blend?”

No. Aseguráis el **tramo de movimiento / depósito cubierto** bajo Schedule.  
Exploit del protocolo = **excluido** (otro producto: mutual de smart-contract risk).  
Eso es una fortaleza: scope vendible y capitalizable sin fingir Nexus Mutual day one.

---

## Go-to-market (1 slide)

1. Protocolo firma Cover Agreement (prima + caps + SLA).  
2. Integra Safe Deposit SDK.  
3. Toggle “Bind Protected” en deposit UI.  
4. Bind opera claims; protocolo no toca issuer keys.  
5. PoR público + audit log → confianza compartida.

Revenue = **prima del protocolo** (core) + Exit fee usuario (secundario).
