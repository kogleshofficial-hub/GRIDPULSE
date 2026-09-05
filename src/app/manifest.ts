import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GRIDPULSE — Evidence-First Grid Intelligence",
    short_name: "GRIDPULSE",
    description:
      "Evidence-first infrastructure intelligence for observing, validating, predicting, and explaining grid disruption signals.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090b",
    theme_color: "#08090b",
    lang: "en",
    categories: ["business", "productivity", "utilities"],
  };
}
