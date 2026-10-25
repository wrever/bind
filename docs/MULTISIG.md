# Keel — Multisig / threshold keys (mock → prod)

**Updated:** 2026-10-25

Demo uses string role holders (`ops_admin`, `ops_pauser`, `ops_recoverer`, `ops_freezer`).  
Production maps each role to a **Stellar multisig** (or multiparty ceremony), never a single hot key.

## Role → key policy

| Role | Capability | Prod threshold (target) |
|------|------------|-------------------------|
| `admin` | Assign roles, raise caps, upgrade path | 3-of-5 cold |
| `pauser` | Pause / unpause deposits & transfers | 2-of-3 hot+warm |
| `recoverer` | Approve / reject disputes | 2-of-3 ops |
| `freezer` | Ops freeze without sender claim | 2-of-3 ops |

Admin may act as any role (break-glass). Timelock (≥24h) for role rotation and `window` / `maxSupply` changes.

## Ceremony checklist

1. Generate keys offline; record pubkeys in partner runbook  
2. Fund signers with XLM for fees only (no USDC custody on signer keys)  
3. Set issuer / vault admin weights on Stellar account  
4. Publish signer set hash in signed PoR `keyId` rotation notes  
5. Quarterly key drill: pause → unpause on testnet  

## Demo mapping

```
actor: "ops_pauser"     → pause / unpause
actor: "ops_recoverer"  → resolve dispute
actor: "ops_freezer"    → freeze action
actor: "ops_admin"      → any of the above
```

Unauthorized actors receive HTTP `403` from `/api/v1/sessions/:id/actions`.

## Related

- Threat model: [`THREAT_MODEL.md`](./THREAT_MODEL.md)  
- Dispute policy: [`DISPUTE_POLICY.md`](./DISPUTE_POLICY.md)  
