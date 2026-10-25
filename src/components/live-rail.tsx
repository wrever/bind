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

type AccountView = {
  address: string;
  exists: boolean;
  xlm?: string;
  tusdc?: string;
  vault: string;
  explorer: { vault: string; account: string };
};

type TxLog = {
  action: string;
  status: string;
  hash?: string;
  explorerUrl?: string;
  error?: string;
  at: string;
};

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
    const timer = setInterval(() => void syncWallet(), 4000);
    return () => clearInterval(timer);
  }, [syncWallet]);

  async function run(
    action: "deposit" | "transfer" | "settle" | "unwrap",
  ) {
    setError(null);
    if (!address) {
      setError(t("needWallet"));
      return;
    }
    setBusy(action);
    try {
      const prepBody: Record<string, string> = { action, address };
      if (action === "deposit" || action === "unwrap" || action === "transfer") {
        prepBody.amount = amount;
      }
      if (action === "transfer") {
        if (!to.trim()) throw new Error(t("needTo"));
        prepBody.to = to.trim();
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

      const api = await import("@stellar/freighter-api");
      const signed = await api.signTransaction(prep.xdr, {
        networkPassphrase: prep.networkPassphrase,
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
        message?: string;
      };
      if (!subRes.ok) throw new Error(sub.message ?? "submit failed");

      setLog((prev) =>
        [
          {
            action,
            status: sub.status ?? "UNKNOWN",
            hash: sub.hash,
            explorerUrl: sub.explorerUrl,
            at: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 8),
      );
      await refreshAccount(address);
    } catch (e) {
      const message = e instanceof Error ? e.message : "tx failed";
      setError(message);
      setLog((prev) =>
        [
          {
            action,
            status: "ERROR",
            error: message,
            at: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 8),
      );
    } finally {
      setBusy(null);
    }
  }

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

        {!account?.tusdc || account.tusdc === "0" ? (
          <aside className="border border-[var(--color-line)] bg-[var(--color-surface)]/40 px-4 py-3 text-sm text-[var(--color-muted)]">
            {t("noTusdc")}
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
        </div>

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
