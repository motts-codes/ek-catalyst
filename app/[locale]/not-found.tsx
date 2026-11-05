import { EkNotFound } from '@/vibes/soul/sections/not-found/ek-not-found';
import { Footer } from '~/components/footer';
import { Header } from '~/components/header';

// The 404 for any unknown URL under a locale. Rendered outside the (default) layout, so it
// brings its own header and footer.
export default function NotFound() {
  return (
    <>
      <Header />

      <EkNotFound
        className="flex-1 place-content-center"
        description="The page you’re looking for has moved, or never existed. Try a search, or give us a call."
        image={{
          src: '/images/pages/not-found/empty-cabinet.jpg',
          alt: 'A white wall cabinet with both doors open on an empty red interior',
        }}
        kicker="This cabinet’s empty."
        note="Still stuck? Call or text 860-247-1000, any time. A real person will answer."
        search={{
          action: '/search',
          name: 'term',
          label: 'Search',
          placeholder: 'Search cabinets, styles or questions…',
        }}
        title="404"
      />

      <Footer />
    </>
  );
}
