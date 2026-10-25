# Bind — Cover Schedule (v0)

**Effective:** 2026-10-25  
**Product:** Bind protocol / transfer cover  
**Status:** Demo / testnet — not regulated insurance

This schedule defines **what Bind covers**, caps, and exclusions.  
Claims procedure: [`DISPUTE_POLICY.md`](./DISPUTE_POLICY.md) · Business: [`BIND_BUSINESS.md`](./BIND_BUSINESS.md).

---

## 1. Covered peril (v0 — Tier 1 Retention Cover)

Bind may indemnify **only** when all of the following are true:

1. A **covered credit** lot is **unsettled** (inside retention window `T`, prod target **12h** without KYC Fast Lane).  
2. During retention, **unwrap / free swap** of that lot is blocked (settled-only to DEX).  
3. The claimant is the **original sender** of that lot (or partner under signed authority).  
4. The peril is one of:
   - `theft_key` — unauthorized transfer after key compromise  
   - `phishing` — induced signature / malicious destination  
   - `fat_finger` — clear mis-address / mis-amount within partner rules  
   - `breach_window` — partner/ops freeze during detected abuse pattern in `T`  
5. The claim is filed before settle and within published SLA.  
6. Amount ≤ `maxClaimAmount` and open-claim caps.

**Indemnity (Tier 1):** clawback / burn of unsettled lot still on Bind rail + remint **settled** credit to claimant (vault peg preserved).

**KYC Fast Lane (Tier 2):** shorter `T` and/or higher caps when partner attests KYC — identity aids attribution; retention still applies until settle.

**Protocol Incident Cover (Tier 3 — not v0 live):** underwritten payout for LP/SC drains **outside** Bind rail — separate capital, not clawback of Circle USDC. See [`RETENTION_SECURITY.md`](./RETENTION_SECURITY.md).

---

## 2. Explicit exclusions (Tier 1)

Bind Tier 1 does **not** cover:

| Exclusion | Example |
|-----------|---------|
| Value already unwrapped / swapped off Bind rail | USDC libre, bridge, CEX |
| Partner protocol exploit **without** Incident Cover | SC bug draining native USDC pool |
| Oracle / market risk | Bad price, cascade liquidations |
| Bad debt / insolvency of protocol | Underwater borrowers |
| Legitimate liquidation | Per protocol rules |
| Settled credit | After window `T` without open freeze |
| Fraudulent claims | False theft reports |
| Chain halt / force majeure | As defined in ToS |

---

## 3. Limits (engine defaults — demo)

| Cap | Default | Purpose |
|-----|---------|---------|
| `maxSupply` | 1,000,000 | Total covered credit |
| `maxUnsettledSupply` | 500,000 | Aggregate open policies |
| `maxUnsettledPerLot` | 10,000 | Single transfer/deposit lot |
| `maxClaimAmount` | 10,000 | Single indemnity |
| `maxOpenClaimsPerAccount` | 3 | Abuse control |
| `windowMs` | demo short / **prod 12h** sin KYC (Fast Lane más corto) | Retention / cover duration |
| `exitFeeBps` | 30 | Early exit premium |

Production partners may negotiate tighter caps via config + SLA.

---

## 4. Premium / fees (product)

| Fee | Payer | Role |
|-----|-------|------|
| Protocol cover fee | Partner | bps on covered volume / TVL |
| Exit Pool fee | User | Liquidity before `T` |
| Claim bond (prod) | Claimant | Anti-abuse |

---

## 5. Solvency

- Peg invariant: `vault_USDC ≥ covered_supply`.  
- Public PoR (signed demo + on-chain `por()` where deployed).  
- Liability of the facility is **limited to vault/pool assets** available under this schedule — not partner protocol treasuries.

---

## 6. Not insurance advice

This document is a **product cover schedule** for an optional recovery facility.  
It is **not** a regulated insurance policy unless and until Bind (or a licensed affiliate) is authorized in a given jurisdiction.
