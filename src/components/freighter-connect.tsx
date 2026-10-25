"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type WalletState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "idle" }
  | { status: "connected"; address: string; network?: string }
  | { status: "error"; message: string };

function shortAddr(a: string) {
  if (a.length < 12) return a;
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}

/**
 * Freighter connect for Bind demo / partner surfaces.
 * Identity + network only — does NOT sign vault deposits/claims yet.
 */
export function FreighterConnect() {
  const [wallet, setWallet] = useState<WalletState>({ status: "loading" });

  const refresh = useCallback(async () => {
    try {
      const api = await import("@stellar/freighter-api");
      const connected = await api.isConnected();
      if (connected.error || !connected.isConnected) {
        setWallet({ status: "missing" });
        return;
      }
      const allowed = await api.isAllowed();
      if (allowed.error || !allowed.isAllowed) {
        setWallet({ status: "idle" });
        return;
      }
      const addr = await api.getAddress();
      if (addr.error || !addr.address) {
        setWallet({ status: "idle" });
        return;
      }
      const net = await api.getNetwork();
      setWallet({
        status: "connected",
        address: addr.address,
        network: net.error ? undefined : net.network,
      });
    } catch {
      setWallet({ status: "missing" });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function connect() {
    try {
      setWallet({ status: "loading" });
      const api = await import("@stellar/freighter-api");
      const connected = await api.isConnected();
      if (connected.error || !connected.isConnected) {
        setWallet({ status: "missing" });
        return;
      }
      const access = await api.requestAccess();
      if (access.error || !access.address) {
        setWallet({
          status: "error",
          message: access.error?.message ?? "Access denied",
        });
        return;
      }
      const net = await api.getNetwork();
      setWallet({
        status: "connected",
        address: access.address,
        network: net.error ? undefined : net.network,
      });
    } catch (e) {
      setWallet({
        status: "error",
        message: e instanceof Error ? e.message : "Connect failed",
      });
    }
  }

  if (wallet.status === "loading") {
    return (
      <span className="keel-meta inline-flex min-h-[36px] items-center">
        Wallet…
      </span>
    );
  }

  if (wallet.status === "missing") {
    return (
      <a
        href="https://www.freighter.app/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-[36px] items-center border border-[var(--color-line)] px-3 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
      >
        Install Freighter
      </a>
    );
  }

  if (wallet.status === "connected") {
    return (
      <div
        className="inline-flex min-h-[36px] flex-wrap items-center gap-2 border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5"
        title="Wallet identity only — cover txs still use the policy engine / CLI vault"
      >
        <span className="keel-meta text-[var(--color-muted)]">ID</span>
        <span className="font-[family-name:var(--font-mono)] text-xs tracking-[0.04em] text-[var(--color-text)]">
          {shortAddr(wallet.address)}
        </span>
        {wallet.network ? (
          <span className="keel-meta">{wallet.network}</span>
        ) : null}
      </div>
    );
  }

  if (wallet.status === "error") {
    return (
      <div className="inline-flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--color-alert)]">{wallet.message}</span>
        <Button size="sm" variant="outline" onClick={() => void connect()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={() => void connect()}>
      Connect Freighter
    </Button>
  );
}
