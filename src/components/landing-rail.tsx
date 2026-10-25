/** Product visual for Bind landing — retention cover, partner-readable. */

export function LandingRail() {
  return (
    <aside
      aria-label="Retention cover summary"
      className="relative w-full border border-[var(--color-line)] bg-[var(--color-surface)]"
    >
      <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
        <p className="text-sm font-medium text-[var(--color-text)]">
          Retention cover
        </p>
        <p className="text-xs tracking-[0.04em] text-[var(--color-muted)]">
          Vault ≥ supply
        </p>
      </div>

      <div className="grid gap-0 md:grid-cols-12">
        <div className="border-b border-[var(--color-line)] p-6 md:col-span-7 md:border-b-0 md:border-r md:p-8">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-muted)]">
            Protected window
          </p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.03em] text-[var(--color-text)] md:text-6xl">
            12<span className="text-[var(--color-accent)]">h</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-muted)]">
            Default without KYC. Free unwrap and swap stay blocked while funds
            are unsettled.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between gap-2 text-xs text-[var(--color-muted)]">
              <span>Deposit</span>
              <span>Settle</span>
            </div>
            <div className="relative h-1.5 overflow-hidden bg-[var(--color-bg)]">
              <div className="absolute inset-y-0 left-0 w-[68%] bg-[var(--color-accent)] animate-keel-fill" />
            </div>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
              <li className="flex justify-between gap-4">
                <span>Free exit</span>
                <span className="font-medium text-[var(--color-accent)]">
                  Blocked in window
                </span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Exit pool</span>
                <span className="font-medium text-[var(--color-text)]">
                  Available
                </span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Claim</span>
                <span className="font-medium text-[var(--color-text)]">
                  While on-rail
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-rows-3 md:col-span-5">
          <Step
            n="1"
            title="Deposit"
            body="USDC becomes covered credit"
          />
          <Step n="2" title="Hold" body="Risk window stays open" />
          <Step
            n="3"
            title="Settle or claim"
            body="Unwrap 1:1, or indemnify"
            last
          />
        </div>
      </div>
    </aside>
  );
}

function Step({
  n,
  title,
  body,
  last,
}: {
  n: string;
  title: string;
  body: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex gap-4 px-6 py-5 ${last ? "" : "border-b border-[var(--color-line)]"}`}
    >
      <span className="font-[family-name:var(--font-mono)] text-xs tabular-nums text-[var(--color-muted)]">
        {n}
      </span>
      <div>
        <p className="font-[family-name:var(--font-display)] text-base font-extrabold tracking-tight text-[var(--color-text)]">
          {title}
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{body}</p>
      </div>
    </div>
  );
}
