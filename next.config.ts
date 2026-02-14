import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/spl.it" : "",
  assetPrefix: isProd ? "/spl.it/" : "",
};

export default nextConfig;
