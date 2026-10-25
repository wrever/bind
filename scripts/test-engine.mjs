/**
 * Minimal engine smoke test (no test runner required).
 * Run: node scripts/test-engine.mjs
 *
 * Uses dynamic import of compiled path — for now we duplicate critical assertions
 * by spawning tsx if available, else skip with note.
 */

import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const runner = spawnSync(
  "npx",
  [
    "--yes",
    "tsx",
    "-e",
    `
import {
  createInitialState, deposit, transfer, settle, unwrap, exitPool,
  openDisputeAsSender, resolveDispute, por
} from "./src/lib/keel/engine.ts";

let s = createInitialState({ windowMs: 10 });
s = deposit(s, "alice", 200);
s = transfer(s, "alice", "bob", 50);
const lot = s.accounts.bob.unsettled[0];
if (!lot) throw new Error("expected unsettled lot");
s = openDisputeAsSender(s, "alice", "bob", lot.id, "theft");
s = resolveDispute(s, s.disputes[0].id, true);
if (s.accounts.alice.settled < 150) throw new Error("recover failed");
// fresh transfer + wait settle
s = transfer(s, "alice", "bob", 20);
await new Promise(r => setTimeout(r, 15));
s = settle(s, "bob");
if (s.accounts.bob.settled < 20) throw new Error("settle failed");
s = unwrap(s, "bob", 20);
const r = por(s);
if (!r.fullyBacked) throw new Error("peg broken");
// exit pool path
s = deposit(s, "alice", 100);
s = transfer(s, "alice", "merchant", 40);
s = exitPool(s, "merchant", 40);
console.log("ok", JSON.stringify(por(s)));
`,
  ],
  { cwd: root, encoding: "utf8", timeout: 60000 },
);

if (runner.status !== 0) {
  console.error(runner.stdout);
  console.error(runner.stderr);
  process.exit(runner.status ?? 1);
}
console.log(runner.stdout.trim());
