import { NextResponse } from "next/server";

/** Shared bearer for local faucet + resolve (BIND_OPS_TOKEN). */
export function requireOpsToken(req: Request): NextResponse | null {
  const expected = process.env.BIND_OPS_TOKEN?.trim();
  if (!expected) {
    return NextResponse.json(
      {
        error: "ops_disabled",
        message: "Set BIND_OPS_TOKEN in .env.local (see .env.example)",
      },
      { status: 503 },
    );
  }
  const header = req.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : header.trim();
  if (!token || token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
