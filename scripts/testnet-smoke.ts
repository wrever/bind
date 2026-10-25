export {};

/**
 * Read PoR from the published testnet vault via stellar CLI.
 * Requires: stellar on PATH, network reachable.
 */

import { readFileSync, existsSync } from "fs";
import path from "path";
import { execFileSync } from "child_process";

const ROOT = process.cwd();
const ADDR = path.join(ROOT, "docs/testnet.addresses.json");

function main() {
  if (!existsSync(ADDR)) {
    throw new Error("docs/testnet.addresses.json missing — run npm run testnet:up");
  }
  const cfg = JSON.parse(readFileSync(ADDR, "utf8")) as {
    vault: string;
    status: string;
  };
  if (cfg.status !== "live") {
    throw new Error(`testnet status is ${cfg.status}, expected live`);
  }

  const stellar =
    process.env.STELLAR_BIN ||
    `${process.env.HOME}/.local/bin/stellar`;

  const out = execFileSync(
    stellar,
    [
      "contract",
      "invoke",
      "--id",
      cfg.vault,
      "--source",
      "keel-admin",
      "--network",
      "testnet",
      "--",
      "por",
    ],
    { encoding: "utf8" },
  ).trim();

  // CLI may print log lines; find JSON object
  const jsonLine = out
    .split("\n")
    .map((l) => l.trim())
    .reverse()
    .find((l) => l.startsWith("{"));
  if (!jsonLine) throw new Error(`no por json in output:\n${out}`);
  const por = JSON.parse(jsonLine) as { fully_backed: boolean; supply: string };
  if (!por.fully_backed) throw new Error(`peg broken: ${jsonLine}`);
  console.log("ok", { vault: cfg.vault, por });
}

main();
