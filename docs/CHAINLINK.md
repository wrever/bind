# Keel × Chainlink on Stellar

**Updated:** 2026-10-25

**Veredicto (2026):** Chainlink está live en Stellar (Data Feeds + Data Streams).  
**No es bloqueante para el rail rUSDC.** Lo tratamos como integración *later / optional*.

## Qué hay hoy

| Producto | Estado en Stellar | ¿Keel lo necesita? |
|----------|-------------------|--------------------|
| Data Feeds (precios vía proxy + `data_id`) | Testnet + Mainnet | No para peg 1:1 USDC |
| Data Streams (report verify on-chain) | Disponible | No para settle/recover |
| SmartData / Proof of Reserve | Modelo PoR de Chainlink (feeds custom) | Útil **después** de TVL real |
| CCIP | Roadmap Scale / adopción | Fuera de visión (somos Stellar-native) |

Proxy Data Feeds (referencia docs Chainlink):

- Testnet: `CBUF6IADAWPWIDWRTHJNINKXHG2UTIQ6TU2F2HRAXWAI7OT3KJPKK6O4`
- Mainnet: `CDQBHEUGLDHMSUHG4IH33RJBUTMNCZOT4JIAQR4WZFRDZW6DR6S32ZLZ`

## Por qué no mete el core ahora

1. **Peg de Keel = vault USDC ≥ supply rUSDC**, no un precio de mercado.  
   Un feed XLM/USD o BTC/USD no decide unwrap, freeze ni Exit Pool.
2. **Recover / clawback** son reglas de ledger + roles arbiter, no oráculos.
3. **PoR Chainlink** (SmartData) requiere feed dedicado / onboarding con Chainlink.  
   Mientras tanto publicamos PoR propio (HMAC demo → attestation on-chain del vault).
4. Meter oráculos en el path crítico añadiría dependencia y superficie sin ganar recover.

## Dónde sí nos sirve (Fase 3+)

| Uso | Cuándo |
|-----|--------|
| Partners DeFi settled-only que cotizan colateral en USD | Cuando haya protocolo settled-only |
| Attestation PoR externa (ripcord / AUM) firmada por DON | Con TVL + proceso legal |
| Kill-switch opcional si un feed USDC depeg reporta anomalía | Solo como señal ops, no como truth del vault |

## Decisión de producto

- **Ahora:** seguir testnet vault, issuer clawback, PoR Keel, ops/Safe Mode.  
- **No construir:** consumer de precios dentro de `keel-vault` ni depender de Chainlink para settle.  
- **Documentar** esta nota en el roadmap como “oracle optional”.

## Referencias

- [Data Feeds on Stellar](https://docs.chain.link/data-feeds/stellar)  
- [Stellar × Chainlink announcement](https://stellar.org/blog/foundation-news/chainlink-is-now-live-on-stellar-unleashing-a-new-wave-of-defi-innovation)  
