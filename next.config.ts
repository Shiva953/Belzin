import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.module.rules.push({
      test: /\.ts$/,
      include: /node_modules\/@cks-systems/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              module: 'esnext',
            },
          },
        },
      ],
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.coinmarketcap.com',
        port: '',
        pathname: '/static-gravity/image/**',
      },
      {
        protocol: 'https',
        hostname: 'we-assets.pinit.io',
        port: '',
        pathname: '/DHcjHDtfTwchgYfwN6wPCesaWmLhyWY9KYcdRugGMsAr/**',
      },
    ],
  },
};

export default nextConfig;
