import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-display",
});

const sans = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Bind — DeFi protocol insurance on Stellar",
  description:
    "Insurance DeFi protocols contract. Protected Deposit for users; claims settled under the hood. Built for Blend-like markets and wallets.",
  icons: {
    icon: [{ url: "/brand/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/icon.png" }],
  },
  openGraph: {
    title: "Bind — DeFi protocol insurance on Stellar",
    description:
      "Retention-window cover for DeFi protocols. Protocols contract Bind; users get Protected Deposit.",
    images: [{ url: "/brand/logo-horizontal-white.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} font-[family-name:var(--font-sans)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
