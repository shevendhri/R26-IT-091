import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(frontendRoot, "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: repositoryRoot,
  },
};

export default nextConfig;
