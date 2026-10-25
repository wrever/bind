import Image from "next/image";

type BrandMarkProps = {
  /** header = compact lockup; hero = large brand plane; footer = small */
  variant?: "header" | "hero" | "footer" | "icon";
  className?: string;
  priority?: boolean;
};

/**
 * Official Bind marks from /public/brand (sourced from src/img).
 * Palette: #0E100D · #F54307 · #F5F4F0
 */
export function BrandMark({
  variant = "header",
  className = "",
  priority = false,
}: BrandMarkProps) {
  if (variant === "icon") {
    return (
      <Image
        src="/brand/icon.svg"
        alt="Bind"
        width={40}
        height={44}
        className={className}
        priority={priority}
        unoptimized
      />
    );
  }

  if (variant === "hero") {
    return (
      <Image
        src="/brand/logo-horizontal.svg"
        alt="Bind"
        width={600}
        height={130}
        className={`h-[clamp(3.25rem,11vw,6.5rem)] w-auto max-w-full ${className}`}
        priority={priority}
        unoptimized
      />
    );
  }

  if (variant === "footer") {
    return (
      <Image
        src="/brand/logo-horizontal.svg"
        alt="Bind"
        width={120}
        height={26}
        className={`h-5 w-auto opacity-90 ${className}`}
        unoptimized
      />
    );
  }

  return (
    <Image
      src="/brand/logo-horizontal.svg"
      alt="Bind"
      width={140}
      height={30}
      className={`h-7 w-auto md:h-8 ${className}`}
      priority={priority}
      unoptimized
    />
  );
}
