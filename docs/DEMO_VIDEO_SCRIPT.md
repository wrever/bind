# Bind — AI demo video brief (English)

**Paste this whole file into an AI video / screen-recording agent.**  
**Base URL:** https://bind-beta.vercel.app  
**Locale:** always use `/en/…`  
**Length target:** 2:30–3:30  
**Tone:** calm, technical, confident. Insurance product — not a “clawback app,” not a wallet.

---

## System note for the AI editor

- Prefer **live browser capture** of the URLs below. If a Freighter wallet is unavailable, still open `/en/live` and `/en/por`, then cut to **README on-chain proof** (tx explorer links) for proof of real testnet activity.
- On screen, **never** claim `/demo` is the vault. Say “simulator” every time you open it.
- Vault ID to flash once: `CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ` (Stellar Testnet).
- Do **not** show the retired prior vault `CCQEAW…` except optionally as a 2-second disclosure slide.
- Brand language: insurance, cover, retention, claim, proof of reserves. Clawback = claims ops under the hood.

---

## Freshness / data reality (so you do not invent “live webhooks”)

Bind does **not** use Stellar webhooks today. Freshness is **pull**:

| Surface | How it stays fresh |
|---------|-------------------|
| `/en/live` | Polls Freighter + `GET /api/v1/chain/account` ~every 5s; after each signed tx refreshes balances |
| `/en/por` + Live PoR card | `GET /api/v1/chain/por` (simulate `vault.por()` on RPC) on load / refresh |
| `/en/demo` + `/ops` | Local policy simulator polling only — **not** the vault |
| Proof pack | README + stellar.expert tx links from last signed e2e |

Optional B-roll: open https://bind-beta.vercel.app/api/v1/chain/por and https://bind-beta.vercel.app/api/v1/health in a browser tab to show JSON `vault` + `fullyBacked`.

---

## Shot list + VO script

### 0:00–0:20 — Hook / problem  
**SHOW:** `/en` (landing hero)  
**SAY:**  
“Stellar settles in seconds — and there is no chargeback. When a DeFi deposit or transfer goes wrong, protocols and users eat the loss. Bind is deposit insurance for that gap.”

### 0:20–0:45 — One-liner + who buys  
**SHOW:** stay on `/en`, scroll to the three-step flow (“Protocol contracts Bind” / retention / claim)  
**SAY:**  
“Your protocol contracts Bind. Users get a short protected period before they can withdraw freely. If funds are stolen while they are still covered, Bind pays. We sit under your product — users do not download another consumer app.”

### 0:45–1:10 — Why Stellar Unlocked (not Composed)  
**SHOW:** `/en/docs/introduction` (callout Genesis · Unlocked) **or** cut to repo `docs/UNLOCKED.md` for 5s  
**SAY:**  
“This is Genesis, Stellar Unlocked. Stellar already ships asset clawback and Soroban smart contracts. Bind unlocks those primitives as a claims rail plus a policy vault — Classic COVER with clawback enabled, and a live Soroban vault. We are not a mashup of two other ecosystem apps.”

### 1:10–2:10 — Live rail (real testnet)  
**SHOW:** `/en/live`  
**DO (if Freighter available):** Connect Freighter on **Testnet** → Get TUSDC / trustline if needed → Deposit → open the resulting stellar.expert tx from the on-page log. Optionally Transfer, then Dispute, then Approve claim if ops token works.  
**DO (if no wallet):** Still show `/en/live` UI, vault explorer link on the page, then jump to README “On-chain proof” table and open 2–3 explorer txs (deposit, dispute, resolve).  
**SAY:**  
“This is the live cover rail — Freighter signs real transactions against our published testnet vault. Demo is a simulator; Live is the chain. Here you deposit collateral, open a protected lot, and if something goes wrong you can dispute. An arbiter resolve remints covered credit to the rightful party. Under the hood that uses Stellar’s clawback path — claims operations, not the consumer brand.”

### 2:10–2:40 — Proof of reserves + COVER  
**SHOW:** `/en/por`  
**SAY:**  
“Proof of reserves reads the vault on-chain. Peg rule: vault USDC greater than or equal to covered supply. You also see the COVER claims rail — the Unlocked clawback asset used when a claim is approved.”

### 2:40–3:00 — Dual-track honesty (optional 10s)  
**SHOW:** `/en/demo` for one beat only  
**SAY:**  
“Quick honesty: `/demo` is the policy simulator for partners — not custody. Production partners will integrate the API and SDK; this frontend can go away.”

### 3:00–3:20 — Depth / architecture  
**SHOW:** `/en/docs/how-it-works` **or** `/en/integrate`  
**SAY:**  
“Mechanically: deposit wraps one-to-one into covered credit. A transfer opens unsettled cover for a retention window. No breach — settle and unwrap. Breach on-rail — claim, freeze, resolve. Caps, pause, and a public claims policy keep the product narrow: Tier-1 cover is while funds stay on the Bind rail.”

### 3:20–3:40 — Close + links  
**SHOW:** README top “On-chain proof” **or** `/en` CTA  
**SAY:**  
“Bind: DeFi deposit insurance on Stellar. Live demo at bind-beta.vercel.app. Vault and transaction proofs are in the public README. Protocols contract cover — users get protection — clawback stays under the hood.”

---

## On-screen lower-thirds (suggested)

| Time | Text |
|------|------|
| 0:05 | Problem: no chargeback on Stellar |
| 0:30 | Bind = deposit insurance for protocols |
| 0:50 | Track: Genesis · Stellar Unlocked |
| 1:15 | `/live` = real testnet vault |
| 2:15 | PoR: vault ≥ supply |
| 3:10 | Dual-track: `/demo` simulator ≠ vault |

---

## Hard facts card (end slate, 5s)

```
Bind — DeFi deposit insurance on Stellar
Track: Genesis · Stellar Unlocked
Live: https://bind-beta.vercel.app
Vault: CDGNKKYHIERBJ7CGXUIKFALRPIFF44T5ZKIRIMKQGCYRLJWO7MYNKZIJ
PoR:   https://bind-beta.vercel.app/api/v1/chain/por
Repo:  https://github.com/wrever/bind
```

---

## Known limits (say once if time — builds trust)

- Resolve today uses a single arbiter key; multisig is planned.  
- Testnet collateral is TUSDC as a stand-in for Circle USDC.  
- Tier-1 cover is on-rail only; off-rail drains need separate underwriting capital.

---

## What to build next (product — not for this video)

1. **Horizon / RPC event watcher → webhook** to partners on deposit, dispute, resolve, settle (today: pull-only).  
2. **Auto-refresh PoR** on `/live` without manual Refresh.  
3. **Multisig arbiter** for claim resolve.  
4. Partner **SDK snippet** + signed LOI.  
5. Optional later: ZK attestation for Fast Lane KYC — not the Unlocked thesis.
