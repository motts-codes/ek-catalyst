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
import { AmericanExpressIcon } from './payment-icons/american-express';
import { MastercardIcon } from './payment-icons/mastercard';
import { VisaIcon } from './payment-icons/visa';

// Text badges for the marks we don't have artwork for yet (Discover, HomeAdvisor, BBB A+).
const TextBadge = ({ children }: { children: string }) => (
  <span className="inline-flex h-6 items-center rounded border border-contrast-200 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-contrast-500">
    {children}
  </span>
);

const paymentIcons = [
  <AmericanExpressIcon key="americanExpress" />,
  <TextBadge key="discover">Discover</TextBadge>,
  <MastercardIcon key="mastercard" />,
  <VisaIcon key="visa" />,
  <TextBadge key="homeadvisor">HomeAdvisor</TextBadge>,
  <TextBadge key="bbb">BBB A+</TextBadge>,
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
    />
  );
};
