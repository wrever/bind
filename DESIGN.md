---
version: alpha
name: "American Dynamism"
product: Bind
updated: 2026-10-25
---

# Bind · American Dynamism

Protocol-cover infra UI: near-monochrome dark field, **one** signal accent (orange), cyan only for live PoR/data, Swiss hairlines, mono status readouts.

## Tokens (mapped)

| Role | Hex | Use |
|------|-----|-----|
| Neutral / bg | `#0E100D` | page |
| Surface | `#22211E` | panels |
| Outline | `#3A3934` | decorative hairlines |
| Outline strong | `#71706C` | inputs |
| Text | `#F5F5F2` | body |
| Muted | `#AFAFAC` | captions |
| Accent (CTA) | `#F54307` | primary action only |
| Live data | `#01E4FD` | PoR / status live |
| Alert | `#F12A02` | errors / disputes |

## Rules

- No soft shadows, no gradients on fills, radius ≤ 4px (chips may be full).
- Every surface: `ID · TITLE · STATUS` meta when possible (`KL-001`).
- Headlines: Inter Tight 800, tight tracking. Labels: JetBrains Mono caps.
- Cyan = live readings only. Orange = CTA. Red = alert.
- Prefer Lucide (already in repo) as icon fallback; Tabler outline preferred by Fuzz.

Checker: `node .fuzz/fuzz-check.mjs .fuzz/rules.json <files>`
