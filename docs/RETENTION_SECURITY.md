# Bind — Retención, KYC y viabilidad ante ataques

**Updated:** 2026-10-25  
**Idea del founder:** capa de seguridad / seguro para **consumidores y protocolos**; retener fondos un tiempo (ej. 12h) si no hay KYC; si hay brecha, detectar y ejecutar indemnización (clawback bajo el capó); con KYC, atribución del atacante es más fácil.

> Análisis de viabilidad de producto + diseño. No es asesoría legal ni promesa de recuperar todo TVL robado en cualquier escenario.

---

## 1. La idea en una frase

> Bind retiene créditos cubiertos el tiempo suficiente para detectar abuso; bloquea salida (unwrap/swap) durante esa ventana; si hay siniestro, indemniza al usuario/protocolo — con KYC la investigación es más fuerte, sin KYC la retención es el control primario.

---

## 2. ¿Es buena idea hipotética? **Sí — con el perímetro correcto**

### Lo que SÍ es sólido (Tier 1 — core Bind)

| Mecánica | Viabilidad | Por qué |
|----------|------------|---------|
| Retener **créditos Bind** 12h (unsettled) sin KYC | **Alta** | Es exactamente settled/unsettled: no unwrap a USDC libre hasta `T` |
| “Bloqueo de swap” durante retención | **Alta** | No hace falta “pausar Stellar”: solo **settled** es transferable a DEX / solo settled entra a pools externos; unsettled no sale del rail |
| Clawback si el saldo robado **sigue siendo** asset Bind unsettled/frozen | **Alta** | `AUTH_CLAWBACK_ENABLED` + claim policy |
| Protocolo contrata Bind; usuario ve “Protected” | **Alta** | Modelo B2B ya definido |
| KYC → ventana más corta / límites más altos / mejor attribution | **Alta** | Producto “Fast Lane”, no requisito universal |

Esto **protege al protocolo** sin ser “KYC obligatorio para todos”: los anónimos pagan en **tiempo** (retención); los verificados pagan en **identidad** (menos fricción).

### Lo que es débil si se vende mal (Tier 3 — “cualquier ataque a LP”)

| Escenario | ¿Clawback solo lo resuelve? | Realidad |
|-----------|----------------------------|----------|
| Phishing mueve **Bind credit unsettled** | Sí | Core |
| Atacante swapea Bind → XLM/USDC **antes** del freeze | Parcial | Por eso retención + block unwrap/swap **antes** de settle |
| Exploit drena **USDC nativo** del pool Blend (nunca fue Bind) | **No** | Circle USDC no es clawbackeable por Bind |
| Fondos ya bridged / cash-out off-ramp | **No** on-chain | Hace falta **pool de underwriting** (seguro clásico) o recovery legal con KYC |

**Conclusión:** “El dinero robado vuelve a nuestras manos” es **verdad** solo mientras el valor siga dentro del **perímetro Bind** (crédito con clawback + no settled).  
Para “ataque a liquidity pools” en general, Bind debe:

1. **Prevenir salida** con retención (Tier 1), y/o  
2. **Asegurar con capital** (Tier 3: prima alta, caps, underwriters) — no fingir que clawback alcanza USDC ya fugado.

---

## 3. Modelo de dos velocidades (sin KYC vs con KYC)

```
Depósito / transferencia → crédito BIND
        │
        ├─ Sin KYC  → Retención T = 12h (configurable)
        │              · No unwrap
        │              · No swap a assets libres (solo settled permitido en DEX)
        │              · Monitoring / claim window
        │              · Breach detectado → freeze → claim → clawback/remint
        │
        └─ Con KYC  → Fast Lane T = 1–2h (o límites mayores)
                       · Misma mecánica
                       · Attribution + legal recovery si el atacante casheó fuera
                       · Partner puede exigir KYC para high-value
```

| | Sin KYC | Con KYC |
|--|---------|---------|
| Control principal | **Tiempo** (retención) | Identidad + tiempo corto |
| UX | Más espera | Más velocidad |
| Si atacante fuga off-rail | Difícil recovery on-chain | Demanda / LE / bans + posible payout del pool |
| Quién paga prima | Protocolo (siempre) | Igual; usuario high-tier puede fee menor |

