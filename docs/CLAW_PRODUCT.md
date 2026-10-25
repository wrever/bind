# Bind — Modelo de producto (legado técnico)

**Nombre de producto:** **Bind** (antes “Keel”)  
**Asset demo:** créditos cubiertos / `rUSDC` · claims rail COVER  
**Fecha:** 25 oct 2026  

> **Canónico de negocio:** [`BIND_BUSINESS.md`](./BIND_BUSINESS.md) · Visión: [`VISION.md`](./VISION.md).  
> Este doc sigue siendo la profundidad settled/unsettled + clawback.

---

## 1. El problema (qué resolvemos)

En Stellar/crypto, un pago o un hack es **final en segundos**. Si te roban la key o firmas un phishing:

- El ladrón mueve USDC
- Swap / bridge / cash-out
- No hay “chargeback” como en Visa

Las wallets, neobanks y apps de remesas en Stellar cargan con ese riesgo. Circle puede freeze/blacklist en algunos contextos, pero **tú no controlas el clawback de USDC nativo** (en Stellar mainnet USDC tiene `auth_revocable`, no `auth_clawback_enabled` para terceros).

**Dolor concreto:**
- Usuarios retail pierden fondos sin recurso
- Fintechs/neobanks no pueden ofrecer “protección tipo banco” on-chain
- DeFi y apps no tienen un estándar de “fondos en tránsito recuperables”

---

## 2. Por qué el clawback solo NO sirve para todos

Si solo haces:

> deposito USDC → minteo CUSDC con clawback → listo

Falla en cuanto el ladrón:

1. Swapea CUSDC → XLM/USDC, o  
2. Redime CUSDC → USDC al instante  

El clawback solo alcanza **saldos de tu asset**. Para que “sirva para todos” hace falta un modelo de **asentamiento diferido** (settled vs unsettled), no solo un wrap con flag.

Esto ya lo investigó Circle Research / Stanford como **Recoverable Wrapper Tokens (RWT / ERC-20R)**. En EVM es un contrato complejo. En Stellar puedes apoyarte en **clawback nativo + Soroban + claimable/time locks**.

---

## 3. La solución (cómo hacerlo funcionar de verdad)

### Idea central

CUSDC no es “USDC con otro nombre”. Es USDC con **dos estados de saldo**:

| Estado | ¿Se puede clawback/recover? | ¿Se puede unwrap a USDC? | Uso típico |
|--------|----------------------------|---------------------------|------------|
| **Unsettled** (recién recibido / en ventana) | Sí | No | Pagos, saldo operativo, protección |
| **Settled** (pasó la ventana, ej. 24–72h) | No | Sí, 1:1 | Salida a USDC libre, DeFi “duro” |

### Flujo feliz

```
Usuario A deposita 100 USDC
        ↓
Vault bloquea 100 USDC
        ↓
Mintea 100 CUSDC (settled) a A
        ↓
A paga 40 CUSDC a B
        ↓
B recibe 40 CUSDC UNSETTLED (ventana T = 24h)
        ↓
Si no hay disputa → a las 24h pasa a SETTLED
        ↓
B puede unwrap 40 CUSDC settled → 40 USDC
```

### Flujo de robo / phishing

```
A reporta robo / firma maliciosa (dentro de ventana)
        ↓
Freeze del saldo unsettled en la ruta del robo
        ↓
Arbiter / política automática evalúa
        ↓
Clawback / recover de CUSDC unsettled
        ↓
Re-emisión a la víctima
        ↓
Reservas USDC intactas (sigue 1:1)
```

### Pieza que hace que “sirva para todos”: Exit Market (R-Pool)

Muchos querrán liquidez YA sin esperar 24h. Solución:

- Pool de liquidez que compra CUSDC **unsettled** y entrega USDC / CUSDC settled
- Cobra un **fee/prima** (ej. 0.1–1%)
- Ese fee = precio del riesgo de clawback (seguro descentralizado)

Así:
- Quien quiere seguridad → espera settle gratis  
- Quien quiere velocidad → paga prima  
- Comerciantes/DeFi pueden exigir solo settled, o aceptar unsettled con fee

### Reglas mínimas para que el peg 1:1 aguante

1. **Reserva full-backed:** `USDC_en_vault >= CUSDC_total_supply` (on-chain / PoR)  
2. **Unwrap solo settled**  
3. **Mint solo contra depósito real de USDC**  
4. **Clawback quema CUSDC** (no “se lo queda el admin” en silencio); re-mint a víctima es tx aparte auditable  
5. **Issuer keys en multisig / governance** (nunca hot key sola)  
6. **Política pública de disputes** (SLA, evidencia, quién decide)

---

