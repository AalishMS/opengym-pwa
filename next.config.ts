import type { NextConfig } from "next";
import baseRuntimeCaching from "next-pwa/cache";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline",
  },
  runtimeCaching: [
    ...baseRuntimeCaching,
    {
      urlPattern: /\.(?:woff2?|ttf|otf)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "font-assets",
        expiration: {
          maxEntries: 24,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
      },
    },
    {
      urlPattern: /\/((plans)|(sessions))(?:\/.*)?$/i,
      handler: "NetworkFirst",
      method: "GET",
      options: {
        cacheName: "api-get-cache",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
