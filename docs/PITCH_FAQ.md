# Bind — Pitch · 1 frase · FAQ de defensa

**Updated:** 2026-10-25

---

## 1 sentence

> **Bind is DeFi security insurance on Stellar:** protocols contract Bind so deposits sit in a timed retention window (e.g. 12h without KYC) with free exit blocked — if a breach hits that window, Bind indemnifies; KYC unlocks a faster lane; clawback is claims ops, not the brand.

Español (pitch):

> **Bind es seguro de seguridad para protocolos DeFi en Stellar:** el protocolo contrata Bind; sin KYC los fondos se retienen ~12h (sin unwrap/swap libre) para detectar ataques; si hay siniestro en esa ventana, Bind indemniza; con KYC, carril rápido y mejor atribución.

---

## Cómo resguardas a la persona (clawback + UX de seguridad)

Clawback **no** es “Bind te puede quitar el dinero cuando quiera”. Es un **mecanismo acotado** detrás de una póliza:

| Capa | Protección del usuario |
|------|-------------------------|
| **Opt-in** | Solo entra a cover quien elige Safe Mode / Safe Deposit |
| **Ventana `T`** | Solo saldos **unsettled** son reclamables; luego es finality |
| **Quién claim** | Sender original del lote (o partner firmado) — no un admin opaco al azar |
| **Qué clawback toca** | Solo el **lote** disputed del asset de cover Bind — no el USDC nativo de Circle en wallets ajenas |
| **Peg** | `vault ≥ supply`; recover = burn + remint, no “se lo queda ops” |
| **Política pública** | Cover Schedule + Claims Policy + caps (`maxClaimAmount`, open claims) |
| **Multisig / roles** | Freeze/recover/pause separados; prod = m-of-n + timelock |
| **Audit log** | Cada claim approve/reject queda registrado |
| **Exit consciente** | Si necesita liquidez antes de `T`, paga Exit fee (precio explícito del riesgo) |
| **Exclusiones claras** | No “seguro mágico” de hacks de Blend — eso se dice up-front |

**Frase corta para judges:**  
“Protocols buy Bind like insurance. Users get Protected Deposit. Clawback is the ambulance in the basement — not the storefront.”

### Amenazas que sí mitigamos vs las que no

| Amenaza | Mitigación Bind |
|---------|-----------------|
| Phishing / firma mala **durante** la ventana | Freeze + claim + clawback del lote |
| Fat-finger a destination wrong | Claim tipificado en política partner |
| Ladrón espera a settled | UX alerts + ventana corta/larga configurable; después = final |
| Admin malicioso clawback masivo | Multisig, roles, caps, PoR, audit; ToS + liability al vault |
| Hack del money market | **No cubierto** — Bind no finge ser mutual de smart-contract risk |

---

## Mejoras al modelo de negocio (para defenderlo)

### Tesis económica defendible

1. **Vendemos reducción de riesgo operacional de movimiento**, no yield.  
2. **Quien paga:** protocolo/wallet (bps + SaaS) + usuario impaciente (Exit fee).  
3. **Unit economics** no dependen de tokenomics: fees de uso.  
4. **Scope estrecho** = menos capital actuarial + menos lío regulatorio que “aseguramos todo DeFi”.

### Objeciones típicas → respuesta

| Pregunta | Respuesta corta |
|----------|-----------------|
| “¿Sois un stablecoin?” | No. Crédito cubierto 1:1 opt-in; unwrap a USDC. Circle sigue siendo el cash. |
| “¿Sois Blend?” | No. Blend presta. Bind cubre el tramo en tránsito / depósito protegido. |
| “¿Clawback da miedo?” | Solo sobre el asset de cover, solo unsettled, solo vía claim policy + multisig. Settled = final. |
| “¿Por qué no social recovery?” | Eso protege la key; Bind protege **después** de una tx firmada en ventana. Complementarios. |
| “¿Cubís el hack de Blend?” | No en v1. Cover Schedule lo excluye. Otro producto = mutual de SC risk. |
| “¿Cómo ganáis dinero?” | Cover fee B2B + Exit Pool + SaaS. No float yield como tesis. |
| “¿Regulación?” | Facility de recovery opt-in + ToS/exclusions/caps; counsel por jurisdicción. No fingimos FDIC. |
| “¿Por qué Stellar?” | Clawback L1 nativo + USDC + fees bajos → rail de claims realista para retail/partners. |
| “¿Qué pasa si el vault se vacía?” | Peg invariant + PoR; claims limitados al pool; pause. |
| “¿Adoption?” | Embed en protocolo/wallet; usuario final no instala otra app. |

### Palancas para fortalecer aún más el negocio

1. **Pricing por riesgo:** fee de cover sube si `T` es largo o partner tiene abuse rate alto.  
2. **Skin in the game del partner:** bond por claims frívolos.  
3. **Underwriting LP** (fase 2): terceros fondean Exit/Cover buffer a cambio de fees.  
4. **Settled-only hooks** para DeFi: composabilidad post-cover = distribución gratis.  
5. **Métricas que cierran el pitch:** % volumen partner, claims ratio, time-to-resolve, PoR always green.

---

## Checklist “listo para cualquier pregunta”

- [x] 1-sentence + anti-visión  
- [x] Cover Schedule (perilas / exclusiones / caps)  
- [x] Claims Policy  
- [x] ToS demo  
- [x] Motor settled/unsettled + PoR + Safe Deposit  
- [ ] Deploy URL pública  
- [ ] Counsel ToS  
- [ ] Multisig prod + audit  
- [ ] 1 LOI partner  
