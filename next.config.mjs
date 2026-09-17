/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@google/genai", "pg", "xlsx", "tesseract.js"],
  typescript: {
    // We run lint and type checking in CI/scripts
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
