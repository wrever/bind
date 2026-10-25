# AI tooling attribution

**Updated:** 2026-10-25

Bind was built with human product direction (`wrever`) and AI-assisted coding tools. This disclosure is intentional for hackathon honesty.

## Tools used

| Tool | Role |
|------|------|
| **Cursor** (Agent / Composer) | Implementation assistance: UI, API routes, docs, testnet scripts, refactors |
| **Grok** (chat) | Design/copy prompts and landing mock direction (referenced in internal notes) |
| Other LLMs | Occasional drafting of docs copy |

## What AI did *not* decide alone

- Product lock (DeFi security insurance for protocols on Stellar; clawback = claims ops only)
- Threat / cover exclusions and dual-track honesty (simulator vs live vault)
- On-chain deploy and Freighter signing performed with human-held keys / wallet

## Git hygiene

Commits are authored as `wrever`. Some agent sessions historically avoided `Co-authored-by` trailers; **this file is the canonical attribution**, not the absence of trailers.

Agents working in-repo: see [`AGENTS.md`](../AGENTS.md).
