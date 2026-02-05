import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',

    // Empty turbopack config to silence the webpack-only warning
    // Next.js 16 defaults to Turbopack - this tells it we know what we're doing
    turbopack: {},
};

export default nextConfig;
