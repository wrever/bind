# Bind — Modelo de negocio (seguro para protocolos DeFi)

**Producto:** **Bind**  
**Fecha:** 2026-10-25  
**Norte:** **seguro B2B contratado por protocolos DeFi** (Blend-like) — no money market, no pasarela, no “nuestro USDC”, no marca “clawback”.  
**Cliente que paga:** el **protocolo** (póliza institucional).  
**Beneficiario:** el usuario del protocolo (“Protected by Bind”).  
**Mecanismo Unlocked (ops):** clawback L1 como rail de indemnización — ver [`PROTOCOL_INSURANCE.md`](./PROTOCOL_INSURANCE.md).

> Esto no es asesoría legal. Es diseño de producto + estructura para que counsel pueda aterrizar jurisdicción.

---

## 1. Una frase

> **Bind is DeFi protocol insurance on Stellar:** protocols contract Bind; users get a timed claim window on deposits/transfers; Bind pays approved claims under the hood.

---

## 2. Qué vendemos (y qué no)

| Vendemos | No vendemos |
|----------|-------------|
| Cover opt-in (póliza = lote unsettled) | Lending / yield / TVL chase tipo Blend |
| Claims rail (freeze → resolve → clawback + remint) | “Nunca pierdes” / FDIC / seguro regulado sin licencia |
| PoR + política pública de siniestros | Un stablecoin de marca (“BindUSD”) |
| SDK/API para que **Blend-like** envuelva depósitos/transfers | App consumer como core |

### Rol de los tokens con clawback

Los tokens **COVER / bUSDC (nombre demo)** no son “la moneda de Bind”. Son:

1. **Crédito cubierto** 1:1 contra USDC en vault (`vault ≥ supply`).  
2. **Soporte del claim:** `AUTH_CLAWBACK_ENABLED` permite indemnizar sin inventar chargeback.  
3. **Estados:** unsettled (póliza viva) → settled (fin de cover) → unwrap a USDC.

Si el ladrón swapea o unwrappea settled, **el cover ya no alcanza** — eso es feature (finality), no bug. El negocio cobra la **prima por salir antes** (Exit Pool) y el **fee de cover** al protocolo.

---

## 3. Por qué Blend-like (y no “ser Blend”)

Blend resuelve **crédito / liquidez**. Bind resuelve **riesgo operacional de movimiento**:

| Evento en un money market | ¿Bind cubre? |
|---------------------------|--------------|
| Usuario deposita → share/receipt en tránsito / mis-sign | **Sí**, si el depósito/transfer va por Bind cover |
| Phishing que mueve saldo **cubierto unsettled** | **Sí**, claim en ventana `T` |
| Exploit del smart contract de Blend / bad debt / oracle | **No** (otro producto: mutual de smart-contract risk) |
| Liquidación legítima según reglas del protocolo | **No** (no revertimos liquidaciones) |
| Fondos ya settled / unwrapped a USDC | **No** |

**Integración típica con Blend-like**

```
User → Bind.wrap(USDC) → bUSDC settled
     → transfer/deposit hacia protocolo → receptor unsettled (ventana T)
     → si claim OK → clawback + remint al usuario
     → si no claim → settle → protocolo / usuario opera normal
     → unwrap settled → USDC
```

El protocolo puede:

- **A)** exigir deposits solo vía Bind Safe Mode (white-label), o  
- **B)** ofrecer toggle “Protected deposit” (opt-in del user), o  
- **C)** cubrir solo el **withdrawal / transfer out** (ventana post-salida).

Bind no compite por TVL de lending: cobra por **volumen cubierto** y **salidas anticipadas**.

---

## 4. Modelo de ingresos (apilable)

### Core (empezar aquí)

| Fuente | Quién paga | Mecánica | Orden de magnitud |
|--------|------------|----------|-------------------|
| **Protocol cover fee** | Blend-like / wallet | bps sobre TVL cubierto o sobre volumen deposit/transfer cubierto (ej. 2–15 bps) | Escala con partners |
| **Exit Pool fee** | Usuario que no espera `T` | 10–100 bps unsettled → liquidez | Precio explícito del riesgo |
| **SaaS / Safe Mode** | Partner | Flat mensual + overage por claims/API | Ingreso predecible |

### Secundario (después de confianza)

| Fuente | Nota |
|--------|------|
| **Claim bond / fee** | Anti-abuse; no revenue fantasy |
| **Underwriting LP** | Terceros ponen liquidez al Exit Pool / cover buffer; ganan fees (marketplace de riesgo) |
| **Wrap/unwrap spread** | 0–5 bps; bajo para adopción |

### Qué evitar al inicio

- Dependencia de **yield del float** del vault (conflicto de interés con “seguro”).  
- Tokenomics de governance token como negocio.  
- Prometer cover de **hack del protocolo** sin capital actuarial (eso es otro balance sheet).

### Unit economics (sketch)

- Partner cubre $10M volumen mensual de deposits/transfers.  
- Cover fee 5 bps → **$5k/mes** solo de ese partner.  
- 20% del unsettled sale por Exit Pool a 30 bps sobre $2M → **$6k/mes**.  
- 3 partners similares → runrate interesante **sin** ser el money market.

---

## 5. Legales / “cómo no quemarnos” (capa producto)

Bind puede **hablar de seguro** en pitch de producto, pero en contratos hay que separar:

