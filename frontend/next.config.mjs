import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The repo root also has a package.json/package-lock.json (intentional —
  // it's an npm workspace root used for Vercel deploys). That makes Next.js
  // guess the wrong project root when running from frontend/, which breaks
  // routing (404s on every page). Pin the root explicitly instead of
  // touching either lockfile.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
