# Estrategia Stellar · Verticales, gaps e ideas para SCF #46

**Fecha:** 25 oct 2026  

**Fuentes:** [stellarlight.xyz/directory](https://stellarlight.xyz/directory) (API Scout), SCF #45 Round Recap, incidentes Blend 2026  
**Deadline SCF #46:** interest/submit hasta **8 nov 2026**

---

## 1. Foto del ecosistema

| Métrica | Valor |
|--------|------:|
| Proyectos activos (Live / Pre-Release / Development) | 905 |
| Proyectos indexados totales | ~1,136 |
| Proyectos con award SCF | 582 |
| USD SCF reconstruido (histórico) | ~$58.6M |
| TVL trackeado DefiLlama (subconjunto) | ~$1.97B |

### Cobertura por type (más → menos saturado)

| Type | Proyectos | SCF-funded | Lectura |
|------|----------:|-----------:|---------|
| Payments | 278 | 193 | **Hipersaturado** |
| SDK | 145 | 105 | Saturado |
| RWA | 96 | 57 | Crowded pero aún premia primitives |
| Security | 87 | 65 | Mucho tooling; poco insurance DeFi |
| Wallet | 71 | 45 | Saturado |
| Stablecoin | 58 | 19 | Emisores + wrappers |
| Analytics | 57 | 40 | Saturado |
| AI | 56 | 44 | Moda #45 (agentic/x402) |
| DEX | 44 | 34 | AMM clásico cubierto |
| Lending | 37 | 29 | **Saturado como narrativa #45** |
| Yield | 9 | 7 | Delgado; depende de Blend |
| Oracle | 8 | 5 | Feeds existen; falta risk layer |
| Card Issuing | 6 | 4 | Delgado |

> Nota StellarLight: gaps midén **cobertura del directorio**, no demanda de mercado. Validar con usuarios/referrers.

### Dónde está el capital

| Protocolo | TVL (aprox.) |
|-----------|-------------:|
| Spiko (RWA T-bills) | **$1.65B** |
| Blend | $151M (dato DefiLlama; post-incidentes muy dañado en práctica) |
| Aquarius | $38M |
| DeFindex | $19M |
| Templar | $12M |

**Insight:** casi todo el capital “grande” es RWA idle. DeFi nativo es pequeño y frágil. La oportunidad no es pelear por el TVL de Blend; es **conectar Spiko/Etherfuse/Benji con crédito seguro**.

---

## 2. Por qué lending se puso de moda en #45 (y por qué no hay que copiarlo)

### Qué pasó con Blend

1. **Feb 2026 — YieldBlox / oracle:** manipulación de precio de USTRY (~$10M+). Pool aislado, pero destruyó confianza. No era bug del core de Blend; era configuración de oráculo + liquidez fina.
2. **Ago 2026 — Comet BLND-USDC:** bug de same-token swap drenó ~$718k del LP que hacía de **backstop**. Lending siguió, pero el backstop V2 no era upgradeable → wind-down hacia V3. TVL DeFi Stellar se derrumbó.
3. **Modelo de negocio:** sin fee switch / comisiones estructurales → dependencia de grants SDF → narrativa de “casi en banca rota”.

### Qué financió SCF #45 en lending-adjunto

- **LendWise** — agregador de rates/posiciones  
- **Liqvid** — borrow USDC contra RWA propios  
- **Lendoor** — crédito undercollateralized + score  
- **Nila** — credit agrícola  
- **Crebit Rate Locks** — FX locks  

La comunidad ya respondió a “Blend está roto” con **wrappers, agregadores y verticales**. Un money market genérico #46 llega tarde y se ve oportunista.

---

## 3. Verticales: saturadas vs no atacadas (de verdad)

### Evitar como idea principal

| Vertical | Por qué |
|----------|---------|
| Remesas / neobank / otro anchor | 278 payments; Sorted, Minisend, Sendana, Beans, Yellow Card… |
| Wallet consumer | 71 wallets; Freighter/Lobstr/xBull/Privy/Haven |
| AMM constant-product | Soroswap + Phoenix + Aquarius + agregadores |
| Money market Blend-clone | 37 tipados; Alula, Laina, K2, Peridot, XOXNO, Templar… |
| x402 facilitator genérico | 3 premiados en #45 RFP |
| Otro T-bill wrapper | Spiko/Benji/WisdomTree/Etherfuse dominan |

### Huecos reales (pocos jugadores o mal resuelto)

| Hueco | Estado actual | Por qué importa |
|-------|---------------|-----------------|
| **Oracle risk / circuit breakers** | Reflector/DIA dan precios; casi nadie hace guardian de liquidez/TWAP/freeze | Vector del hack USTRY |
| **DeFi insurance / mutual cover** | SAFU (dev, wallet-drain), Sentinel (vuelos), Ballast Re (reaseguro RWA) | Nadie cubre money-market risk con primas |
| **Protocol revenue / fee switch** | Ausente en el diseño cultural de Blend | Sin ingresos no hay backstop sostenible |
| **CLMM / liquidez concentrada** | RFP comunitario; ~1 hit CLMM | Capital efficiency rota |
| **RWA-as-collateral infrastructure** | Liqvid issuer-specific; Mystic en dev | $1.65B Spiko sin rail de crédito genérico |
| **Trade credit / invoice factoring B2B** | Indentura, DeFa, Airswift fragmentados | Encaja LATAM/África sin ser remesa |
| **C-address / passkey UX** | Haven, RFPs Passkey UI / C-address tooling | Adopción Soroban accounts |
| **MM tooling post-Kelp** | RFP Hummingbot | Liquidez profesional |

---

## 4. Top 5 ideas únicas (priorizadas)

### #1 RiskOS — capa de solvencia para money markets Soroban  
**Track:** Open · **Urgencia:** máxima · **Competencia:** baja

Middleware integrable por cualquier pool:

- Multi-oracle mediana + rechazo si profundidad de mercado &lt; umbral  
- Circuit breaker / freeze automático  
- Fee switch → insurance fund on-chain  
- Dashboard de bad debt, LTV, backstop health, PoR  

**Por qué es único y necesario:** no compite con Blend; hace que el próximo lending no muera igual. Narrativa perfecta post-incidentes. Premiable como primitiva de infraestructura DeFi.

**MVP en 1–2 hitos:** contratos guardian + SDK para un pool demo + dashboard público + docs de threat model USTRY.

---

### #2 RWA Credit Rails — USDC loans contra T-bills tokenizados  
**Track:** Open (kit) o Integration (con Spiko/Etherfuse)  

Mercados aislados con colateral Spiko EUTBL/USTBL, Etherfuse Stablebonds, Benji FOBXX:

- Oracle NAV + TWAP + secondary depth check  
- Liquidaciones compliance-gated  
- Fee switch  
- Open-source adapters (vs Liqvid cerrado a su RWA)

**Por qué gana:** conecta el TVL más grande de Stellar con demanda de crédito. Diferenciador claro vs “otro Blend”.

---

### #3 Mutual Cover — seguro DeFi con primas reales  
**Track:** Open  

Cobertura paramétrica:

- Oracle failure  
- Backstop insolvency  
- Smart-contract bug (con proceso de claim)  

Underwriters stakean USDC; protocols pagan prima vía fees; keepers (Nectar) ejecutan.

**Whitespace:** SAFU ≠ money-market cover. Resuelve el problema cultural de “cero ingresos”.

---

### #4 CLMM + MM bot kit  
**Track:** Open o RFP (si resurge el brief)  

Liquidez concentrada + conectores Hummingbot para SDEX/Aquarius/Soroswap. Gap documentado por la comunidad; menos sexy, muy defendible ante delegates técnicos.

---

### #5 Trade Credit Score + factoring B2B (LATAM/África)  
**Track:** Integration  

Facturas verificadas → score portable → USDC advance. Componer Trustless Work + anchors + Privy. Narrativa Stellar-native de inclusión **sin** ser la remesa #279.

---

## 5. Cómo avanzar más rápido

1. **Elegir 1 apuesta** (#1 o #2 recomendadas). Matar scope creep.  
2. **Interest form SCF #46 ya** + buscar **referral** (63% de premiados #45).  
3. **Componer, no reinventar:** Reflector, Nectar, DeFindex, CCTP, Privy, Trustless Work.  
4. **Fee model desde día 1** en el whitepaper y en el contrato.  
5. **Threat model de oráculo** escrito y testeado (simulación de liquidez fina).  
6. **Demo mainnet/testnet** antes del community vote: txs reales &gt; mockups.  
7. **Métricas de growth:** TVL “seguro” bajo guardian, primas recaudadas, préstamos RWA, protocols integrados — no vanity users.  
8. Vigilar **RFPs Q4** (“coming soon” en oct 2026); si sale Prices/Positions/CLMM, pivotar RFP Track.

### Si ya tenéis algo construido

| Tenéis… | Pivotar a… |
|---------|------------|
| Lending / vault UI | Risk modules + fee switch + RWA adapters |
| Payments / remesa | Crédito embebido o FX hedge, no otro corridor |
| Tooling / indexer | Positions API, oracle guardian, PoR |
| RWA tokenization | Credit rail sobre vuestro asset (Integration) |

---

## 6. Apuesta recomendada para el equipo

| Escenario | Apuesta | Track |
|-----------|---------|-------|
| Equipo DeFi/protocolo fuerte | **RiskOS (#1)** | Open |
| Equipo con acceso a RWA/issuers | **RWA Credit Rails (#2)** | Open + Integration |
| Equipo fintech LATAM/África | **Trade Credit (#5)** | Integration |
| Equipo MM/quant | **CLMM + bots (#4)** | Open / RFP |

**No hacer:** otro wallet, otra remesa, otro AMM, otro money market sin fees ni defensa de oráculo.

---

## 7. Checklist inmediato (esta semana)

- [ ] Decidir entre #1 y #2 (o #5 si el DNA del equipo es fintech)  
- [ ] Validar con 2–3 Pilots/referrers en Discord Stellar Dev  
- [ ] Borrar del pitch cualquier claim “somos el Blend de X”  
- [ ] Escribir threat model + fee model (1 página)  
- [ ] Enviar interest form SCF #46  
- [ ] Re-chequear `/api/projects/search` en StellarLight con el nombre/keywords finales (evitar false gap)

---

*Cobertura del directorio revisada el 2026-10-25. Re-correr Scout `analyze?dimension=gaps` antes de submit SCF.*
