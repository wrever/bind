"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { ChainStatus } from "@/components/chain-status";
import { FreighterConnect } from "@/components/freighter-connect";
import { FadeChip } from "@/components/motion/fade-chip";
import { SplitRise } from "@/components/motion/split-rise";
import { StatusMark } from "@/components/motion/status-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

type LotView = {
  id: string;
  amount: string;
  receivedAt: string;
  frozen: boolean;
  from: string;
};

type SentLot = {
  id: string;
  to: string;
  amount: string;
  at: string;
};

type AccountView = {
  address: string;
  exists: boolean;
  xlm?: string;
  tusdc?: string;
  settled?: string;
  unsettled?: string;
  lots?: LotView[];
  vault: string;
  windowSecs?: number;
  explorer: { vault: string; account: string };
};

type TxLog = {
  action: string;
  status: string;
  hash?: string;
  explorerUrl?: string;
  detail?: string;
  error?: string;
  at: string;
};

type VaultAction =
  | "deposit"
  | "transfer"
  | "settle"
  | "unwrap"
  | "exit"
  | "dispute";

const OPS_TOKEN =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_BIND_OPS_TOKEN?.trim() || ""
    : "";

async function freighterAddress(): Promise<string | null> {
  try {
    const api = await import("@stellar/freighter-api");
    const connected = await api.isConnected();
    if (connected.error || !connected.isConnected) return null;
    const allowed = await api.isAllowed();
    if (allowed.error || !allowed.isAllowed) return null;
    const addr = await api.getAddress();
    if (addr.error || !addr.address) return null;
    return addr.address;
  } catch {
    return null;
  }
}

async function assertFreighterTestnet() {
  const api = await import("@stellar/freighter-api");
  const net = await api.getNetwork();
  if (net.error) {
    throw new Error(net.error.message ?? "Could not read Freighter network");
  }
  const name = (net.network || "").toUpperCase();
  const pass = net.networkPassphrase || "";
  const ok =
    name.includes("TESTNET") ||
    pass.includes("Test SDF Network");
  if (!ok) {
    throw new Error("NEED_TESTNET");
  }
}

async function signAndSubmit(
  address: string,
  xdr: string,
  networkPassphrase: string,
) {
  const api = await import("@stellar/freighter-api");
  const signed = await api.signTransaction(xdr, {
    networkPassphrase,
    address,
  });
  if (signed.error || !signed.signedTxXdr) {
    throw new Error(signed.error?.message ?? "Freighter rejected");
  }
  const subRes = await fetch("/api/v1/chain/tx/submit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ signedXdr: signed.signedTxXdr }),
  });
  const sub = (await subRes.json()) as {
    hash?: string;
    status?: string;
    explorerUrl?: string;
    returnValue?: unknown;
    message?: string;
  };
  if (!subRes.ok) throw new Error(sub.message ?? "submit failed");
  return sub;
}