| Capa | Lenguaje recomendado | Por qué |
|------|----------------------|---------|
| Marketing / hackathon | Transfer insurance / protocol cover | Clara |
| Terms / ToS | “Optional recovery facility”, “cover window”, “claim procedure” | Reduce promesa de *insurance company* |
| Exclusiones | Lista cerrada de perilas | Limita liability |

### Perilas cubiertas (v1)

1. Transfer/deposit **no autorizado** de créditos **unsettled** Bind (theft key / phishing / fat-finger tipificado).  
2. Solo dentro de ventana `T` y solo sobre el **lote** reclamado.  
3. Indemnización **acotada** al monto del lote y a la solvencia del vault/pool (`vault ≥ supply`).

### Exclusiones explícitas (v1)

- Exploit / bug / insolvencia del **protocolo partner** (Blend-like).  
- Oracle, liquidación, bad debt, depeg de assets que no sean el crédito Bind.  
- Fondos settled, unwrapped, o swapeados fuera del rail Bind.  
- Fraude del claimant (claim falso) → reject + sanctions de partner.  
- Force majeure / chain halt (definir).

### Controles que son “legales + ingeniería”

| Control | Estado hoy | Necesario prod |
|---------|------------|----------------|
| Política de claims pública | Demo `DISPUTE_POLICY.md` | Firmada con partners + SLA |
| Cap por claim / por día / por partner | Parcial (rate limits demo) | Hard caps on-chain + ops |
| Multisig arbiter | Mock roles | m-of-n + timelock |
| Audit log claims | Supabase `keel_claim_events` | Público + retención |
| PoR | Demo + on-chain `por()` | Dashboard + attestation |
| ToS + Cover Schedule + Privacy | **Falta** | Counsel |
| Entity (quién es el “underwriter”) | **Falta** | LLC/association + jurisdiction |
| Segregar “Bind Cover Pool” vs treasury | **Falta** | Contable |
| Disclaimer “not regulated insurance” | **Falta** | En UI + integrate |

### Forma jurídica (orientación, no consejo)

Opciones típicas que counsel evalúa:

1. **Tech + facility:** Bind Software provee software; el **partner** es face-to-user; Bind opera el vault bajo ToS de “recovery facility”.  
2. **Mutual / pool:** LPs del Exit/Cover Pool asumen riesgo a cambio de fees (más “Nexus-like”, más compliance).  
3. **Licencia de seguros** — solo si prometen cover amplio (hack de protocolo, etc.) en jurisdicción que lo exija.

Para v1 protocol-cover **estrecho** (ventana de transfer), (1) suele ser el camino más corto: **no fingir ser aseguradora full-stack**.

---

## 6. Relación Bind ↔ tokens clawback ↔ usuario

```
USDC (Circle)     →  vault Bind (custodia 1:1)
                  →  bUSDC / COVER credit (clawback-enabled)
Usuario / Protocolo
  unsettled = póliza viva (claimable)
  settled   = fin de cover (composable / unwrap)
Claim approve     →  clawback L1 + remint settled al claimant
```

**Para el usuario de Blend:** no “compra un token Bind de investment”; **opta a depósito/transfer protegido**.  
**Para el protocolo:** reduce chargebacks sociales y phishing en la última milla sin rediseñar el money market.

---

## 7. Qué nos falta (prioridad Bind)

### Ya tenemos (motor)

- Settled/unsettled engine, API, PoR, claims demo, COVER clawback smoke, vault testnet, Supabase audit, repo público.

### Falta para “negocio real”

| # | Item | Por qué |
|---|------|---------|
| 1 | ~~Rename producto → Bind~~ | **Hecho** (UI/README; IDs `keel_*` internos OK) |
| 2 | ~~Cover Schedule + ToS demo~~ | **Hecho** (`COVER_SCHEDULE.md`, `TOS.md`) — falta counsel |
| 3 | **Entity + counsel** (1 jurisdicción) | Quién firma SLA |
| 4 | ~~Caps engine~~ | **Hecho** off-chain; on-chain vault parity pendiente |
| 5 | **Multisig arbiter prod** | Confianza |
| 6 | ~~Safe Deposit adapter~~ | **Hecho** (`safe-deposit.ts` + SDK) |
| 7 | **1 LOI** wallet o protocolo | Prueba de mercado |
| 8 | **Deploy URL** + pitch Bind | Hackathon / sales |
| 9 | **Audit scoped** | Antes de TVL real |
| 10 | Claridad marketing clawback = rail | En copy Bind |

### Fuera de scope (rechazar)

- Token de governance como revenue.  
- Asegurar exploits de Blend.  
- Checkout merchant.  
- Rebrand bUSDC como stablecoin de consumo.

---

## 8. Pitch corto (judges / partners)

**Problema:** Stellar (y DeFi) finalizan en segundos; phishing y mis-sign no tienen chargeback. Protocolos tipo Blend absorben el dolor reputacional.  
**Solución:** Bind — cover opt-in con ventana de claim; clawback Stellar ejecuta la indemnización.  
**Quién paga:** el protocolo/wallet (bps + SaaS) y el usuario impaciente (Exit fee).  
**Por qué Unlocked:** issuance + clawback nativo = claims rail, no el producto.

---

## 9. Decisión de naming

| Antes | Ahora |
|-------|-------|
| Keel | **Bind** |
| “Recoverable rails” headline | **Protocol / transfer cover** |
| Clawback como marca | Clawback = **mecanismo** |
| Repo/código `keel` | Migración gradual (IDs internos pueden seguir `keel_*` hasta cutover) |
