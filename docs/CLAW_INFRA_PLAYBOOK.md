# Playbook: convertirse en infra única en Stellar (Keel)

**Updated:** 2026-10-25

**Objetivo:** no ser “una app más”, sino la **capa de balances recuperables** que wallets, neobanks, anchors y DeFi integran por defecto.  
**Producto:** **Keel** — Recoverable Rails sobre USDC (multi-asset después) — settled / unsettled + clawback L1 + Exit Pool.  
**No es:** otra pasarela de pagos ni otro stablecoin de marca.

---

## 1. Tesis de infra (una frase)

> Stellar liquida en segundos y no tiene chargeback. Nosotros somos el estándar open de **finalidad diferida recuperable** sobre USDC, nativo al clawback de Stellar.

Si eso no queda claro en el pitch, todavía son una app.

---

## 2. Qué deben poseer (el moat)

Para ser infra, tienen que controlar estas capas — no solo una UI:

| Capa | Qué es | Por qué es moat |
|------|--------|-----------------|
| **Estándar** | Interfaz pública: settled/unsettled, freeze, recover, unwrap | Que otros construyan encima |
| **Vault + PoR** | Custodia 1:1 USDC, pruebas on-chain/auditoría | Confianza del peg |
| **Settlement engine** | Reloj de ventana, estados, settle permissionless | Corazón del producto |
| **Clawback ops** | Issuer keys, política, re-mint auditable | El “recover” real |
| **Exit Pool (R-Pool)** | Liquidez unsettled → settled/USDC | Que sirva para impacientes |
| **SDK + relayer** | TypeScript/Rust, Freighter/Wallets Kit | Adopción B2B |
| **Dispute policy** | Reglas, SLA, bonds anti-abuse | Legitimidad |
| **Integraciones** | ≥2 wallets + 1 DeFi settled-only + 1 flujo fiat | Prueba de infra real |

Sin estándar + SDK + 2 integraciones live, son un prototipo, no infra.

---

## 3. Arquitectura mínima (v1)

### Contratos / on-chain
1. `Vault` — deposit USDC / withdraw settled CUSDC  
2. `CUSDC` — asset con `AUTH_CLAWBACK_ENABLED` + `AUTH_REVOCABLE` (issuer controlado)  
3. `Ledger` — balances settled vs unsettled por address + `received_at`  
4. `Arbiter` — roles: freezer, recoverer, pauser (multisig)  
5. `ExitPool` — v1 puede ser orderbook simple o AMM unsettled/settled  

### Off-chain
1. Indexer (Horizon + RPC events)  
2. API: balance, ventana restante, dispute open/status, PoR  
3. Keeper: auto-settle cuando pasa `T`  
4. Ops console: freeze/recover con audit log  
5. SDK: `wrap`, `transferRecoverable`, `settle`, `unwrap`, `openDispute`

### Seguridad
- Issuer + vault admin: **multisig m-of-n** (nunca hot key sola)  
- Timelock para cambiar `T` o roles  
- Pause global  
- Auditoría externa antes de mainnet con TVL real  
- Bug bounty  
- Runbooks: key compromise, depeg rumor, dispute flood  

---

## 4. Reglas de producto innegociables

1. `USDC_vault >= CUSDC_supply` siempre  
2. Unwrap **solo** settled  
3. Transferencias crean unsettled en el receptor (ventana `T`)  
4. Clawback **quema** CUSDC; re-mint a víctima es tx separada y pública  
5. Política de disputes publicada (quién decide, plazos, evidencia, appeals)  
6. PoR / supply dashboard público  
7. Opt-in: nadie está forzado a CUSDC para usar Stellar  

---

## 5. Por qué esto puede ser único en Stellar

| Factor | Realidad |
|--------|----------|
| Clawback L1 | Stellar lo tiene; EVM lo simula con contratos (ERC-20R research) |
| USDC sin clawback de terceros | Hay espacio para un **modo recuperable opt-in** |
| Payments-first ecosystem | El dolor (irreversibilidad) es core, no un side-quest DeFi |
| Hueco de mercado | Nadie es el estándar recoverable-wrapper en Stellar hoy |
| Riesgo | Circle Research ya pensó RWT — ustedes **shippean** en Stellar |

