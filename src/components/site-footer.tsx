import { getTranslations } from "next-intl/server";
import { BrandMark } from "@/components/brand-mark";
import { Link } from "@/i18n/navigation";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text)]">
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={`${title}-${l.href}-${l.label}`}>
            <Link
              href={l.href}
              className="text-sm text-[var(--color-muted)] transition-colors duration-[var(--motion-quick)] hover:text-[var(--color-text)]"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  const product = [
    { href: "/integrate", label: t("integrate") },
    { href: "/cover", label: t("coverSchedule") },
    { href: "/por", label: t("proofOfReserves") },
    { href: "/demo", label: t("demo") },
  ];

  const resources = [
    { href: "/docs", label: t("documentation") },
    { href: "/policy", label: t("claimsPolicy") },
    { href: "/terms", label: t("termsOfService") },
  ];

  const protocol = [
    { href: "/cover", label: t("whatBindCovers") },
    { href: "/integrate", label: t("forProtocols") },
    { href: "/docs", label: t("threatModel") },
  ];

  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-10 md:py-16">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5 lg:col-span-4">
            <Link href="/" className="inline-flex min-h-[44px] items-center">
              <BrandMark variant="footer" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[var(--color-muted)]">
              {t("blurb")}
            </p>
            <Link
              href="/por"
              className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              <span
                className="size-1.5 rounded-full bg-[var(--color-accent2)]"
                aria-hidden
              />
              {t("porPublic")}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7 md:gap-8 lg:col-span-8 lg:pl-8">
            <FooterColumn title={t("product")} links={product} />
            <FooterColumn title={t("resources")} links={resources} />
            <FooterColumn title={t("protocol")} links={protocol} />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-line)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-10">
          <p className="text-sm text-[var(--color-muted)]">
            {t("rights", { year })}
          </p>
          <nav
            aria-label={t("legalAria")}
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            <Link
              href="/terms"
              className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              {t("terms")}
            </Link>
            <Link
              href="/policy"
              className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              {t("claims")}
            </Link>
            <Link
              href="/docs"
              className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              {t("docs")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