## 4. Arquitectura técnica en Stellar

### Componentes

1. **Vault USDC (Soroban)**  
   - `deposit(usdc) → mint CUSDC settled`  
   - `withdraw(cusdc_settled) → burn → release USDC`

2. **Asset CUSDC (Stellar Classic o SAC)**  
   - Issuer con `AUTH_CLAWBACK_ENABLED` + `AUTH_REVOCABLE`  
   - Opcional `AUTH_REQUIRED` al inicio (onboarding controlado)

3. **Settlement engine (Soroban)**  
   - Lleva contabilidad settled/unsettled por address  
   - `settle()` permissionless cuando pasa `T`  
   - `freeze()` / `recover()` según rol arbiter

4. **Dispute / Arbiter module**  
   - Multisig, DAO, o oráculos + evidencia  
   - Timelock en cambios de política

5. **Exit Pool (R-Pool)**  
   - AMM u orderbook unsettled→settled/USDC  
   - Fee = revenue + cobertura de riesgo

6. **Indexer + API**  
   - Estado de cada pago, ventana restante, disputes  
   - SDK para wallets (Freighter, Lobstr, Beans, neobanks)

7. **Integraciones**  
   - Wallets kit, SEP-24/31 opcional (recibir fiat → mintear CUSDC)  
   - Adapters DeFi: pools que solo aceptan settled

### Por qué Stellar (no “porque blockchain”)

| Capacidad Stellar | Cómo la usamos |
|-------------------|----------------|
| Clawback nativo L1 | Recover sin reinventar blacklist EVM |
| Fees ~0 / finality rápida | Viable para retail y micropagos |
| USDC nativo + anchors | On/off-ramp real (MoneyGram, etc.) |
| Soroban | Vault, settlement state, R-Pool |
| Claimable balances / predicates | Time-locks y pagos condicionales |
| Enfoque pagos | El problema es de dinero real, no de degens |

**Por qué Web3 / on-chain (y no solo un ledger privado):**
- Reservas y supply verificables (PoR)
- Reglas de recover públicas y auditables
- Cualquier wallet puede integrar el estándar (no un silo)
- Composabilidad: DeFi, payroll, remesas sobre el mismo rail
- El usuario puede salir a USDC settled sin pedir permiso a un banco opaco — con reglas claras

---

## 5. Para quién es (para que “sirva para todos”)

No es “obligar a todo el planeta a CUSDC”. Es un **modo recuperable opt-in** que distintos actores adoptan:

| Actor | Cómo lo usa | Valor |
|-------|-------------|-------|
| Wallet / neobank | Saldo por defecto = CUSDC unsettled→settled | Menos chargebacks sociales / menos “me hackearon” |
| Remesas | Pago en tránsito recuperable hasta cash-out | Menos fraude en corridores |
| Merchant | Acepta settled; unsettled con fee o espera | Menos riesgo de reverse |
| DeFi protocol | Colateral solo settled; o wrap al depositar | Menos rug por theft inmediato |
| Usuario power | Unwrap settled a USDC libre cuando quiera | Autocustodia con red de seguridad temporal |

**Modos de producto:**
- **Consumer Safe Mode** — ventana 24–72h, arbiter del wallet  
- **P2P Undo** — el sender puede cancelar envío X minutos (fat-finger)  
- **Institutional Rail** — fintech white-label con su política de disputes  

---

## 6. Modelo de negocio y revenue

### Costos estructurales
- Custody/ops del vault USDC  
- Auditorías + bug bounty  
- Compliance (si operan como custodio/emisor en alguna jurisdicción)  
- Liquidez semilla del R-Pool  
- Soporte de disputes  

### Ingresos (apilables)

| Fuente | Mecánica | Notas |
|--------|----------|-------|
| **Spread wrap/unwrap** | 0–10 bps | Bajo para adopción |
| **Exit fee (R-Pool)** | 10–100 bps sobre unsettled→liquidez inmediata | Core revenue; precio del seguro |
| **Yield del float** | Interés sobre USDC en vault (T-bills / Spiko / etc.) | Solo con disclosure claro; o segregado y **no** tomar yield si quieren máxima confianza |
| **B2B SaaS** | Fee mensual / % TVL a wallets que white-labelan Safe Mode | Escala sin ser consumer brand |
| **Dispute fee** | Fee al claim fraudulento / % recovery | Desincentiva abuse |
| **Insurance underwrite** | Terceros stakean en R-Pool y ganan fees | Marketplace de riesgo |

### Unit economics (ejemplo)

