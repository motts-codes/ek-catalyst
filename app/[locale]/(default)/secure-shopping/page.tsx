import { CreditCard, Landmark, Lock, ScanSearch, ShieldCheck, ShieldOff } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { PageBreadcrumbs, PageHero, PanelPair } from '@/vibes/soul/sections/page-kit';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Secure Shopping',
  description:
    'Your payment is protected start to finish: a PCI DSS Level 1 certified checkout, encryption on every page, and card details that never touch our servers.',
};

export default async function SecureShopping({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Support', href: '/support' },
          { label: 'Secure shopping', href: '/secure-shopping' },
        ]}
      />
      <PageHero
        description="When you order from us online, your payment runs through a checkout certified to the highest standard in the payments industry. Your card details are encrypted the moment you type them and never touch our servers: we see your order, never your card. Here's what that means in practice, and what else protects you."
        image={{
          src: '/images/pages/secure-shopping/shield-card-phone.jpg',
          alt: 'A red shield with a padlock between a payment card and a phone showing a secured checkout',
        }}
        imageStyle="plain"
        kicker="Secure shopping"
        title="Your payment is protected, start to finish"
      />
      <CardsRow
        cardTone="alternate"
        cards={[
          {
            title: 'PCI DSS Level 1 certified',
            icon: ShieldCheck,
            description:
              'Our store runs on BigCommerce, which holds Level 1 PCI DSS certification, the highest level in the payment card industry and the standard the banks and card networks require of themselves.',
          },
          {
            title: 'Encrypted, end to end',
            icon: Lock,
            description:
              'Every page on the site, not just checkout, is served over HTTPS. What you type travels scrambled between your browser and the payment processor.',
          },
          {
            title: 'We never store your card',
            icon: ShieldOff,
            description:
              'Card numbers are handled by the payment processor, not by Express Kitchens. Our team sees your order and delivery details, never your full card number.',
          },
          {
            title: 'Fraud screening on every payment',
            icon: ScanSearch,
            description:
              'Address and card-code checks (AVS and CVV) plus automated fraud screening run on each transaction, so a stolen card is far less likely to be used, and yours is protected if it ever is.',
          },
          {
            title: "Your bank's protection, on top",
            icon: CreditCard,
            description:
              "Pay by Visa, MasterCard, Discover or American Express and your card issuer's zero-liability and chargeback protections apply as they would in any store.",
          },
          {
            title: 'Financing through a regulated lender',
            icon: Landmark,
            description:
              '0% financing applications are handled by the lender on their own secure system. We receive a decision, not your financial details.',
          },
        ]}
        hideImages
        kicker="How it works"
        title="Six things that keep your order safe"
      />
      <PanelPair
        panels={[
          {
            kicker: 'What we do with your details',
            title: 'Only what the order needs',
            body: [
              "We use your name, address and contact details to fulfil your order, tell you when it ships and, if you've opted in, send you offers. We don't sell your information. The privacy policy sets out exactly what is collected and why.",
            ],
            actions: [{ label: 'Read the privacy policy', href: '/privacy' }],
            tone: 'rose',
          },
          {
            kicker: 'Prefer not to pay online?',
            title: 'Order in person or by phone instead',
            body: [
              'Every order can be placed and paid in any of our six showrooms, or over the phone on 860-247-1000, at the same prices and with the same delivery.',
            ],
            actions: [{ label: 'Find a showroom', href: '/showrooms', primary: true }],
            tone: 'sky',
          },
        ]}
      />
      <CabinetFaq
        data={{
          headline: 'Questions about paying online',
          items: [
            {
              q: 'Is it safe to enter my card on this site?',
              a: 'Yes. Checkout runs over an encrypted connection and is processed by a PCI DSS Level 1 certified platform; your card number is never stored by Express Kitchens.',
            },
            {
              q: 'Which cards do you accept?',
              a: 'Visa, MasterCard, Discover and American Express, plus 0% financing on qualifying orders.',
            },
            {
              q: 'When is my card charged?',
              a: 'When you place the order. If anything is out of stock we tell you before you pay.',
            },
            {
              q: "What if I see a charge I don't recognize?",
              a: 'Call 860-247-1000 or email support@expresskitchens.com with the amount and date and we check it against our orders the same day. Your card issuer can also reverse an unauthorized charge.',
            },
          ],
        }}
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
      />
    </>
  );
}
