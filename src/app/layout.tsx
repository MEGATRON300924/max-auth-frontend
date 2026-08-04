import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ToastProvider } from "@/lib/hooks/ToastContext";
import { ToastViewport } from "@/components/ui/Toast";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata = {
  title: {
    default: "MAX Auth - Your MAX AI Account",
    template: "%s | MAX Auth"
  },
  description:
    "Sign in with your MAX AI Account and access The MAX AI Ecosystem with one secure identity.",
  keywords: [
    "MAX AI",
    "MAX Auth",
    "MAX AI Ecosystem",
    "AI assistant",
    "AI account",
    "secure login"
  ],
  authors: [
    {
      name: "The Tron Forge Limited"
    }
  ],
  creator: "The Tron Forge Limited",
  publisher: "The Tron Forge Limited",
  metadataBase: new URL("https://auth.max-ai.name.ng"),

  openGraph: {
    title: "MAX Auth - Your MAX AI Account",
    description:
      "One account for The MAX AI Ecosystem.",
    url: "https://auth.max-ai.name.ng",
    siteName: "MAX Auth",
    type: "website"
  },

  twitter: {
    card: "summary_large_image",
    title: "MAX Auth - Your MAX AI Account",
    description:
      "Sign in with your MAX AI Account."
  },

  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
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
