/**
 * React hook for partner Safe Mode embeds.
 * Peer: react >= 18. Works with the in-memory KeelClient (demo) or a
 * thin wrapper that syncs state from your API.
 *
 * Example:
 *   const { client, snap, send } = useSafeMode({ address: userId });
 */

"use client";

import { useSyncExternalStore, useCallback, useRef } from "react";
import { KeelClient } from "./index";
import { openDisputeAsSender } from "../../../src/lib/keel/engine";
import { safeModeSnapshot, type SafeModeSnapshot } from "./safe-mode";

type Options = {
  address: string;
  client?: KeelClient;
  /** Poll interval for window countdowns (ms). Default 1000. */
  tickMs?: number;
};

type Store = {
  client: KeelClient;
  listeners: Set<() => void>;
  version: number;
  bump: () => void;
  subscribe: (fn: () => void) => () => void;
  getVersion: () => number;
};

function createStore(client: KeelClient): Store {
  const listeners = new Set<() => void>();
  let version = 0;
  return {
    client,
    listeners,
    version,
    bump() {
      version += 1;
      this.version = version;
      for (const l of listeners) l();
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getVersion() {
      return version;
    },
  };
}

export function useSafeMode(opts: Options) {
  const clientRef = useRef(opts.client ?? KeelClient.demo());
  const storeRef = useRef<Store | null>(null);
  if (!storeRef.current) storeRef.current = createStore(clientRef.current);
  const store = storeRef.current;

  const tickMs = opts.tickMs ?? 1000;

  const version = useSyncExternalStore(
    (onStoreChange) => {
      const unsub = store.subscribe(onStoreChange);
      const id = setInterval(() => store.bump(), tickMs);
      return () => {
        unsub();
        clearInterval(id);
      };
    },
    () => store.getVersion(),
    () => 0,
  );

  void version; // drive re-render on ticks / mutations

  const snap: SafeModeSnapshot = safeModeSnapshot(
    store.client.state,
    opts.address,
  );

  const wrap = useCallback(
    (amount: number) => {
      store.client.wrap(opts.address, amount);
      store.bump();
    },
    [opts.address, store],
  );

  const send = useCallback(
    (to: string, amount: number) => {
      store.client.send(opts.address, to, amount);
      store.bump();
    },
    [opts.address, store],
  );

  const settle = useCallback(() => {
    store.client.settleAccount(opts.address);
    store.bump();
  }, [opts.address, store]);

  const unwrap = useCallback(
    (amount: number) => {
      store.client.unwrapToUsdc(opts.address, amount);
      store.bump();
    },
    [opts.address, store],
  );

  const exit = useCallback(
    (amount: number) => {
      store.client.exit(opts.address, amount);
      store.bump();
    },
    [opts.address, store],
  );

  const dispute = useCallback(
    (holder: string, lotId: string, reason = "") => {
      store.client.state = openDisputeAsSender(
        store.client.state,
        opts.address,
        holder,
        lotId,
        reason,
      );
      store.bump();
    },
    [opts.address, store],
  );

  return {
    client: store.client,
    snap,
    wrap,
    send,
    settle,
    unwrap,
    exit,
    dispute,
  };
}
