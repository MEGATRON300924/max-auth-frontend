import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ToastProvider } from "@/lib/hooks/ToastContext";
import { ToastViewport } from "@/components/ui/Toast";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://auth.max-ai.name.n"),

  title: {
    default: "MAX Auth - Your MAX AI Account",
    template: "%s | MAX Auth"
  },

  description:
    "MAX Auth is the secure identity platform for The MAX AI Ecosystem. Sign in once and access MAX AI products with one account.",

  keywords: [
    "MAX Auth",
    "MAX AI",
    "The MAX AI Ecosystem",
    "MAX Account",
    "AI assistant",
    "secure authentication",
    "AI ecosystem",
    "The Tron Forge Limited"
  ],

  applicationName: "MAX Auth",

  authors: [
    {
      name: "The Tron Forge Limited"
    }
  ],

  creator: "Zion Opaaje",
  publisher: "The Tron Forge Limited",

  alternates: {
    canonical: "https://auth.max-ai.name.ng"
  },

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png"
  },

  openGraph: {
    title: "MAX Auth - Your MAX AI Account",
    description:
      "One secure identity for The MAX AI Ecosystem.",
    url: "https://auth.max-ai.name.ng",
    siteName: "MAX Auth",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "MAX Auth Logo"
      }
    ]
  },

  twitter: {
    card: "summary_large_image",
    title: "MAX Auth - Your MAX AI Account",
    description:
      "Sign in with your MAX AI Account and access The MAX AI Ecosystem.",
    images: ["/logo.png"]
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  }
};

export const viewport: Viewport = {
  themeColor: "#0B0F19",
  width: "device-width",
  initialScale: 1
};

function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "The Tron Forge Limited",
        "url": "https://max-ai.name.ng",
        "logo": "https://auth.max-ai.name.ng/logo.png"
      },
      {
        "@type": "SoftwareApplication",
        "name": "MAX Auth",
        "applicationCategory": "SecurityApplication",
        "operatingSystem": "Web",
        "url": "https://auth.max-ai.name.ng",
        "description":
          "MAX Auth provides secure identity management for The MAX AI Ecosystem.",
        "creator": {
          "@type": "Organization",
          "name": "The Tron Forge Limited"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <StructuredData />

        <ToastProvider>
          <AuthProvider>
            {children}
            <ToastViewport />
        </AuthProvider>
      </ToastProvider>
    </body>
    </html>
  );
}
