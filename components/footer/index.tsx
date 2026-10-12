import {
  SiFacebook,
  SiInstagram,
  SiPinterest,
  SiX,
  SiYoutube,
} from '@icons-pack/react-simple-icons';
import { getTranslations } from 'next-intl/server';
import { cache, JSX } from 'react';

import { LayoutQuery } from '~/app/[locale]/(default)/page-data';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { Image } from '~/components/image';
import { subscribe } from '~/components/subscribe/_actions/subscribe';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { SHOWROOMS } from '~/lib/home/home-content';
import { SiteFooter as FooterSection } from '~/lib/makeswift/components/site-footer';
import {
  FOOTER_BRAND_DESCRIPTION,
  FOOTER_CONTACT,
  FOOTER_LEGAL_LINKS,
  FOOTER_NEWSLETTER,
  FOOTER_SECTIONS,
} from '~/lib/navigation/footer-config';

import { FooterFragment } from './fragment';

// The badge row in the legal strip, taken from the live site's footer: the membership /
// compliance marks (NKBA, KCMA, CARB2, BBB A+ rating) and the card and review marks. The SVGs
// are the live store's own artwork, served from /images/footer; the four compliance marks were
// drawn in white for the live site's dark footer and are recoloured dark grey for ours.
const badge = (file: string, alt: string, width: number, height: number) => (
  <Image
    alt={alt}
    className="h-6 w-auto"
    height={height}
    key={file}
    src={`/images/footer/${file}.svg`}
    unoptimized
    width={width}
  />
);

const trustBadges = [
  badge('badge_nkba', 'NKBA member', 69, 23),
  badge('badge_kcma', 'KCMA certified', 24, 23),
  badge('badge_carb2', 'CARB2 compliant', 61, 24),
  badge('badge_a_plus', 'BBB A+ rating', 42, 23),
];

const paymentIcons = [
  badge('card_amex', 'American Express', 51, 30),
  badge('card_discover', 'Discover', 44, 30),
  badge('card_mastercard', 'Mastercard', 51, 30),
  badge('card_visa', 'Visa', 51, 30),
  badge('badge_homeadvisor', 'HomeAdvisor', 134, 29),
];

const socialIcons: Record<string, { icon: JSX.Element }> = {
  Facebook: { icon: <SiFacebook title="Facebook" /> },
  Twitter: { icon: <SiX title="Twitter" /> },
  X: { icon: <SiX title="X" /> },
  Pinterest: { icon: <SiPinterest title="Pinterest" /> },
  Instagram: { icon: <SiInstagram title="Instagram" /> },
  YouTube: { icon: <SiYoutube title="YouTube" /> },
};

const getFooterData = cache(async () => {
  const { data: response } = await client.fetch({
    document: LayoutQuery,
    fetchOptions: { next: { revalidate } },
  });

  return readFragment(FooterFragment, response).site;
});

// Footer per the wireframe. Link columns come from lib/navigation/footer-config.ts (developer-
// edited, like the nav); logo and social links come from the BigCommerce store settings; the
// newsletter form posts to the store's newsletter subscribe mutation.
export const Footer = async () => {
  const t = await getTranslations('Components.Footer');
  const data = await getFooterData();

  const logo = data.settings ? logoTransformer(data.settings) : '';
  const copyright = `© ${new Date().getFullYear()} ${data.settings?.storeName ?? 'Express Kitchens'}`;

  const socialMediaLinks = data.settings?.socialMediaLinks
    .filter((socialMediaLink) => Boolean(socialIcons[socialMediaLink.name]))
    .map((socialMediaLink) => ({
      href: socialMediaLink.url,
      icon: socialIcons[socialMediaLink.name]?.icon,
    }));

  return (
    <FooterSection
      contactPanel={{
        ...FOOTER_CONTACT,
        showrooms: SHOWROOMS.map(({ name, href }) => ({ name, href })),
      }}
      copyright={copyright}
      description={FOOTER_BRAND_DESCRIPTION}
      legalLinks={[...FOOTER_LEGAL_LINKS, { label: FOOTER_CONTACT.phone.label }]}
      logo={logo}
      logoHref="/"
      logoLabel={t('home')}
      newsletter={{ ...FOOTER_NEWSLETTER, action: subscribe }}
      paymentIcons={paymentIcons}
      sections={FOOTER_SECTIONS}
      socialMediaLinks={socialMediaLinks}
      trustBadges={trustBadges}
    />
  );
};