export function LiveRail() {
  const t = useTranslations("Live");
  const [address, setAddress] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountView | null>(null);
  const [amount, setAmount] = useState("10");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [log, setLog] = useState<TxLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));
  const [sentLots, setSentLots] = useState<SentLot[]>([]);

  const refreshAccount = useCallback(async (addr: string) => {
    try {
      const res = await fetch(
        `/api/v1/chain/account?address=${encodeURIComponent(addr)}`,
        { cache: "no-store" },
      );
      const json = (await res.json()) as AccountView & { message?: string };
      if (!res.ok) throw new Error(json.message ?? "account fetch failed");
      setAccount(json);
    } catch (e) {
      setAccount(null);
      setError(e instanceof Error ? e.message : "account error");
    }
  }, []);

  const syncWallet = useCallback(async () => {
    const addr = await freighterAddress();
    setAddress(addr);
    if (addr) {
      void refreshAccount(addr);
      setSentLots(loadSentLots(addr));
    } else {
      setAccount(null);
      setSentLots([]);
    }
  }, [refreshAccount]);

  useEffect(() => {
    void syncWallet();
    const timer = setInterval(() => void syncWallet(), 5000);
    const onFreighter = () => void syncWallet();
    window.addEventListener("bind:freighter", onFreighter);
    return () => {
      clearInterval(timer);
      window.removeEventListener("bind:freighter", onFreighter);
    };
  }, [syncWallet]);

  useEffect(() => {
    const tick = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(tick);
  }, []);

  const windowSecs = account?.windowSecs ?? 60;

  function pushLog(row: Omit<TxLog, "at">) {
    setLog((prev) => [{ ...row, at: new Date().toISOString() }, ...prev].slice(0, 10));
  }

  function mapChainError(raw: string, action?: VaultAction): string {
    if (/Contract,\s*#6|#6\b/.test(raw)) {
      if (action === "exit") return t("errExitNeedsUnsettled");
      return t("errInsufficient");
    }
    if (/Contract,\s*#4|#4\b/.test(raw)) return t("errUnauthorized");
    if (/Contract,\s*#8|#8\b/.test(raw)) return t("errNotFound");
    if (/Contract,\s*#12|#12\b/.test(raw)) return t("errSelfTransfer");
    if (/Contract,\s*#13|#13\b/.test(raw)) return t("errExitIlliquid");
    return raw;
  }

  function preflight(action: VaultAction): string | null {
    const settledN = Number(account?.settled ?? 0);
    const unsettledN = Number(account?.unsettled ?? 0);
    if (action === "unwrap" && settledN <= 0) return t("preflightNoSettled");
    if (action === "exit" && unsettledN <= 0) return t("preflightNoUnsettledExit");
    if (action === "settle" && unsettledN <= 0) {
      // Settle only matures lots on the signing wallet. Lots you Transfer'd sit on the recipient.
      return sentLots.length > 0
        ? t("preflightSettleAsSender")
        : t("preflightNoUnsettledSettle");
    }
    if (action === "transfer") {
      const dest = to.trim();
      if (!dest) return t("needTo");
      if (address && dest === address) return t("errSelfTransfer");
    }
    return null;
  }

  async function run(action: VaultAction, lotId?: string) {
    setError(null);
    if (!address) {
      setError(t("needWallet"));
      return;
    }
    const blocked = preflight(action);
    if (blocked) {
      setError(blocked);
      return;
    }
    setBusy(action + (lotId ?? ""));
    try {
      const prepBody: Record<string, string> = { action, address };
      if (
        action === "deposit" ||
        action === "unwrap" ||
        action === "transfer" ||
        action === "exit"
      ) {
        prepBody.amount = amount;
      }
      if (action === "transfer") {
        prepBody.to = to.trim();
      }
      if (action === "dispute") {
        if (!lotId) throw new Error(t("needLot"));
        prepBody.lotId = lotId;
      }

      const prepRes = await fetch("/api/v1/chain/tx/prepare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(prepBody),
      });
      const prep = (await prepRes.json()) as {
        xdr?: string;
        networkPassphrase?: string;
        message?: string;
      };
      if (!prepRes.ok || !prep.xdr || !prep.networkPassphrase) {
        throw new Error(prep.message ?? "prepare failed");
      }

      try {
        await assertFreighterTestnet();
      } catch (e) {
        if (e instanceof Error && e.message === "NEED_TESTNET") {
          throw new Error(t("needTestnet"));
        }
        throw e;
      }

      const sub = await signAndSubmit(
        address,
        prep.xdr,
        prep.networkPassphrase,
      );
      const status = sub.status ?? "UNKNOWN";
      if (status !== "SUCCESS") {
        throw new Error(
          status === "PENDING"
            ? t("txPending")
            : t("txFailed", { status }),
        );
      }
      let detail: string | undefined;
      if (action === "transfer" && sub.returnValue != null) {
        const lotId = String(sub.returnValue);
        detail = `lot #${lotId}`;
        // Contract: only the sender (lot.from) can dispute — track locally.
        rememberSentLot(address, {
          id: lotId,
          to: to.trim(),
          amount: amount.trim() || "?",
          at: new Date().toISOString(),
        });
        setSentLots(loadSentLots(address));
      } else if (action === "settle" && isZeroReturn(sub.returnValue)) {
        // Unsettled > 0 but window not elapsed yet (or frozen).
        detail = t("settleZero");
        setError(t("settleZero"));
      }
      pushLog({
        action,
        status,
        hash: sub.hash,
        explorerUrl: sub.explorerUrl,
        detail,
      });
      await refreshAccount(address);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "tx failed";
      const message = mapChainError(raw, action);
      setError(message);
      pushLog({ action, status: "ERROR", error: message });
    } finally {
      setBusy(null);
    }
  }

  async function faucet(trustlineOnly = false) {
    setError(null);
    if (!address) {
      setError(t("needWallet"));
      return;
    }
    if (!OPS_TOKEN) {
      setError(t("opsDisabled"));
      return;
    }
    setBusy(trustlineOnly ? "trustline" : "faucet");
    try {
      const res = await fetch("/api/v1/chain/faucet", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${OPS_TOKEN}`,
        },
        body: JSON.stringify({
          address,
          amount: "50",
          trustlineOnly: trustlineOnly || undefined,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        message?: string;
        xdr?: string;
        networkPassphrase?: string;
        hash?: string;
        explorerUrl?: string;
        amount?: string;
      };

      if (res.status === 409 || json.error === "need_trustline") {
        setError(t("needTrustline"));
        return;
      }

      if (trustlineOnly) {
        if (!res.ok || !json.xdr || !json.networkPassphrase) {
          throw new Error(json.message ?? "trustline prepare failed");
        }
        try {
          await assertFreighterTestnet();
        } catch (e) {
          if (e instanceof Error && e.message === "NEED_TESTNET") {
            throw new Error(t("needTestnet"));
          }
          throw e;
        }
        const sub = await signAndSubmit(
          address,
          json.xdr,
          json.networkPassphrase,
        );
        pushLog({
          action: "trustline",
          status: sub.status ?? "UNKNOWN",
          hash: sub.hash,
          explorerUrl: sub.explorerUrl,
        });
        await refreshAccount(address);
        return;
      }

      if (!res.ok) throw new Error(json.message ?? "faucet failed");
      pushLog({
        action: "faucet",
        status: "SUCCESS",
        hash: json.hash,
        explorerUrl: json.explorerUrl,
        detail: json.amount ? `+${json.amount} TUSDC` : undefined,
      });
      await refreshAccount(address);
    } catch (e) {
      const message = e instanceof Error ? e.message : "faucet failed";
      setError(message);
      pushLog({
        action: trustlineOnly ? "trustline" : "faucet",
        status: "ERROR",
        error: message,
      });
    } finally {
      setBusy(null);
    }
  }

  async function resolveLot(lotId: string, approve: boolean) {
    setError(null);
    if (!OPS_TOKEN) {
      setError(t("opsDisabled"));
      return;
    }
    setBusy(`resolve-${lotId}-${approve}`);
    try {
      const res = await fetch("/api/v1/chain/tx/resolve", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${OPS_TOKEN}`,
        },
        body: JSON.stringify({ lotId, approve }),
      });
      const json = (await res.json()) as {
        message?: string;
        hash?: string;
        status?: string;
        explorerUrl?: string;
      };
      if (!res.ok) throw new Error(json.message ?? "resolve failed");
      pushLog({
        action: approve ? "resolve:approve" : "resolve:reject",
        status: json.status ?? "UNKNOWN",
        hash: json.hash,
        explorerUrl: json.explorerUrl,
        detail: `lot #${lotId}`,
      });
      if (address) await refreshAccount(address);
    } catch (e) {
      const message = e instanceof Error ? e.message : "resolve failed";
      setError(message);
      pushLog({ action: "resolve", status: "ERROR", error: message });
    } finally {
      setBusy(null);
    }
  }

  const lowTusdc =
    !account?.tusdc || account.tusdc === "0" || Number(account.tusdc) < 1;
  const showOps = Boolean(OPS_TOKEN);

  return (
    <div className="relative mx-auto max-w-5xl space-y-12 px-5 pb-20 pt-10 md:px-10 md:pb-24 md:pt-14">
      <header className="relative border-b border-[var(--color-line)] pb-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
              {t("meta")}
            </p>
            <SplitRise
              text={t("title")}
              as="h1"
              className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.85rem,4.5vw,2.75rem)] font-extrabold leading-[1.12] tracking-[-0.03em] text-[var(--color-text)]"
            />
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-muted)] md:text-base">
              {t("body")}{" "}
              <Link
                href="/demo"
                className="text-[var(--color-accent2)] underline underline-offset-4"
              >
                {t("demoLink")}
              </Link>
            </p>
          </div>
          <FreighterConnect />
        </div>

        <div className="mt-8 max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
            {t("howTitle")}
          </p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              t("how1"),
              t("how2"),
              t("how3", { secs: windowSecs }),
              t("how4"),
            ].map((step, i) => (
              <li
                key={step}
                className="flex gap-3 border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-sm leading-snug text-[var(--color-muted)]"
              >
                <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-accent2)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </header>

      <section className="relative space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusMark status={address ? "done" : "pending"} size={14} />
          <FadeChip>{address ? t("walletOn") : t("walletOff")}</FadeChip>
          <FadeChip>{t("windowChip", { secs: windowSecs })}</FadeChip>
          {account && !account.exists ? (
            <FadeChip alert>{t("noAccount")}</FadeChip>
          ) : null}
          {account?.tusdc ? (
            <Badge tone="sea">TUSDC {account.tusdc}</Badge>
          ) : null}
          {account?.settled != null ? (
            <Badge tone="mute">
              {t("settled")} {account.settled}
            </Badge>
          ) : null}
          {account?.unsettled != null ? (
            <Badge tone="mute">
              {t("unsettled")} {account.unsettled}
            </Badge>
          ) : null}
        </div>

        {account ? (
          <div className="space-y-1 font-[family-name:var(--font-mono)] text-xs text-[var(--color-muted)]">
            <p>
              {account.address.slice(0, 4)}…{account.address.slice(-4)}
              {" · "}
              <a
                href={account.explorer.account}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-accent2)] underline underline-offset-4"
              >
                {t("explorerAccount")}
              </a>
            </p>
            <p>
              {t("vaultLabel")}{" "}
              {account.vault.slice(0, 4)}…{account.vault.slice(-4)}
              {" · "}
              <a
                href={account.explorer.vault}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-accent2)] underline underline-offset-4"
              >
                {t("explorerVault")}
              </a>
            </p>
          </div>
        ) : null}

        {lowTusdc ? (
          <aside className="space-y-3 border border-[var(--color-line)] bg-[var(--color-surface)]/40 px-4 py-3 text-sm text-[var(--color-muted)]">
            <p>{t("noTusdc")}</p>
            {showOps ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={!!busy || !address}
                  onClick={() => void faucet(false)}
                >
                  {busy === "faucet" ? t("signing") : t("getTusdc")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!!busy || !address}
                  onClick={() => void faucet(true)}
                >
                  {busy === "trustline" ? t("signing") : t("addTrustline")}
                </Button>
              </div>
            ) : null}
          </aside>
        ) : null}
      </section>

      <section className="relative space-y-6 border-t border-[var(--color-line)] pt-10">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[var(--color-text)] md:text-2xl">
            {t("signTitle")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
            {t("signBody")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-[var(--color-muted)]">
            {t("amount")}
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="10"
            />
          </label>
          <label className="space-y-2 text-sm text-[var(--color-muted)]">
            {t("transferTo")}
            <Input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="G…"
              className="font-[family-name:var(--font-mono)] text-xs"
            />
            <span className="block text-xs text-[var(--color-muted)]/80">
              {t("transferToHint")}
            </span>
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="space-y-1">
            <Button disabled={!!busy} onClick={() => void run("deposit")}>
              {busy === "deposit" ? t("signing") : t("deposit")}
              <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
            </Button>
            <p className="max-w-[11rem] text-[11px] leading-snug text-[var(--color-muted)]">
              {t("hintDeposit")}
            </p>
          </div>
          <div className="space-y-1">
            <Button
              variant="outline"
              disabled={!!busy}
              onClick={() => void run("transfer")}
            >
              {busy === "transfer" ? t("signing") : t("transfer")}
            </Button>
            <p className="max-w-[11rem] text-[11px] leading-snug text-[var(--color-muted)]">
              {t("hintTransfer")}
            </p>
          </div>
          <div className="space-y-1">
            <Button
              variant="outline"
              disabled={!!busy}
              onClick={() => void run("settle")}
            >
              {busy === "settle" ? t("signing") : t("settle")}
            </Button>
            <p className="max-w-[11rem] text-[11px] leading-snug text-[var(--color-muted)]">
              {t("hintSettle")}
            </p>
          </div>
          <div className="space-y-1">
            <Button
              variant="outline"
              disabled={!!busy}
              onClick={() => void run("unwrap")}
            >
              {busy === "unwrap" ? t("signing") : t("unwrap")}
            </Button>
            <p className="max-w-[11rem] text-[11px] leading-snug text-[var(--color-muted)]">
              {t("hintUnwrap")}
            </p>
          </div>
          <div className="space-y-1">
            <Button
              variant="outline"
              disabled={!!busy}
              onClick={() => void run("exit")}
            >
              {busy === "exit" ? t("signing") : t("exit")}
            </Button>
            <p className="max-w-[11rem] text-[11px] leading-snug text-[var(--color-muted)]">
              {t("hintExit")}
            </p>
          </div>
        </div>

        {account?.lots && account.lots.length > 0 ? (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text)]">
                {t("lotsTitle")}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {t("lotsHint")}
              </p>
            </div>
            <ul className="divide-y divide-[var(--color-line)] border border-[var(--color-line)]">
              {account.lots.map((lot) => {
                const wait = lotWaitSecs(lot.receivedAt, windowSecs, nowSec);
                const ready = !lot.frozen && wait <= 0;
                return (
                  <li
                    key={lot.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="text-sm text-[var(--color-muted)]">
                      <span className="font-[family-name:var(--font-mono)] text-[var(--color-text)]">
                        #{lot.id}
                      </span>
                      {" · "}
                      {lot.amount} cover
                      {lot.frozen ? ` · ${t("frozen")}` : null}
                      {!lot.frozen
                        ? ` · ${ready ? t("lotReady") : t("lotWait", { secs: wait })}`
                        : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {showOps && lot.frozen ? (
                        <>
                          <Button
                            size="sm"
                            disabled={!!busy}
                            onClick={() => void resolveLot(lot.id, true)}
                          >
                            {t("approve")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!busy}
                            onClick={() => void resolveLot(lot.id, false)}
                          >
                            {t("reject")}
                          </Button>
                        </>
                      ) : (
                        <p className="text-xs text-[var(--color-muted)]">
                          {t("disputeSenderOnly")}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {sentLots.length > 0 ? (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text)]">
                {t("sentLotsTitle")}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {t("sentLotsHint")}
              </p>
            </div>
            <ul className="divide-y divide-[var(--color-line)] border border-[var(--color-line)]">
              {sentLots.map((lot) => {
                const wait = lotWaitSecs(lot.at, windowSecs, nowSec);
                const ready = wait <= 0;
                return (
                <li
                  key={`sent-${lot.id}`}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-sm text-[var(--color-muted)]">
                    <span className="font-[family-name:var(--font-mono)] text-[var(--color-text)]">
                      #{lot.id}
                    </span>
                    {" · "}
                    {lot.amount} cover → {lot.to.slice(0, 4)}…{lot.to.slice(-4)}
                    {" · "}
                    {ready ? t("sentLotReady") : t("lotWait", { secs: wait })}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!!busy}
                    onClick={() => void run("dispute", lot.id)}
                  >
                    {busy === `dispute${lot.id}` ? t("signing") : t("dispute")}
                  </Button>
                </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {error ? (
          <p className="text-sm text-[var(--color-alert)]">{error}</p>
        ) : null}

        {log.length > 0 ? (
          <ul className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
            {log.map((row, i) => (
              <li
                key={`${row.at}-${i}`}
                className="grid gap-2 py-4 text-sm sm:grid-cols-[7rem_1fr_auto]"
              >
                <span className="font-[family-name:var(--font-mono)] text-xs tracking-[0.06em] text-[var(--color-muted)]">
                  {row.action}
                </span>
                <span className="text-[var(--color-text)]">
                  {row.status}
                  {row.detail ? ` · ${row.detail}` : null}
                  {row.error ? ` · ${row.error}` : null}
                </span>
                {row.explorerUrl ? (
                  <a
                    href={row.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--color-accent2)] underline underline-offset-4"
                  >
                    {t("openTx")}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <ChainStatus />
    </div>
  );
}

function isZeroReturn(value: unknown): boolean {
  if (value == null) return false;
  if (value === 0 || value === "0") return true;
  if (typeof value === "bigint") return value === BigInt(0);
  if (typeof value === "string") {
    return /^-?0(i128|u128|i64|u64)?$/i.test(value.trim());
  }
  return false;
}

/** Seconds left until a lot can settle (testnet windowSecs). */
function lotWaitSecs(
  receivedAt: string,
  windowSecs: number,
  nowSec: number,
): number {
  const raw = receivedAt.trim();
  let received = Number(raw);
  // On-chain lots use unix secs; browser-tracked sent lots use ISO.
  if (!Number.isFinite(received)) {
    const ms = Date.parse(raw);
    received = Number.isFinite(ms) ? Math.floor(ms / 1000) : NaN;
  } else if (received > 1e12) {
    received = Math.floor(received / 1000);
  }
  if (!Number.isFinite(received)) return windowSecs;
  return Math.max(0, Math.ceil(received + windowSecs - nowSec));
}

function sentLotsKey(address: string) {
  return `bind-sent-lots-v1:${address}`;
}

function loadSentLots(address: string): SentLot[] {
  try {
    const raw = localStorage.getItem(sentLotsKey(address));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SentLot[];
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
  } catch {
    return [];
  }
}

function rememberSentLot(address: string, lot: SentLot) {
  try {
    const prev = loadSentLots(address).filter((x) => x.id !== lot.id);
    localStorage.setItem(
      sentLotsKey(address),
      JSON.stringify([lot, ...prev].slice(0, 20)),
    );
  } catch {
    /* private mode */
  }
}
