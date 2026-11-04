import { Calculator, LayoutGrid, MapPin, PencilRuler } from 'lucide-react';

import { EkNotFound } from '@/vibes/soul/sections/not-found/ek-not-found';
import { Footer } from '~/components/footer';
import { Header } from '~/components/header';
import { ESTIMATOR_HREF, FREE_DESIGN_HREF } from '~/lib/home/home-content';

// The 404 for any unknown URL under a locale. Rendered outside the (default) layout, so it
// brings its own header and footer.
export default function NotFound() {
  return (
    <>
      <Header />

      <EkNotFound
        className="flex-1 place-content-center"
        description="The page you’re looking for has moved, or never existed. Here’s where most people were heading:"
        image={{
          src: '/images/pages/not-found/empty-cabinet.jpg',
          alt: 'A white wall cabinet with both doors open on an empty red interior',
        }}
        kicker="404"
        links={[
          {
            title: 'Kitchen cabinets',
            description: 'Browse every style',
            href: '/cabinets',
            icon: LayoutGrid,
          },
          {
            title: 'Price my kitchen',
            description: 'A ballpark in 4 steps',
            href: ESTIMATOR_HREF,
            icon: Calculator,
          },
          {
            title: 'Free design consult',
            description: 'In a showroom or on video',
            href: FREE_DESIGN_HREF,
            icon: PencilRuler,
          },
          {
            title: 'Find a showroom',
            description: 'Six across Connecticut',
            href: '/showrooms',
            icon: MapPin,
          },
        ]}
        note="Still stuck? Call or text 860-247-1000, any time. A real person will answer."
        search={{
          action: '/search',
          name: 'term',
          label: 'Search',
          placeholder: 'Search cabinets, styles or questions…',
        }}
        title="This cabinet’s empty."
      />

      <Footer />
    </>
  );
}
