import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ServiceWorkerRegister } from "@/components/PWA/ServiceWorkerRegister";
import { ThemeProvider } from "@/context/ThemeContext";

const roboto = Roboto({
  subsets: ["latin"],
  weight: [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jmfitnessstudio.com.br"),
  title: {
    default: "JM Fitness Studio",
    template: "%s | JM Fitness Studio",
  },
  description:
    "JM Fitness Studio em Duque de Caxias reúne treinos boutique, eventos exclusivos e um calendário vivo para sua evolução.",
  keywords: [
    "JM Fitness Studio",
    "treinos premium",
    "eventos fitness",
    "Duque de Caxias",
    "check-in fitness",
  ],
  openGraph: {
    title: "JM Fitness Studio | Estúdio de Saúde e Bem-Estar",
    description:
      "Treinos boutique, eventos exclusivos e planos pensados para sua rotina em Duque de Caxias.",
    url: "https://jmfitnessstudio.com.br",
    siteName: "JM Fitness Studio",
    images: [
      {
        url: "/banner-01.png",
        width: 1200,
        height: 630,
        alt: "JM Fitness Studio",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "JM Fitness Studio",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/images/adaptive-icon.png", sizes: "1024x1024", type: "image/png" },
      { url: "/images/icon-wt.png", sizes: "1024x1024", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: [{ url: "/images/adaptive-icon.png", sizes: "1024x1024", type: "image/png" }],
    apple: [{ url: "/images/splash-icon.png", sizes: "1024x1024", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body
        className={`min-h-full antialiased ${roboto.variable} ${roboto.className}`}
      >
        <div
          className="flex min-h-screen flex-col text-[var(--foreground)]"
          style={{
            backgroundImage: "linear-gradient(180deg, var(--gradient-top), var(--gradient-bottom))",
          }}
        >
          <ThemeProvider>
            <ServiceWorkerRegister />
            <Header />
            <main className="flex flex-1 flex-col pt-[5.5rem] px-4 pb-10 sm:px-6 lg:px-10">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
