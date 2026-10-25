import createWithMakeswift from '@makeswift/runtime/next/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { writeBuildConfig } from './build-config/writer';
import { client } from './client';
import { graphql } from './client/graphql';
import { cspHeader } from './lib/content-security-policy';

const withMakeswift = createWithMakeswift();
const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: './messages/en.json',
  },
});

const SettingsQuery = graphql(`
  query SettingsQuery {
    site {
      settings {
        url {
          vanityUrl
          cdnUrl
          checkoutUrl
        }
        locales {
          code
          isDefault
          path
        }
      }
    }
  }
`);

async function writeSettingsToBuildConfig() {
  const { data } = await client.fetch({ document: SettingsQuery });

  const cdnEnvHostnames = process.env.NEXT_PUBLIC_BIGCOMMERCE_CDN_HOSTNAME;

  const cdnUrls = (
    cdnEnvHostnames
      ? cdnEnvHostnames.split(',').map((s) => s.trim())
      : [data.site.settings?.url.cdnUrl]
  ).filter((url): url is string => !!url);

  if (!cdnUrls.length) {
    throw new Error(
      'No CDN URLs found. Please ensure that NEXT_PUBLIC_BIGCOMMERCE_CDN_HOSTNAME is set correctly.',
    );
  }

  return await writeBuildConfig({
    locales: data.site.settings?.locales,
    urls: {
      ...data.site.settings?.url,
      cdnUrls,
    },
  });
}

export default async (): Promise<NextConfig> => {
  const settings = await writeSettingsToBuildConfig();

  let nextConfig: NextConfig = {
    reactStrictMode: true,
    experimental: {
      optimizePackageImports: ['@icons-pack/react-simple-icons'],
      // Build-time prerendering hits the BigCommerce API for ~100 pages at once; a single 429
      // used to fail the whole build. Fewer workers, and a retry for the odd rate-limited page.
      staticGenerationMaxConcurrency: 4,
      staticGenerationRetryCount: 3,
    },
    typescript: {
      ignoreBuildErrors: !!process.env.CI,
    },
    // default URL generation in BigCommerce uses trailing slash
    trailingSlash: process.env.TRAILING_SLASH !== 'false',
    // Cabinet shop listing pages moved out of /cabinets/shop/* to /cabinets/* (the education
    // journey now owns /mykitchen/cabinets/*). Redirect the old URLs so shared links still work.
    // eslint-disable-next-line @typescript-eslint/require-await
    async redirects() {
      return [
        {
          source: '/cabinets/shop/assembled-cabinets',
          destination: '/cabinets/assembled-cabinets',
          // 307 (temporary) while the cabinet URL structure is still settling — flip to
          // permanent: true (308) at launch so search engines pass link equity.
          permanent: false,
        },
        {
          // The wireframe's URL for the 10×10 guide; the route folder cannot start with a digit.
          source: '/resources/10x10-kitchen',
          destination: '/resources/ten-by-ten-kitchen',
          permanent: true,
        },
        {
          source: '/cabinets/shop/rta-cabinets',
          destination: '/cabinets/rta-cabinets',
          // 307 (temporary) while the cabinet URL structure is still settling — flip to
          // permanent: true (308) at launch so search engines pass link equity.
          permanent: false,
        },
        // The three "my kitchen" tools live together under /mykitchen (Oct 2026).
        { source: '/free-design', destination: '/mykitchen/free-design-consult', permanent: true },
        {
          source: '/free-design/confirmed',
          destination: '/mykitchen/free-design-consult/confirmed',
          permanent: true,
        },
        {
          source: '/mykitchen/calculator',
          destination: '/mykitchen/price-my-kitchen',
          permanent: true,
        },
        {
          source: '/mykitchen/visualizer',
          destination: '/mykitchen/visualize-my-kitchen',
          permanent: true,
        },
        // The program explainers moved to question-shaped URLs (Oct 2026).
        {
          source: '/mykitchen/cabinets/rta',
          destination: '/mykitchen/what-are-rta-cabinets',
          permanent: true,
        },
        {
          source: '/mykitchen/cabinets/assembled',
          destination: '/mykitchen/what-are-assembled-cabinets',
          permanent: true,
        },
      ];
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    async headers() {
      const cdnLinks = settings.urls.cdnUrls.map((url) => ({
        key: 'Link',
        value: `<https://${url}>; rel=preconnect`,
      }));

      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: cspHeader.replace(/\n/g, ''),
            },
            ...cdnLinks,
          ],
        },
      ];
    },
  };

  // Apply withNextIntl to the config
  nextConfig = withNextIntl(nextConfig);

  // Apply withMakeswift to the config
  nextConfig = withMakeswift(nextConfig);

  if (process.env.ANALYZE === 'true') {
    const withBundleAnalyzer = bundleAnalyzer();

    nextConfig = withBundleAnalyzer(nextConfig);
  }

  return nextConfig;
};
