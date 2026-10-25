# Bind — Visión (norte fijo)

**Updated:** 2026-10-25  
**Nombre de producto:** **Bind**

## Qué somos

**Capa de seguro / seguridad** que **protocolos DeFi y consumidores** usan en Stellar: el protocolo contrata Bind; el usuario obtiene depósitos/movimientos con **retención** (ej. 12h sin KYC) para detectar abuso.  
Durante la retención se bloquea unwrap/swap libre; si hay siniestro, Bind indemniza. Clawback L1 = **ops**, no la marca.  
Con KYC (Fast Lane): menos espera y mejor atribución del atacante.

## Una frase

> **Bind is DeFi security insurance on Stellar:** protocols contract Bind to hold covered deposits in a timed retention window — block free exit while risk is open, pay approved claims under the hood; KYC unlocks a faster lane, clawback is claims ops not the pitch.

## Hackathon

- **Categoría:** Genesis  
- **Track:** Stellar Unlocked — issuance + clawback como *claims rail* bajo el capó; producto = **seguro para protocolos**.

## Qué NO somos

| Anti-visión | Por qué |
|-------------|---------|
| Producto “clawback” de cara al usuario | Eso es el mecanismo de pago del siniestro |
| Clone de Blend / lending | Ellos son el money market; nosotros la póliza de movimiento |
| Mutual de smart-contract exploit (v1) | Cover Schedule lo excluye; otro balance sheet |
| Pasarela / checkout / otro USDC de marca | Fuera de scope |
| Wallet consumer como core | El cliente que firma el contrato es el **protocolo** |

## Glosario seguro ↔ motor

| Cara protocolo / usuario | Motor |
|--------------------------|--------|
| Póliza contratada / Safe Deposit | Lote unsettled (`T`) |
| Prima | Cover fee B2B (+ Exit Pool) |
| Siniestro | Claim → freeze → resolve |
| Indemnización | Remint settled (+ clawback burn interno) |
| Solvencia del cover | Vault USDC + PoR |
| Fin de cobertura | Settle → unwrap |

## Principios

1. **Cliente = protocolo** (Blend-like) — el usuario hereda la protección.  
2. **Seguro first, rail second** — marketing = cover; Unlocked = clawback.  
3. **Opt-in / transparent** — Cover Schedule + Claims Policy públicos.  
4. **Peg sagrado** — `vault ≥ supply`.  
5. **Unwrap solo settled**.  
6. **Scope estrecho** — movimiento / depósito cubierto, no hack del partner.  
7. **Stellar-native** — claims rail L1 donde aporta, invisible en el pitch retail.

## Éxito

Protocolos pagan Bind de forma recurrente y pueden apagar nuestro frontend: la póliza vive en SDK + API + vault.

## Docs

- [`PROTOCOL_INSURANCE.md`](./PROTOCOL_INSURANCE.md) — cómo se ve como seguro DeFi  
- [`BIND_BUSINESS.md`](./BIND_BUSINESS.md) — revenue / legales  
- [`PITCH_FAQ.md`](./PITCH_FAQ.md) — defensa  
