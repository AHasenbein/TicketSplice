import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(currentDir, "../../")
  }
};

export default nextConfig;
