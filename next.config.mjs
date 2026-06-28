/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Skip ESLint during `next build` so the production build doesn't pay the
  // memory + CPU cost. Type checking still runs.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
