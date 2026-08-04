export default function Schema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MAX Auth",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    description:
      "MAX Auth is the identity platform for The MAX AI Ecosystem.",
    url: "https://auth.max-ai.name.ng",
    creator: {
      "@type": "Organization",
      name: "The Tron Forge Limited"
    }
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