Único ≠ nadie lo imaginó. Único = **nadie lo opera como estándar vivo aquí**.

---

## 6. Go-to-market: cómo se vuelven infra (no app)

### Fase A — Spec + credibilidad (2–4 semanas)
- Whitepaper corto (8–12 págs) + threat model  
- OpenAPI del SDK  
- Repo público + testnet demo  
- Conversaciones con 3 wallets / 2 fintechs (Lobstr/Beans/xBull/neobanks LATAM-AF)  
- Interest form SCF #46 si aplica  

**Output:** “este es el estándar”, no “miren nuestra app”.

### Fase B — Design partners (4–8 semanas)
Firmar **2 design partners** que integran Safe Mode:
- 1 wallet consumer  
- 1 neobank / remesa / merchant payout  

Entregarles:
- SDK  
- Panel disputes  
- SLA de recover  
- Co-marketing  

**Métrica de infra:** volumen que pasa por partners, no usuarios propios.

### Fase C — Liquidez + DeFi (en paralelo)
- Sembrar Exit Pool  
- 1 protocolo acepta solo **settled** como colateral/depósito  
- Documento “Integration Guide for DeFi”

### Fase D — Estándar abierto
- Proponer SEP / interfaz `RecoverableAsset`  
- Permitir que **otros issuers** usen el mismo patrón (multi-CUSDC / CEURC)  
- Gobernanza del arbiter más descentralizada con el tiempo  

Cuando otros emiten bajo su spec, ya son infra de verdad.

---

## 7. Stack de integraciones (prioridad)

### Must-have (primeros 90 días)
1. **Stellar Wallets Kit / Freighter** — connect + sign  
2. **USDC (Circle)** — asset base  
3. **1 wallet partner** — Safe Mode default para saldos chicos  
4. **PoR dashboard** público  

### Should-have
5. **MoneyGram / Anchor SEP-24** — fiat → vault → CUSDC (vía partner, no ser ustedes el anchor)  
6. **DeFindex o pool settled-only** — utility DeFi  
7. **Nectar / keepers** — settle/freeze automation si aplica  

### Later
8. Multi-asset (EURC, etc.)  
9. SEP-31 B2B recoverable transfers  
10. R-Pool underwriters externos  
11. **Chainlink** Data Feeds / SmartData PoR — pricing DeFi settled-only o attestation externa; **no** en el path de peg/recover (ver `CHAINLINK.md`)

**No priorizar:** construir su propia pasarela checkout consumer.  
**No priorizar:** meter oráculos de precio en el vault 1:1.

---

## 8. Modelo de negocio (infra)

| Revenue | Quién paga | Cuándo madura |
|---------|------------|---------------|
| Exit Pool fee | Usuario impaciente / merchant que quiere settled ya | Desde día 1 con liquidez |
| Integration SaaS | Wallets/fintechs (TVL fee o flat) | Con 2+ partners |
| Dispute processing | Claimant / partner enterprise | Con volumen de disputes |
| Protocol fee unwrap | Opcional, bajo | Escala |
| Float yield | Protocol treasury | Solo con legal + disclosure; no depender |

**Pricing de adopción:** wrap/transfer barato o gratis; cobrar en **exit rápido** y **B2B**.

---

## 9. Compliance y legal (no opcional)

Tratan USDC de terceros y operan recover → parecen **custodio / servicio de recuperación**.

Checklist:
- [ ] Estructura legal (quién es issuer, quién opera vault)  
- [ ] Opinión legal por jurisdicción de ops (al menos 1)  
- [ ] ToS: qué es recoverable, qué no, plazos, límites  
- [ ] KYC del arbiter ops si manejan disputes con PII  
- [ ] Sanctions screening en flujo de recover/re-mint  
- [ ] Segregación de reservas (no mezclar con treasury operativa)  
- [ ] Incident disclosure policy  

