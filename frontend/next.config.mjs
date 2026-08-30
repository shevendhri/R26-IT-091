import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The repo root has its own package.json/package-lock.json (intentional —
  // it's an npm workspace root used for Vercel deploys) that declares
  // `next`/`react`/`react-dom`, so npm hoists those packages to the repo
  // root's node_modules rather than frontend/node_modules. That means the
  // repo root — not frontend/ — is the correct Turbopack root; pin it
  // explicitly so Next.js stops guessing (and warning) about it.
  turbopack: {
    root: path.join(__dirname, '..'),
  },
};

export default nextConfig;
