"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { ChainStatus } from "@/components/chain-status";
import { FreighterConnect } from "@/components/freighter-connect";
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
    if (addr) void refreshAccount(addr);
    else setAccount(null);
  }, [refreshAccount]);

  useEffect(() => {
    void syncWallet();
    const timer = setInterval(() => void syncWallet(), 5000);
    return () => clearInterval(timer);
  }, [syncWallet]);

  function pushLog(row: Omit<TxLog, "at">) {
    setLog((prev) => [{ ...row, at: new Date().toISOString() }, ...prev].slice(0, 10));
  }

  async function run(action: VaultAction, lotId?: string) {
    setError(null);
    if (!address) {
      setError(t("needWallet"));
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
        if (!to.trim()) throw new Error(t("needTo"));
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

      const sub = await signAndSubmit(
        address,
        prep.xdr,
        prep.networkPassphrase,
      );
      const detail =
        action === "transfer" && sub.returnValue != null
          ? `lot #${String(sub.returnValue)}`
          : undefined;
      pushLog({
        action,
        status: sub.status ?? "UNKNOWN",
        hash: sub.hash,
        explorerUrl: sub.explorerUrl,
        detail,
      });
      await refreshAccount(address);
    } catch (e) {
      const message = e instanceof Error ? e.message : "tx failed";
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
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.85rem,4.5vw,2.75rem)] font-extrabold leading-[1.12] tracking-[-0.03em] text-[var(--color-text)]">
              {t("title")}
            </h1>
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
      </header>

      <section className="relative space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone={address ? "ok" : "mute"}>
            {address ? t("walletOn") : t("walletOff")}
          </Badge>
          {account && !account.exists ? (
            <Badge tone="warn">{t("noAccount")}</Badge>
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
          <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-muted)]">
            {account.address.slice(0, 4)}…{account.address.slice(-4)}
            {" · "}
            <a
              href={account.explorer.account}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-accent2)] underline underline-offset-4"
            >
              explorer
            </a>
          </p>
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
        <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[var(--color-text)] md:text-2xl">
          {t("signTitle")}
        </h2>

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
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button disabled={!!busy} onClick={() => void run("deposit")}>
            {busy === "deposit" ? t("signing") : t("deposit")}
            <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
          </Button>
          <Button
            variant="outline"
            disabled={!!busy}
            onClick={() => void run("transfer")}
          >
            {busy === "transfer" ? t("signing") : t("transfer")}
          </Button>
          <Button
            variant="outline"
            disabled={!!busy}
            onClick={() => void run("settle")}
          >
            {busy === "settle" ? t("signing") : t("settle")}
          </Button>
          <Button
            variant="outline"
            disabled={!!busy}
            onClick={() => void run("unwrap")}
          >
            {busy === "unwrap" ? t("signing") : t("unwrap")}
          </Button>
          <Button
            variant="outline"
            disabled={!!busy}
            onClick={() => void run("exit")}
          >
            {busy === "exit" ? t("signing") : t("exit")}
          </Button>
        </div>

        {account?.lots && account.lots.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--color-text)]">
              {t("lotsTitle")}
            </h3>
            <ul className="divide-y divide-[var(--color-line)] border border-[var(--color-line)]">
              {account.lots.map((lot) => (
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
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!!busy || lot.frozen}
                      onClick={() => void run("dispute", lot.id)}
                    >
                      {busy === `dispute${lot.id}`
                        ? t("signing")
                        : t("dispute")}
                    </Button>
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
                    ) : null}
                  </div>
                </li>
              ))}
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
