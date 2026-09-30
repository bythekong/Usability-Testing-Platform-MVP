import { join } from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: join(process.cwd(), '../..'),
};

export default withNextIntl(nextConfig);