- TVL CUSDC: $10M  
- 30% del volumen sale por R-Pool con fee 0.3%  
- Volumen mensual unsettled exit: $20M → **$60k/mes** solo en exit fees  
- + SaaS a 5 wallets ($2–5k/mes c/u)  
- + opcional 2–4% APY float si se toma (conflicto de interés: mejor al inicio **no** depender de esto)

### Qué NO hacer
- Prometer “nunca pierdes” (el settled ya no es recuperable)  
- Clawback arbitrario sin política (muerte de confianza)  
- Competir con Circle como “otro USDC” sin utilidad clara de recovery  

---

## 7. Competencia y diferenciación

| Alternativa | Limitación | Nosotros |
|-------------|------------|----------|
| USDC nativo | Sin recover para el usuario/app | Ventana + clawback |
| Multisig / social recovery wallet | Previene pérdida de key; no reverse de tx firmada | Cubre post-tx en ventana |
| Seguros DeFi (SAFU-type) | Pagan después, capital intensivo | Prevención/recover del asset mismo |
| ERC-20R en Ethereum (research) | Poco adoptado; fees altos para retail | Stellar nativo + pagos reales |
| Custodio clásico | Opaco, siloed | Reglas on-chain + exit a USDC |

**Posicionamiento:**  
“Visa-like provisional credit / chargeback window, settled to crypto finality — on Stellar.”

---

## 8. Riesgos (hay que nombrarlos)

1. **Confianza en el arbiter** — si el multisig es malo, es peor que USDC  
2. **Abuse de disputes** — gente clama robo falso → governance + bonds  
3. **Ladrón espera settle** — por eso la ventana y UX de alertas  
4. **Regulación** — wrap USD-like puede verse como e-money/MSB; legal early  
5. **Depeg perceptual** — si hay freeze masivo, mercado asusta; PoR + comms  
6. **Liquidez R-Pool insufiente** — exits caros; sembrar liquidity  
7. **Circle / issuer politics** — no presentarlo como “USDC mejorado por nosotros”, sino “modo recuperable opt-in sobre USDC”

---

## 9. Roadmap sugerido

### Fase 0 — Paper + threat model (1–2 semanas)
- Spec settled/unsettled  
- Política de disputes  
- Comparativa vs Circle RWT  

### Fase 1 — MVP testnet
- Vault USDC↔CUSDC  
- Ventana 24h  
- Freeze + clawback + reissue  
- Dashboard PoR  

### Fase 2 — Pilot con 1 wallet/neobank
- Safe Mode default para saldos &lt; $X  
- Soporte disputes humano  
- Métricas: % recovers exitosos, tiempo, abuse rate  

### Fase 3 — R-Pool + SDK público
- Exit market  
- Integraciones DeFi settled-only  
- White-label B2B  

### Fase 4 — Estándar abierto
- SEP/CAP o interfaz común “Recoverable Stellar Asset”  
- Multi-asset (CEURC, etc.)  
- Governance progresiva del arbiter  

---

## 10. Pitch SCF (si aplica)

- **Problema:** pagos Stellar son irreversibles; retail/fintech no tienen chargeback on-chain  
- **Solución:** recoverable wrapper nativo (settled/unsettled + clawback L1 + exit pool)  
- **Por qué Stellar:** clawback L1 + USDC + anchors + fees bajos  
- **Diferencia:** no es otro lending ni otra remesa; es **infra de confianza** para todo lo que ya existe  
- **Track:** Open (primitiva) o Integration (con un wallet + MoneyGram/USDC)  
- **Métrica de growth:** TVL en vault, #wallets integrados, recovers exitosos, volumen R-Pool  

---

## 11. Respuesta directa a “¿CUSDC a $1 como USDC?”

**Sí, por diseño de reserva 1:1**, no por oráculo de precio:

- 1 CUSDC settled ↔ 1 USDC en vault  
- El mercado puede cotizar unsettled con descuento (= fee de riesgo)  
- Eso es bueno: el descuento **es** el precio de la seguridad/velocidad  

Clawback “para todos” funciona solo si:
1. Hay ventana de unsettled  
2. Unwrap exige settled  
3. Hay exit market para los impacientes  
4. Arbiter / política es transparente  
5. Reservas son auditables  

Sin eso, CUSDC es solo un wrap custodial con un botón peligroso.

---

## 12. Decisión de producto recomendada

| Opción | Veredicto |
|--------|-----------|
| Wrap simple + clawback admin | No — no sirve para todos |
| **RWT-style settled/unsettled + clawback Stellar + R-Pool** | **Sí — modelo correcto** |
| Solo social recovery wallet | Complementario, no reemplazo |
| Intentar clawback de USDC nativo | Imposible como terceros |

**Nombre mental del producto:**  
*Recoverable payment rail over USDC on Stellar* — no “nuestro stablecoin”.
