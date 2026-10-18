import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(__dirname, "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The repo root is the npm workspace root and owns the hoisted node_modules.
  // Pin Turbopack there so Next.js resolves workspace dependencies reliably.
  turbopack: {
    root: repositoryRoot,
  },
};

export default nextConfig;
