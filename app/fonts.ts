import { Open_Sans, Roboto_Mono } from 'next/font/google';
import localFont from 'next/font/local';

// Body font: Open Sans (Google Fonts)
export const openSans = Open_Sans({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-family-open-sans',
});

// Heading font: Gilroy (self-hosted, licensed — files in app/fonts/).
export const gilroy = localFont({
  src: [
    { path: './fonts/Gilroy-Light.woff', weight: '300', style: 'normal' },
    { path: './fonts/Gilroy-Regular.woff', weight: '400', style: 'normal' },
    { path: './fonts/Gilroy-Medium.woff', weight: '500', style: 'normal' },
    { path: './fonts/Gilroy-Bold.woff', weight: '700', style: 'normal' },
    { path: './fonts/Gilroy-Heavy.woff', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-family-gilroy',
});

export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-family-roboto-mono',
});

export const fonts = [openSans, gilroy, robotoMono];
