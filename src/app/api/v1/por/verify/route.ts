import {
  porIsDemoAttestation,
  verifyPorSignature,
} from "@/lib/keel/por-sign";
import { jsonError, jsonOk, readBody } from "@/lib/keel/http";

export const dynamic = "force-dynamic";

/** Verify a previously issued signed PoR payload. */
export async function POST(req: Request) {
  const body = await readBody(req);
  const signature = body.signature as
    | { alg?: string; sig?: string; payload?: string }
    | undefined;
  if (
    !signature ||
    typeof signature.alg !== "string" ||
    typeof signature.sig !== "string" ||
    typeof signature.payload !== "string"
  ) {
    return jsonError("Body must include signature.{alg,sig,payload}", 400);
  }
  const demo = porIsDemoAttestation();
  const valid = verifyPorSignature({
    signature: {
      alg: signature.alg,
      sig: signature.sig,
      payload: signature.payload,
    },
  });
  return jsonOk({
    valid,
    demo,
    attestation: demo ? "demo-hmac-not-custody-proof" : "hmac",
    keyId: process.env.KEEL_POR_KEY_ID ?? "demo",
  });
}
