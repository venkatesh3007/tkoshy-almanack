import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Blogger-style permalinks (…/2026/08/title.html) land on the clean route.
      {
        source: "/:year(\\d{4})/:month(\\d{2})/:slug*.html",
        destination: "/:year/:month/:slug*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
