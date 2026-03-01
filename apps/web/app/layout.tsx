import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { MouseGlow } from "./components/mouse-glow";
import { ThemeToggle } from "./components/theme-toggle";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Sprea — Read faster than you can think",
  description: "Upload documents, extract text, and speed-read with RSVP.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('sprea-theme');var e=t==='dark'?'dark':t==='light'?'light':window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',e);})();`,
          }}
        />
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <MouseGlow />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
