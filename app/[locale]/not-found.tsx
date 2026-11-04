import { EkNotFound } from '@/vibes/soul/sections/not-found/ek-not-found';
import { Footer } from '~/components/footer';
import { Header } from '~/components/header';
import { ESTIMATOR_HREF } from '~/lib/home/home-content';

// The 404 for any unknown URL under a locale. Rendered outside the (default) layout, so it
// brings its own header and footer.
export default function NotFound() {
  return (
    <>
      <Header />

      <EkNotFound
        actions={[
          { label: 'Kitchen cabinets', href: '/cabinets', primary: true },
          { label: 'Price my kitchen', href: ESTIMATOR_HREF, style: 'outline' },
        ]}
        className="flex-1 place-content-center"
        description="The page you’re looking for has moved, or never existed. Here’s where most people were heading:"
        image={{
          src: '/images/pages/not-found/empty-cabinet.jpg',
          alt: 'A white wall cabinet with both doors open on an empty red interior',
        }}
        kicker="404"
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
