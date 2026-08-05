import { PropsWithChildren } from 'react';

import '../../globals.css';

// This is a top-level route (outside app/[locale]), which owns <html>/<body> — the [locale] layout
// that normally provides them isn't in this route's tree. Self-contained, no storefront chrome.
export default function CabinetAdminLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
