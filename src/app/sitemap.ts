import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://auth.max-ai.name.ng",
      lastModified: new Date()
    }
  ];
}
