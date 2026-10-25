import type { DocBlock } from "@/content/docs/types";
import { cn } from "@/lib/utils";

export function DocsBlocks({ blocks }: { blocks: DocBlock[] }) {
  return (
    <div className="space-y-6 text-[15px] leading-relaxed text-[var(--color-muted)] md:text-base">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return (
              <p key={i} className="text-[var(--color-muted)]">
                {b.text}
              </p>
            );
          case "h2":
            return (
              <h2
                key={b.id}
                id={b.id}
                className="scroll-mt-28 pt-4 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-[var(--color-text)] md:text-2xl"
              >
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={b.id}
                id={b.id}
                className="scroll-mt-28 pt-2 font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--color-text)]"
              >
                {b.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-2 pl-5">
                {b.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal space-y-2 pl-5">
                {b.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            );
          case "code":
            return (
              <pre
                key={i}
                className="overflow-x-auto border border-[var(--color-line)] bg-[var(--color-bg)] p-4 font-[family-name:var(--font-mono)] text-[12px] leading-relaxed text-[var(--color-accent2)] sm:text-[13px]"
              >
                {b.text}
              </pre>
            );
          case "callout":
            return (
              <aside
                key={i}
                className={cn(
                  "border px-4 py-3 text-sm",
                  b.tone === "warn"
                    ? "border-[var(--color-alert)]/35 text-[var(--color-muted)]"
                    : "border-[var(--color-line)] bg-[var(--color-surface)]/40 text-[var(--color-muted)]",
                )}
              >
                {b.text}
              </aside>
            );
          case "table":
            return (
              <div
                key={i}
                className="overflow-x-auto border border-[var(--color-line)]"
              >
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--color-surface)]/50 text-[var(--color-text)]">
                    <tr>
                      {b.headers.map((h) => (
                        <th
                          key={h}
                          className="border-b border-[var(--color-line)] px-3 py-2 font-medium"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td
                            key={`${ri}-${ci}`}
                            className="border-b border-[var(--color-line)] px-3 py-2 font-[family-name:var(--font-mono)] text-[12px] text-[var(--color-muted)] sm:text-[13px]"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