Ignorar esto mata el producto aunque el código sea perfecto.

---

## 10. Equipo mínimo

| Rol | Por qué |
|-----|---------|
| Smart contracts (Soroban/Rust) | Vault + settlement |
| Backend/indexer | Estado unsettled, API, keepers |
| Security lead / auditor liaison | Claves + threat model |
| BD / partnerships | Wallets y fintechs |
| Legal/compliance (fractional ok al inicio) | Custodia + disputes |
| Product/docs | Spec + integration guides |

2–4 builders fuertes + 1 persona de partnerships > 10 personas en UI.

---

## 11. Métricas que importan (infra)

| Métrica | Señal de salud |
|---------|----------------|
| TVL en vault | Confianza + peg |
| `#` partners integrados en prod | Adopción B2B |
| % volumen vía partners (vs UI propia) | Son infra, no app |
| Recover success rate / tiempo medio | Utilidad real |
| Abuse rate de disputes | Calidad de política |
| Exit Pool depth + fee medio | Liquidez del modelo |
| PoR attestations on-time | Credibilidad |

Vanity a ignorar: followers, “usuarios que probaron el faucet”.

---

## 12. Plan de 90 días (executable)

### Días 1–14
- [ ] Spec settled/unsettled + dispute policy v0  
- [ ] Threat model (robo key, phishing, false claim, admin rug)  
- [ ] Scaffold contratos testnet  
- [ ] Lista de 20 targets de partnership; 10 outreach  

### Días 15–45
- [ ] Vault + CUSDC + settle/freeze/recover en testnet  
- [ ] SDK alpha + docs  
- [ ] PoR page  
- [ ] 2 LOIs / design partners  
- [ ] Submit SCF si encaja (#46 deadline 8 nov 2026)  

### Días 46–90
- [ ] Auditoría scoped  
- [ ] Mainnet con caps bajos (`max TVL`, `max recover`)  
- [ ] Partner #1 en prod con Safe Mode  
- [ ] Exit Pool v1 con liquidez semilla  
- [ ] Postmortem público del primer dispute real (aunque sea drill)  

---

## 13. Checklist “¿ya somos infra única?”

Marcar sí solo si cumplen casi todo:

- [ ] Spec abierta que otros pueden implementar  
- [ ] Mainnet con PoR  
- [ ] Multisig + timelock + auditoría  
- [ ] ≥2 integraciones de terceros en producción  
- [ ] Recover real ejecutado (o simulacro público verificado)  
- [ ] Exit path para unsettled (pool o equivalente)  
- [ ] >50% del volumen viene de partners, no de su frontend  
- [ ] Mentions en docs de partners (“powered by …”)  
- [ ] Camino a SEP / estándar multi-issuer  

---

## 14. Errores que los convierten en app genérica

1. Lanzar CUSDC como “nuestro USDC” con marketing de stablecoin  
2. Construir checkout/pasarela en vez de SDK  
3. Clawback admin sin ventana settled/unsettled  
4. Hot wallet issuer  
5. No firmar design partners antes de “launch”  
6. Competir con Beans/MoneyGram en UX de remesas  
7. Cerrar el código / no publicar la política de disputes  

---

## 15. Mensaje de una línea (para partners)

> “Integra Safe Mode en una semana: tus usuarios tienen una ventana de recuperación on-chain sobre USDC, sin que dejes de liquidar en Stellar. Nosotros operamos vault, disputes y liquidez de salida; tú sigues siendo la cara al cliente.”

---

## Referencias internas

- Modelo de producto/negocio: [`CLAW_PRODUCT.md`](./CLAW_PRODUCT.md)  
- Contexto ecosistema / SCF: [`STRATEGY.md`](./STRATEGY.md)  
- Investigación Circle RWT / ERC-20R: recoverable wrapper tokens (settled vs unsettled + R-Pools)
