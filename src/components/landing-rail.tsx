/** Protected Deposit diagram — Grok landing visual, Bind-accurate lanes. */

export function LandingRail() {
  return (
    <aside
      aria-label="Protected Deposit"
      className="w-full border border-[var(--color-line)] bg-[var(--color-surface)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-line)] px-5 py-4 md:px-6">
        <div>
          <p className="font-[family-name:var(--font-display)] text-base font-extrabold tracking-tight text-[var(--color-text)]">
            Protected Deposit
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Timed retention before free exit
          </p>
        </div>
        <p className="text-xs text-[var(--color-muted)]">
          Standard · No KYC ·{" "}
          <span className="font-medium text-[var(--color-text)]">12h</span>
        </p>
      </div>

      <div className="space-y-0 p-5 md:p-6">
        <FlowRow
          label="Deposit"
          body="USDC enters the Bind rail as covered credit."
        />
        <div className="relative border-l border-[var(--color-line)] py-5 pl-5 ml-2">
          <div
            aria-hidden
            className="absolute -left-px top-0 h-full w-px bg-[var(--color-accent)] opacity-80"
          />
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-muted)]">
                Hold
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-[var(--color-text)]">
                12<span className="text-[var(--color-accent)]">h</span>
              </p>
              <p className="mt-2 max-w-xs text-sm text-[var(--color-muted)]">
                Protected retention window. Unwrap and swap stay blocked while
                unsettled.
              </p>
            </div>
            <div className="min-w-[7rem] flex-1 max-w-[11rem]">
              <div className="h-1.5 overflow-hidden bg-[var(--color-bg)]">
                <div className="h-full w-[72%] bg-[var(--color-accent)] animate-keel-fill" />
              </div>
              <p className="mt-2 text-[11px] text-[var(--color-muted)]">
                Free exit blocked in window
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-0 border border-[var(--color-line)] sm:grid-cols-2">
          <div className="border-b border-[var(--color-line)] p-4 sm:border-b-0 sm:border-r">
            <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-muted)]">
              Settle
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--color-text)]">
              Free exit opens
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Unwrap 1:1 when the window ends — no breach.
            </p>
          </div>
          <div className="p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-muted)]">
              Claim
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--color-text)]">
              Breach in window
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Bind pays approved claims while funds stay on-rail.
            </p>
          </div>
        </div>

        <p className="pt-4 text-xs text-[var(--color-muted)]">
          Peg · vault ≥ supply · KYC Fast Lane shortens hold to ~1h
        </p>
      </div>
    </aside>
  );
}

function FlowRow({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex gap-4 pb-4">
      <span className="mt-1 size-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
      <div>
        <p className="font-[family-name:var(--font-display)] text-sm font-extrabold text-[var(--color-text)]">
          {label}
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{body}</p>
      </div>
    </div>
  );
}
