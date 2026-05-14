import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com", "*.ngrok.io", "*.serveo.net", "localhost"],
};

export default nextConfig;