**Retención ≠ custodia opaca:** es un **bloqueo de finality** (unwrap/swap) documentado en Cover Schedule — el usuario sabe “protegido 12h”.

---

## 4. Cómo “bloquear swap” sin magia

Opciones compatibles con Stellar:

1. **Regla de producto (recomendado v1):** solo créditos **settled** pueden ir a DEX / liquidity pools externos. Unsettled solo se mueve dentro de Bind / partner whitelist.  
2. **AUTH / clawback asset:** issuer puede limitar paths; unsettled accounting en Soroban vault.  
3. **Partner integration:** Blend-like solo acredita shares tras `safeDeposit` y no lista unsettled en AMM.

La retención **es** ese bloqueo: protege al protocolo porque el atacante **no puede** liquidar el cover credit a USDC libre al instante.

---

## 5. Ataques a LP — cómo encajarlos en el seguro

### Camino A — Prevención (Bind fuerte hoy)

Toda liquidez “protegida” entra como Bind Safe Deposit → 12h unsettled → si hay drain pattern / dispute, clawback del credit **antes** de que sea settled.  
El protocolo **no** pone USDC desnudo en riesgo de salida inmediata sin ventana.

### Camino B — Indemnización post-exploit (seguro clásico)

Si el pool ya perdió USDC nativo:

- Bind **no clawbackea** ese USDC.  
- Bind **paga** a víctimas desde un **Cover Pool / underwriting** (primas + LPs).  
- Requiere: caps por incidente, exclusiones, capital, quizás KYC para claims grandes.  
- Producto aparte: **Protocol Incident Cover** (Tier 3).

### Camino C — Híbrido (pitch defendible)

> “Bind Secure Mode: 12h retention on covered deposits (no KYC required). Fast Lane with KYC. Optional Incident Cover for protocol drains — underwritten capital, not magic clawback.”

---

## 6. Detección de brecha (qué hace creíble el “si hay ataque, clawback”)

Señales (ops + on-chain), no solo “alguien dijo robo”:

- Spike de transfers unsettled a addresses nuevas  
- Intentos masivos de exit pool  
- Partner alert / circuit breaker  
- Claim del sender + freeze inmediato  
- Freeze ops (freezer role) bajo política  

Con **KYC** del beneficiario o del actor high-risk: correlación off-chain (device, cuenta) → mejor reject de claims falsos y persecución del atacante.

---

## 7. Implicaciones legales (alto nivel)

- Retención 12h sin KYC: presentar como **cover window / risk delay**, no “freeze arbitrario”.  
- KYC: el **partner** suele ser el regulated face; Bind recibe attestation / claim packages.  
- “Recuperamos cualquier ataque a LP”: **no** afirmarlo sin Tier 3 capitalizado.  
- Counsel para MSB/insurance language por jurisdicción.

---

## 8. Decisión de producto (working)

| Tier | Nombre | Estado |
|------|--------|--------|
| **1** | Retention Cover (12h default sin KYC; block unwrap/swap) | **Live en motor + demo** (`retention.ts`, `/demo` lanes) |
| **2** | KYC Fast Lane | **Live** (perfil `kyc_fast_lane` + attestation gate) |
| **3** | Protocol Incident Cover (LP/SC drain payout) | **Roadmap — underwriting** |

### Ejecución en código

- Profiles: `src/lib/keel/retention.ts`  
- `applyRetentionProfile` / `createInitialState({ retentionProfile })`  
- API: `POST /api/v1/sessions` body `{ retentionProfile, kycAttested, demoMode }`  
- Action: `set_retention`  
- Demo UI: toggle **No KYC · 12h** / **KYC Fast Lane** (reloj comprimido)

Motor unsettled/settle/clawback = **Tier 1**.  
No abandonar el core por prometer Tier 3 sin pool.

---

## 9. Respuesta corta a “¿y el dinero vuelve?”

- **Si sigue en Bind unsettled:** sí — freeze + clawback + remint al asegurado/protocolo.  
- **Si ya salió a USDC libre / bridge:** clawback no alcanza; o hay **payout del pool** (Tier 3) o recovery legal (KYC).  
- Por eso la retención de 12h **es** la idea buena: maximiza el % de valor que aún está clawbackeable.
