import type { Metadata } from "next";

const previewImage = "https://api.max-ai.name.ng/max_connected_preview.png";

export const metadata: Metadata = {
  title: "Connected Apps",
  description:
    "Manage the services and social platforms connected to your MAX Account. Review permissions and control your connected accounts in one place.",
  alternates: {
    canonical: "https://api.max-ai.name.ng/connected-apps",
  },
  openGraph: {
    title: "MAX Auth | Connected Apps",
    description:
      "Manage the services and social platforms connected to your MAX Account.",
    url: "https://api.max-ai.name.ng/connected-apps",
    siteName: "MAX Auth",
    type: "website",
    images: [
      {
        url: previewImage,
        alt: "MAX Auth Connected Apps preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MAX Auth | Connected Apps",
    description:
      "Manage the services and social platforms connected to your MAX Account.",
    images: [previewImage],
  },
};

export default function ConnectedAppsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
