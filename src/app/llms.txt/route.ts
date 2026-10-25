import { DOC_PAGES } from "@/content/docs/catalog";

export const dynamic = "force-static";

/** LLM-oriented site brief — keep insurance vocabulary, dual-track honesty. */
export function GET() {
  const vault = "CCQEAW5T6LFIANNOYFVIATYYXBEOERAXGCGRLLSHBQDU6XSCCJCOHL5J";
  const lines = [
    "# Bind",
    "",
    "> DeFi security insurance on Stellar. Protocols contract Bind; users get Protected Deposit (timed retention) and in-window claims while funds stay on the Bind rail.",
    "",
    "## Product lock",
    "- Buyers: DeFi protocols and partner wallets (not a consumer download app).",
    "- Language: insurance / cover / retention / policy / premium / claim.",
    "- Clawback = claims ops (Unlocked), never the storefront brand.",
    "- Not: payment gateway, remittance, consumer wallet, lending/yield.",
    "",
    "## Mechanic",
    "1. Deposit USDC → covered credit 1:1",
    "2. Transfer → unsettled lot with retention window T (Standard ~12h / Fast Lane ~1h KYC)",
    "3a. No breach → settle → unwrap",
    "3b. Breach on-rail → claim → COVER clawback remint",
    "Invariant: vault_USDC >= covered_supply",
    "",
    "## Surfaces",
    "- /demo — local policy simulator (no wallet)",
    "- /live — Freighter-signed vault txs on Stellar testnet",
    "- /por — local + live por() + COVER evidence",
    "- /integrate — partner path",
    "- /docs/* — product documentation",
    "- /api/v1/sessions — simulator API (not custody)",
    "- /api/v1/chain/* — live testnet vault prepare/submit/por",
    "",
    "## Testnet",
    `- Vault: ${vault}`,
    "- RPC: https://soroban-testnet.stellar.org",
    "- Collateral: TUSDC stand-in for Circle USDC",
    "",
    "## Docs index",
    ...DOC_PAGES.sort((a, b) => a.order - b.order).map(
      (p) => `- /docs/${p.slug}: ${p.title.en} — ${p.description.en}`,
    ),
    "",
    "## LLM page summaries",
    ...DOC_PAGES.sort((a, b) => a.order - b.order).flatMap((p) => [
      "",
      `### ${p.title.en}`,
      p.llm.en,
    ]),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
