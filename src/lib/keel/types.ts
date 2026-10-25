/** Bind cover primitives (off-chain sim + on-chain shape). Internal module path may still be `keel/`. */

export type Address = string;

export type UnsettledLot = {
  id: string;
  amount: number;
  /** unix ms when received / became unsettled */
  receivedAt: number;
  frozen: boolean;
  from: Address;
};

export type Account = {
  address: Address;
  /** free USDC (demo faucet / unwrap destination) */
  usdc: number;
  /** rUSDC that can unwrap 1:1 */
  settled: number;
  unsettled: UnsettledLot[];
};

export type Dispute = {
  id: string;
  claimant: Address;
  lotId: string;
  amount: number;
  reason: string;
  status: "open" | "approved" | "rejected";
  createdAt: number;
  resolvedAt?: number;
};

export type Role = "admin" | "pauser" | "recoverer" | "freezer";

/** Ops keys for pause / recover / freeze (demo strings; prod = multisig). */
export type KeelRoles = {
  admin: Address;
  pauser: Address;
  recoverer: Address;
  freezer: Address;
};

export type RetentionProfileId = "standard" | "kyc_fast_lane";

export type KeelConfig = {
  /** Retention window in ms (unsettled → claimable; free unwrap blocked) */
  windowMs: number;
  /** Retention profile driving window + KYC lane */
  retentionProfile: RetentionProfileId;
  /** true = compressed windows for interactive demo */
  demoMode: boolean;
  /** Partner attested KYC for Fast Lane (informational + gate) */
  kycAttested: boolean;
  /** Allow Exit Pool paid escape during retention */
  allowExitPool: boolean;
  /** basis points fee to instantly exit unsettled via Exit Pool */
  exitFeeBps: number;
  /** hard cap on covered credit supply (0 = unlimited) */
  maxSupply: number;
  /** max size of a single unsettled lot / transfer */
  maxUnsettledPerLot: number;
  /** max unsettled supply across all accounts (0 = unlimited) */
  maxUnsettledSupply: number;
  /** max amount indemnified in a single claim */
  maxClaimAmount: number;
  /** max open claims per claimant address */
  maxOpenClaimsPerAccount: number;
  assetSymbol: "rUSDC";
  baseSymbol: "USDC";
};

export type ProofOfReserves = {
  vaultUsdc: number;
  rUsdcSupply: number;
  settledSupply: number;
  unsettledSupply: number;
  fullyBacked: boolean;
  ratio: number;
  asOf: number;
  paused: boolean;
  protocolFeesEarned: number;
  exitPoolUsdc: number;
  maxSupply: number;
};

export type KeelEvent =
  | { type: "deposit"; at: number; address: Address; amount: number }
  | { type: "transfer"; at: number; from: Address; to: Address; amount: number }
  | { type: "settle"; at: number; address: Address; amount: number }
  | { type: "settle_all"; at: number; amount: number; accounts: number }
  | { type: "unwrap"; at: number; address: Address; amount: number }
  | { type: "exit_pool"; at: number; address: Address; amount: number; fee: number }
  | { type: "freeze"; at: number; lotId: string; address: Address }
  | { type: "recover"; at: number; lotId: string; from: Address; to: Address; amount: number }
  | { type: "dispute_open"; at: number; disputeId: string; claimant: Address }
  | { type: "dispute_resolve"; at: number; disputeId: string; status: "approved" | "rejected" }
  | { type: "pause"; at: number; paused: boolean };

export type KeelState = {
  config: KeelConfig;
  vaultUsdc: number;
  accounts: Record<Address, Account>;
  disputes: Dispute[];
  events: KeelEvent[];
  /** Exit Pool USDC liquidity (working capital) */
  exitPoolUsdc: number;
  /** Cumulative exit fees earned */
  protocolFeesEarned: number;
  /** Emergency pause — blocks deposit/transfer/unwrap/exit */
  paused: boolean;
  /** Arbiter / ops role holders */
  roles: KeelRoles;
};
