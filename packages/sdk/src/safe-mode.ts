/**
 * Embeddable Safe Mode surface for partner wallets.
 * Framework-agnostic; React hook lives in use-safe-mode.ts.
 */

export {
  safeModeSnapshot,
  viewLots,
  SAFE_MODE_COPY,
  type SafeModeSnapshot,
  type LotView,
} from "../../../src/lib/keel/safe-mode";

export type SafeModeActions = {
  wrap: (amount: number) => void;
  send: (to: string, amount: number) => void;
  settle: () => void;
  unwrap: (amount: number) => void;
  exit: (amount: number) => void;
  dispute: (holder: string, lotId: string, reason?: string) => void;
};
