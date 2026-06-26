import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Resolve the public origin for absolute OG/share image URLs. Prefer an
// explicit override (e.g. a custom domain), then Vercel's built-in production
// domain, then the per-deployment URL, then localhost for dev.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
const TITLE = "Front Office — run the club";
const DESCRIPTION =
  "An interactive business simulation for running a lower league soccer club for one season. Set six decisions and watch the league finish and full season finances respond live.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Front Office",
    images: [
      {
        url: "/hero-command-center.png",
        width: 1600,
        height: 1100,
        alt: "Front Office command center — controls, league table, and season finances",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/hero-command-center.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
