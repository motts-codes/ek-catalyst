import { Slideshow } from '@/vibes/soul/sections/slideshow';

interface Slide {
  title: string;
  redTitle: boolean;
  description: string;
  showDescription: boolean;
  imageSrc?: string;
  imageAlt: string;
  showButton: boolean;
  buttonLink?: { href?: string; target?: string };
  buttonText: string;
  buttonColor: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  showButton2: boolean;
  button2Link?: { href?: string; target?: string };
  button2Text: string;
  button2Color: 'primary' | 'secondary' | 'tertiary' | 'ghost';
}

interface MSAccordionsProps {
  className: string;
  slides: Slide[];
  autoplay: boolean;
  interval: number;
}

export function MSSlideshow({ className, slides, autoplay, interval }: MSAccordionsProps) {
  return (
    <Slideshow
      className={className}
      interval={interval * 1000}
      playOnInit={autoplay}
      slides={slides.map(
        ({
          title,
          redTitle,
          description,
          showDescription,
          imageSrc,
          imageAlt,
          showButton,
          buttonLink,
          buttonText,
          buttonColor,
          showButton2,
          button2Link,
          button2Text,
          button2Color,
        }) => {
          return {
            title,
            redTitle,
            description,
            showDescription,
            image: imageSrc ? { alt: imageAlt, src: imageSrc } : undefined,
            showCta: showButton,
            cta: { label: buttonText, href: buttonLink?.href ?? '#', variant: buttonColor },
            showCta2: showButton2,
            cta2: { label: button2Text, href: button2Link?.href ?? '#', variant: button2Color },
          };
        },
      )}
    />
  );
}
