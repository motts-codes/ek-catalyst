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
    // No `X-Powered-By: Next.js` on responses (framework disclosure, EK security audit 26 Nov 2026).
    poweredByHeader: false,
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
        // The About page keeps the live site's URL (/about-us); the build used /about for a while.
        { source: '/about', destination: '/about-us', permanent: true },
        // Pro Program removed at the client's request (8 Nov 2026); the Pro home carries trade info.
        { source: '/pro-program', destination: '/pro', permanent: true },
        { source: '/pro-program/confirmed', destination: '/pro', permanent: true },
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
            // Standard hardening set (EK security audit, 27 Nov 2026).
            // Browsers ignore X-Frame-Options when CSP frame-ancestors is present (above), so the
            // Makeswift builder keeps working; this only covers very old browsers.
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            // Two years, no includeSubDomains / preload: EK has other subdomains (e.g. the Laravel
            // system) that would have to be confirmed HTTPS-only first. Vercel adds its own HSTS
            // on HTTPS anyway; this makes the policy explicit and portable.
            { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
            // Geolocation is used by the ZIP / showroom "use my location" buttons on this origin.
            // Features the YouTube embeds delegate (autoplay, picture-in-picture, gyroscope…) are
            // deliberately not listed, so their default allowlists still apply.
            {
              key: 'Permissions-Policy',
              value:
                'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=()',
            },
            { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
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
