import type { NextConfig } from "next";

const isStandalone = process.env["STANDALONE_BUILD"] === "true";

const nextConfig: NextConfig = {
  ...(isStandalone ? { output: "standalone" } : {}),
  transpilePackages: ["@tamadee/ui"],
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "bwebtamdi.tamadee.online" },
      { protocol: "https", hostname: "*.tamadee.online" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "http", hostname: "127.0.0.1", port: "9000" },
      { protocol: "http", hostname: "localhost", port: "9000" },
    ],
  },
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
};

export default nextConfig;
