import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";

import { AccentProvider } from "@/components/providers/accent-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { ThemeProvider } from "@/components/theme/theme-provider";

import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-og-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "OpenGym",
    template: "%s | OpenGym",
  },
  description: "OpenGym workout tracker PWA",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ServiceWorkerRegister />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AccentProvider />
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
