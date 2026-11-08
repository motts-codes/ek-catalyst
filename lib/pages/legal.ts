// Privacy policy sections, carried over from the live site's policy (legal text is kept as the
// business wrote it, lightly tidied). Terms are a placeholder structure until counsel supplies
// the copy.

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'collection',
    title: 'Information collection',
    paragraphs: [
      'We may collect personal information that you voluntarily provide when you submit a web form, respond to an advertisement, visit a store, make a purchase, register an account, begin a checkout, interact with us on social media or contact us. This may include:',
    ],
    bullets: [
      'Your name',
      'Email address',
      'Phone number',
      'Address',
      'Any other information you choose to provide',
    ],
  },
  {
    id: 'tracking',
    title: 'Tracking technologies',
    paragraphs: [
      "We may also use tracking technologies to automatically collect certain information about your visit, such as your IP address, browser type, referring and exit pages, and operating system. This is used for analytical purposes to improve the website's performance and your experience. You may choose not to provide certain personal information; some parts of the site may not function properly without it.",
    ],
  },
  {
    id: 'use',
    title: 'Use of information',
    paragraphs: [
      'We use the information we collect to personalize your experience on the website, to improve the website based on your feedback, to develop new products, to contact you about our services or promotions, and to respond to inquiries and customer service requests.',
      'We may also use it to market our products and services to you, including by email and text message subject to your consent, and to send abandoned-cart reminders if you added items to your cart but did not complete checkout. You can opt out of marketing and promotional communications at any time.',
    ],
  },
  {
    id: 'sms',
    title: 'Text messaging terms of service',
    paragraphs: [
      'By providing your mobile number and consenting to receive text messages from Express Kitchens, you agree that we may send you SMS or MMS messages relevant to your support inquiry or contemplated purchase, as well as periodic promotional messages. These terms apply to the Express Kitchens Text Messaging Service:',
    ],
    bullets: [
      'You certify that you are the legal owner of the mobile phone number and agree to tell us if it changes.',
      'You agree to receive up to 4 promotional messages per month.',
      'There is no limit to messages exchanged as part of a conversation you reply to, until the conversation is reasonably concluded.',
      'You may unsubscribe at any time by replying STOP. You may receive a message confirming your opt-out.',
      'Message and data rates may apply.',
      'Express Kitchens is not liable for delayed or undelivered messages. If your communication is urgent and you cannot confirm receipt, please call 860-247-1000.',
      "Data obtained in connection with this service may include your phone number, your carrier's name and the date, time and content of your messages. We may use it to contact you and to provide the products you request.",
      'Your SMS opt-in consent and phone number will not be shared with third parties or affiliates for marketing purposes.',
      'We may change or end the service at any time, with or without notice.',
    ],
  },
  {
    id: 'sms-types',
    title: 'Types of SMS communication',
    paragraphs: [
      'If you have consented to receive text messages, you may receive appointment reminders, follow-up messages, billing inquiries and, where applicable, promotions or offers. For example: "Hello, this is a friendly reminder of your upcoming delivery with [Name] at [Location] on [Date] at [Time]. Reply STOP to opt out of SMS messaging at any time." Message frequency varies by type; you may receive up to 4 SMS messages per month. Text HELP for assistance.',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookie policy',
    paragraphs: [
      'Our website may use cookies and similar tracking technologies to enhance your browsing experience. Cookies are small files stored on your device that help us analyze website traffic and remember your preferences. You can accept or decline cookies through your browser settings; disabling them may affect certain features. Some tracking technologies, such as embedded pixels, may still function even if cookies are disabled.',
    ],
  },
  {
    id: 'third-party',
    title: 'Third-party disclosure',
    paragraphs: [
      'We do not sell or trade your personal information. With your consent we may share certain data to enhance your experience, and we may share personal information as required by law or to provide our services. We may share non-personally identifiable visitor information with trusted third parties for marketing, advertising or other purposes.',
      'When you visit or log in to our website, cookies and similar technologies may be used by our online data partners or vendors to associate these activities with other personal information they or others hold about you, including your email or home address. We, or our service providers, may then send communications and marketing to those addresses.',
    ],
  },
  {
    id: 'security',
    title: 'Data security',
    paragraphs: [
      'We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, alteration or destruction. No method of transmission over the internet or electronic storage is 100% secure, so we cannot guarantee absolute security.',
    ],
  },
  {
    id: 'children',
    title: "Children's privacy",
    paragraphs: [
      'Our website is not intended for individuals under 13. We do not knowingly collect personal information from children without parental consent. If you believe we have inadvertently collected information from a child under 13, please contact us and we will delete it.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    paragraphs: [
      'We may update this policy from time to time. The date at the top of the page shows when it last changed. Questions about it can be sent through the contact page or to 860-247-1000.',
    ],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'orders',
    title: 'Orders and pricing',
    paragraphs: [
      "[Terms copy from Express Kitchens' counsel: how orders are accepted, when prices and taxes apply, and how errors are handled.]",
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery and pickup',
    paragraphs: [
      '[Delivery terms, risk of loss, inspection on delivery and pickup conditions. See the shipping policy for the customer-facing version.]',
    ],
  },
  {
    id: 'returns',
    title: 'Returns and cancellations',
    paragraphs: [
      '[Return window, restocking fee, non-returnable items and cancellation terms. See the returns policy for the customer-facing version.]',
    ],
  },
  {
    id: 'warranty',
    title: 'Warranty',
    paragraphs: [
      '[Limited warranty terms and exclusions. See the warranty page for the customer-facing version.]',
    ],
  },
  {
    id: 'promotions',
    title: 'Promotions and the referral program',
    paragraphs: ['[Promotion eligibility, combination rules, and referral program terms.]'],
  },
  {
    id: 'accounts',
    title: 'Accounts and trade customers',
    paragraphs: [
      '[Account responsibilities, trade account eligibility and verification, tax exemption documentation.]',
    ],
  },
  { id: 'law', title: 'Governing law', paragraphs: ['[Governing law and dispute resolution.]'] },
];
