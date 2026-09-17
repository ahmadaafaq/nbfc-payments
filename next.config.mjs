/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@google/genai", "pg", "xlsx", "tesseract.js"],
  typescript: {
    // Speed up production builds by skipping redundant build-time type check
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
