import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const ROUTES = ["", "/about", "/instructors", "/classes", "/booking", "/location", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return ROUTES.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "/booking" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/booking" ? 0.9 : 0.7,
  }));
}
