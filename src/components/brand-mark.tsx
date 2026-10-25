import Image from "next/image";

type BrandMarkProps = {
  /** header = compact lockup; hero = large brand plane; footer = small; icon = mark only */
  variant?: "header" | "hero" | "footer" | "icon";
  className?: string;
  priority?: boolean;
};

/**
 * Bind marks from /public/brand (kit C6 / C6SM).
 * Site is dark (#0E100D) → always the `-dark` SVGs.
 * Prefer SVG over PNG for UI (crisp + ~2–7 KB).
 *
 * Optical align: comet overhang is in the viewBox — shift left by stem offset
 * so the B lines up with page margins (kit README).
 */
export function BrandMark({
  variant = "header",
  className = "",
  priority = false,
}: BrandMarkProps) {
  if (variant === "icon") {
    // mark-sm viewBox ≈ 119×115 → square-ish at 40px
    return (
      <Image
        src="/brand/bind-mark-sm-dark.svg"
        alt="Bind"
        width={40}
        height={39}
        className={className}
        priority={priority}
        unoptimized
      />
    );
  }

  if (variant === "hero") {
    // horizontal C6B: 345.81×118.2 → stem offset 0.407 × height
    return (
      <Image
        src="/brand/bind-logo-horizontal-dark.svg"
        alt="Bind"
        width={346}
        height={118}
        className={`h-[clamp(3.25rem,11vw,6.5rem)] w-auto max-w-full ${className}`}
        style={{ marginLeft: "calc(-0.407 * clamp(3.25rem, 11vw, 6.5rem))" }}
        priority={priority}
        unoptimized
      />
    );
  }

  if (variant === "footer") {
    // same compact SM as header, slightly smaller
    return (
      <Image
        src="/brand/bind-logo-horizontal-sm-dark.svg"
        alt="Bind"
        width={83}
        height={30}
        className={`h-7 w-auto md:h-8 ${className}`}
        style={{ marginLeft: "calc(-0.239 * 1.75rem)" }}
        unoptimized
      />
    );
  }

  // header — C6SM @ ~30px
  return (
    <Image
      src="/brand/bind-logo-horizontal-sm-dark.svg"
      alt="Bind"
      width={83}
      height={30}
      className={`h-7 w-auto md:h-8 ${className}`}
      style={{ marginLeft: "calc(-0.239 * 1.75rem)" }}
      priority={priority}
      unoptimized
    />
  );
}
