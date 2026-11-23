import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ToastProvider } from "@/lib/hooks/ToastContext";
import { ToastViewport } from "@/components/ui/Toast";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://auth.max-ai.name.ng"),
  title: { default: "MAX Auth - Your MAX AI Account", template: "%s | MAX Auth" },
  description: "MAX Auth is the secure identity platform for The MAX AI Ecosystem. Sign in once and access MAX AI products with one account.",
  keywords: ["MAX Auth", "MAX AI", "The MAX AI Ecosystem", "MAX Account", "secure authentication", "The Tron Forge Limited"],
  applicationName: "MAX Auth",
  authors: [{ name: "The Tron Forge Limited" }],
  creator: "Zion Opaaje",
  publisher: "The Tron Forge Limited",
  alternates: { canonical: "https://auth.max-ai.name.ng" },
  icons: { icon: "/max_auth.jpg", shortcut: "/max_auth.jpg", apple: "/max_auth.jpg" },
  openGraph: {
    title: "MAX Auth - Your MAX AI Account",
    description: "One secure identity for The MAX AI Ecosystem.",
    url: "https://auth.max-ai.name.ng",
    siteName: "MAX Auth",
    locale: "en_US",
    type: "website",
    images: [{ url: "/max_auth.png", alt: "MAX Auth preview" }],
  },
  twitter: { card: "summary_large_image", title: "MAX Auth - Your MAX AI Account", description: "Sign in with your MAX AI Account and access The MAX AI Ecosystem.", images: ["/max_auth.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
};

function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: "The Tron Forge Limited", url: "https://max-ai.name.ng", logo: "https://auth.max-ai.name.ng/max_auth.jpg" },
      { "@type": "SoftwareApplication", name: "MAX Auth", applicationCategory: "SecurityApplication", operatingSystem: "Web", url: "https://auth.max-ai.name.ng", description: "MAX Auth provides secure identity management for The MAX AI Ecosystem.", creator: { "@type": "Organization", name: "The Tron Forge Limited" } },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

const themeBootScript = `
(function () {
  try {
    var saved = localStorage.getItem("max-auth-theme");
    var allowed = ["black-white", "black-blue", "blue-white", "graphite", "midnight"];
    var theme = allowed.indexOf(saved) >= 0 ? saved : "black-white";
    document.documentElement.dataset.theme = theme;
    if (theme === "blue-white") document.documentElement.classList.remove("dark");
    else document.documentElement.classList.add("dark");
  } catch (_) {
    document.documentElement.dataset.theme = "black-white";
    document.documentElement.classList.add("dark");
  }
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="black-white" className={`${jakarta.variable} ${mono.variable} dark`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootScript }} /></head>
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
