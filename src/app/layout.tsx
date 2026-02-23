import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AppExperienceLayer } from "@/components/AppExperience/AppExperienceLayer";
import { ServiceWorkerRegister } from "@/components/PWA/ServiceWorkerRegister";
import { ThemeProvider } from "@/context/ThemeContext";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "JM Fitness Studio",
    "treinos premium",
    "eventos fitness",
    "Duque de Caxias",
    "check-in fitness",
    "estudio de treino",
    "academia boutique",
    "saude e bem-estar",
  ],
  openGraph: {
    title: `${SITE_NAME} | Estúdio de Saúde e Bem-Estar`,
    description:
      "Treinos boutique, eventos exclusivos e planos pensados para sua rotina em Duque de Caxias.",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
    locale: SITE_LOCALE,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Estúdio de Saúde e Bem-Estar`,
    description:
      "Treinos boutique, eventos exclusivos e planos pensados para sua rotina em Duque de Caxias.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "JM Fitness Studio",
    statusBarStyle: "black-translucent",
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
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
          className="flex min-h-[100dvh] flex-col text-[var(--foreground)]"
          style={{
            backgroundImage: "linear-gradient(180deg, var(--gradient-top), var(--gradient-bottom))",
          }}
        >
          <ThemeProvider>
            <ServiceWorkerRegister />
            <Header />
            <main className="safe-area-x flex flex-1 flex-col pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(6.2rem+env(safe-area-inset-bottom))] md:pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
              <AppExperienceLayer>{children}</AppExperienceLayer>
            </main>
            <Footer />
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
