#!/usr/bin/env node
import { readFileSync } from "node:fs";
const R = JSON.parse(readFileSync(process.argv[2], "utf8"));
const files = process.argv.slice(3);
const TW = { "rounded-none":0,"rounded-sm":2,rounded:4,"rounded-md":6,"rounded-lg":8,"rounded-xl":12,"rounded-2xl":16,"rounded-3xl":24,"rounded-full":9999 };
const out = files.map((f) => {
  const code = readFileSync(f, "utf8");
  const drifts = [];
  const grads = (code.match(/(?:linear|radial|conic)-gradient\(|\bbg-gradient-to-\w+/g) || []).length;
  if (grads && !R.gradientsAllowed) drifts.push({ category:"pattern", severity:"high", found:`${grads} gradient(s)`, fix:"no gradients" });
  if (/blur\(/.test(code) && !R.blurAllowed) drifts.push({ category:"pattern", severity:"medium", found:"blur", fix:"no blur" });
  for (const m of new Set(code.match(/\b(?:from|via|to|bg|text)-(?:purple|violet|indigo|fuchsia)-\d{2,3}\b/g) || [])) {
    drifts.push({ category:"color", severity:"high", found:m, fix:`use ${R.accent}` });
  }
  const radii = new Set(R.radii);
  for (const c of code.match(/\brounded(?:-[a-z0-9]+)?\b/g) || []) {
    const v = TW[c];
    if (v !== undefined && !radii.has(v) && v < 999) drifts.push({ category:"radius", severity:"medium", found:c, fix:`use ${R.radius}` });
  }
  const score = Math.max(0, 100 - drifts.reduce((a,d)=>a+(d.severity==="high"?12:d.severity==="medium"?6:2),0));
  return { file:f, style:R.slug, score, drifts };
});
console.log(JSON.stringify(out, null, 2));
process.exit(out.some(o => o.drifts.some(d => d.severity === "high")) ? 1 : 0);
