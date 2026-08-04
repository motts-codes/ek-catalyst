'use client';

import {
  FieldMetadata,
  FormProvider,
  FormStateInput,
  getFormProps,
  SubmissionResult,
  useForm,
  useInputControl,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { createSerializer, parseAsString, useQueryStates } from 'nuqs';
import {
  ReactNode,
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useFormStatus } from 'react-dom';
import { z } from 'zod';

import { ButtonRadioGroup } from '@/vibes/soul/form/button-radio-group';
import { CardRadioGroup } from '@/vibes/soul/form/card-radio-group';
import { Checkbox } from '@/vibes/soul/form/checkbox';
import { Label } from '@/vibes/soul/form/label';
import { DatePicker } from '@/vibes/soul/form/date-picker';
import { FormStatus } from '@/vibes/soul/form/form-status';
import { Input } from '@/vibes/soul/form/input';
import { NumberInput } from '@/vibes/soul/form/number-input';
import { RadioGroup } from '@/vibes/soul/form/radio-group';
import { Select } from '@/vibes/soul/form/select';
import { SwatchRadioGroup } from '@/vibes/soul/form/swatch-radio-group';
import { Textarea } from '@/vibes/soul/form/textarea';
import { animatedUnderlineClassName } from '@/vibes/soul/primitives/animated-underline';
import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';
import { useEvents } from '~/components/analytics/events';
import { usePathname, useRouter } from '~/i18n/routing';

import { revalidateCart } from './actions/revalidate-cart';
import { FulfillmentIcon } from './fulfillment-icon';
import { Field, schema, SchemaRawShape } from './schema';

// Trust/service reassurances shown under the purchase panel. Each is a link to its policy page
// (hrefs are '#' placeholders for now). Icons are the supplied brand SVGs, which keep their own
// colors (the white background rect from each source file is dropped). Order: pickup, secure,
// price match, returns.
const TRUST_ITEMS: Array<{ label: string; href: string; icon: ReactNode }> = [
  {
    label: 'Same Day Pickup',
    href: '#', // TODO: shipping/pickup page
    icon: (
      <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6.15933 17.8214C5.93537 17.5975 5.76685 17.3502 5.65377 17.0795C5.45715 16.6089 5.06731 16.1786 4.55728 16.1786H3.98647C3.68999 16.1786 3.46946 15.9045 3.53296 15.6149C3.57967 15.4018 3.76837 15.25 3.98647 15.25H5.04531C5.45217 15.25 5.8014 14.9874 6.05989 14.6732C6.19267 14.5118 6.34963 14.3686 6.53076 14.2437C6.90451 13.986 7.32832 13.8571 7.8022 13.8571C8.27609 13.8571 8.6999 13.986 9.07365 14.2437C9.25478 14.3686 9.41174 14.5118 9.54452 14.6732C9.80301 14.9874 10.1522 15.25 10.5591 15.25H14.1736L16.213 6.42857H6.13859C6.09084 6.42857 6.05556 6.38406 6.06647 6.33757C6.11166 6.0946 6.2292 5.89426 6.4191 5.73655C6.60899 5.57885 6.83309 5.5 7.09138 5.5H16.1159C16.7592 5.5 17.2352 6.09864 17.0902 6.7254L16.9053 7.5246C16.7603 8.15136 17.2362 8.75 17.8795 8.75H18.0523C18.367 8.75 18.6634 8.8982 18.8523 9.15002L20.8027 11.7508C20.9729 11.9777 21.0387 12.2662 20.9838 12.5444L20.36 15.7044C20.3056 15.98 20.064 16.1786 19.7831 16.1786C19.4584 16.1786 19.2045 16.4459 19.1269 16.7612C19.029 17.1591 18.8255 17.5125 18.5165 17.8214C18.0642 18.2738 17.5165 18.5 16.8737 18.5C16.2308 18.5 15.6831 18.2738 15.2308 17.8214C15.0263 17.617 14.868 17.393 14.756 17.1496C14.525 16.6479 14.1045 16.1786 13.5522 16.1786H11.1236C10.5713 16.1786 10.1508 16.6479 9.91989 17.1496C9.80784 17.393 9.64957 17.617 9.44508 17.8214C8.99271 18.2738 8.44509 18.5 7.8022 18.5C7.15932 18.5 6.6117 18.2738 6.15933 17.8214ZM15.8753 11.934C15.7293 12.5611 16.2053 13.1607 16.8492 13.1607H19.363C19.6806 13.1607 19.954 12.9363 20.0159 12.6248C20.0527 12.4396 20.0092 12.2475 19.8961 12.0963L18.388 10.0797C18.1992 9.82722 17.9024 9.67857 17.5871 9.67857H17.1943C16.7293 9.67857 16.3257 9.99901 16.2203 10.4518L15.8753 11.934ZM15.988 7.359L16.213 6.42857L14.1736 15.25L14.3985 14.3196L15.1344 11.0733L15.988 7.359ZM2.98607 12.9267C2.68401 12.9267 2.46238 12.6429 2.53564 12.3498C2.58731 12.1431 2.77302 11.9981 2.98606 11.9981H6.18961C6.49166 11.9981 6.71329 12.282 6.64003 12.575C6.58836 12.7817 6.40266 12.9267 6.18961 12.9267H2.98607ZM4.84321 9.68043C4.54116 9.68043 4.31953 9.39657 4.39278 9.10354C4.44446 8.89685 4.63016 8.75186 4.84321 8.75186H8.97533C9.27738 8.75186 9.49901 9.03572 9.42575 9.32875C9.37408 9.53543 9.18837 9.68043 8.97533 9.68043H4.84321ZM7.8022 17.5714C8.18431 17.5714 8.51202 17.4349 8.78533 17.1617C9.05848 16.8884 9.19506 16.5607 9.19506 16.1786C9.19506 15.7965 9.05848 15.4688 8.78533 15.1954C8.51202 14.9223 8.18431 14.7857 7.8022 14.7857C7.4201 14.7857 7.09239 14.9223 6.81908 15.1954C6.54592 15.4688 6.40935 15.7965 6.40935 16.1786C6.40935 16.5607 6.54592 16.8884 6.81908 17.1617C7.09239 17.4349 7.4201 17.5714 7.8022 17.5714ZM16.8737 17.5714C17.2558 17.5714 17.5835 17.4349 17.8568 17.1617C18.1299 16.8884 18.2665 16.5607 18.2665 16.1786C18.2665 15.7965 18.1299 15.4688 17.8568 15.1954C17.5835 14.9223 17.2558 14.7857 16.8737 14.7857C16.4915 14.7857 16.1638 14.9223 15.8905 15.1954C15.6174 15.4688 15.4808 15.7965 15.4808 16.1786C15.4808 16.5607 15.6174 16.8884 15.8905 17.1617C16.1638 17.4349 16.4915 17.5714 16.8737 17.5714Z"
          fill="#FA9AA1"
        />
      </svg>
    ),
  },
  {
    label: 'Secure Transaction',
    href: '#', // TODO: secure transaction / security page
    icon: (
      <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10.9808 14.5H13.0193L12.4635 11.4095C12.7583 11.307 13.0016 11.1262 13.1932 10.8672C13.3849 10.6082 13.4808 10.3192 13.4808 10C13.4808 9.591 13.3362 9.242 13.047 8.953C12.758 8.66383 12.409 8.51925 12 8.51925C11.591 8.51925 11.242 8.66383 10.953 8.953C10.6638 9.242 10.5192 9.591 10.5192 10C10.5192 10.3192 10.6151 10.6082 10.8067 10.8672C10.9984 11.1262 11.2417 11.307 11.5365 11.4095L10.9808 14.5ZM12 20.9615C9.991 20.3653 8.32208 19.1483 6.99325 17.3105C5.66442 15.4727 5 13.4025 5 11.1V5.69225L12 3.077L19 5.69225V11.1C19 13.4025 18.3356 15.4727 17.0068 17.3105C15.6779 19.1483 14.009 20.3653 12 20.9615ZM12 19.9C13.7333 19.35 15.1667 18.25 16.3 16.6C17.4333 14.95 18 13.1167 18 11.1V6.375L12 4.14425L6 6.375V11.1C6 13.1167 6.56667 14.95 7.7 16.6C8.83333 18.25 10.2667 19.35 12 19.9Z"
          fill="#FA9AA1"
        />
      </svg>
    ),
  },
  {
    label: 'Installation, Not Included',
    href: '#', // TODO: installation info page
    icon: (
      <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7.43084 19.0722H12.1808C12.3221 19.0722 12.4422 19.0227 12.5411 18.9236C12.6401 18.8248 12.6897 18.7047 12.6897 18.5633V17.8422C12.6897 17.7009 12.6401 17.5808 12.5411 17.4819C12.4422 17.3829 12.3221 17.3333 12.1808 17.3333H7.43084C7.28952 17.3333 7.16933 17.3829 7.07027 17.4819C6.9714 17.5808 6.92197 17.7009 6.92197 17.8422V18.5633C6.92197 18.7047 6.9714 18.8248 7.07027 18.9236C7.16933 19.0227 7.28952 19.0722 7.43084 19.0722ZM7.32471 11.0143H12.2866C12.4083 11.0143 12.52 10.9634 12.6218 10.8616C12.7235 10.7598 12.7743 10.6481 12.7743 10.5267C12.7743 10.405 12.7235 10.2933 12.6218 10.1915C12.52 10.0898 12.4083 10.039 12.2866 10.039H7.32471C7.20324 10.039 7.09159 10.0898 6.98978 10.1915C6.88797 10.2933 6.83706 10.405 6.83706 10.5267C6.83706 10.6481 6.88797 10.7598 6.98978 10.8616C7.09159 10.9634 7.20324 11.0143 7.32471 11.0143ZM7.32471 8.68165H12.2866C12.4083 8.68165 12.52 8.63084 12.6218 8.52921C12.7235 8.4274 12.7743 8.31566 12.7743 8.194C12.7743 8.07253 12.7235 7.96089 12.6218 7.85907C12.52 7.75726 12.4083 7.70636 12.2866 7.70636H7.32471C7.20324 7.70636 7.09159 7.75726 6.98978 7.85907C6.88797 7.96089 6.83706 8.07253 6.83706 8.194C6.83706 8.31566 6.88797 8.4274 6.98978 8.52921C7.09159 8.63084 7.20324 8.68165 7.32471 8.68165ZM16.2096 11.7776V10.675H17.7365C17.9342 10.675 18.0968 10.6114 18.2241 10.4842C18.3513 10.357 18.4149 10.1945 18.4149 9.99656V8.7241C18.4149 8.52618 18.3513 8.36363 18.2241 8.23646C18.0968 8.10928 17.9342 8.0457 17.7365 8.0457H16.2096V6.94305H17.7365C18.2263 6.94305 18.6455 7.11745 18.9943 7.46625C19.3432 7.81506 19.5176 8.23434 19.5176 8.7241V8.80901H21.3835C21.5397 8.80901 21.6707 8.86194 21.7763 8.96779C21.882 9.07365 21.9348 9.20477 21.9348 9.36116C21.9348 9.51755 21.882 9.6484 21.7763 9.75371C21.6707 9.85901 21.5397 9.91166 21.3835 9.91166H19.5176V9.99656C19.5176 10.4863 19.3432 10.9056 18.9943 11.2544C18.6455 11.6032 18.2263 11.7776 17.7365 11.7776H16.2096ZM12.011 16.2307H10.9083V12.4563H14.4283C14.6262 12.4563 14.7888 12.3926 14.9162 12.2653C15.0434 12.1381 15.107 11.9755 15.107 11.7776V6.94305C15.107 6.74512 15.0434 6.58257 14.9162 6.4554C14.7888 6.32804 14.6262 6.26436 14.4283 6.26436H6.70971C6.10325 6.26436 5.58408 6.4803 5.15221 6.91217C4.72034 7.34404 4.5044 7.86321 4.5044 8.46967V10.251C4.5044 10.8575 4.72034 11.3766 5.15221 11.8085C5.58408 12.2404 6.10325 12.4563 6.70971 12.4563H8.70303V16.2307H7.60037V13.559H6.70971C5.80002 13.559 5.02127 13.2351 4.37346 12.5872C3.72566 11.9394 3.40175 11.1607 3.40175 10.251V8.46967C3.40175 7.55998 3.72566 6.78123 4.37346 6.13342C5.02127 5.48562 5.80002 5.16171 6.70971 5.16171H14.4283C14.9182 5.16171 15.3376 5.33611 15.6864 5.68492C16.0352 6.03373 16.2096 6.4531 16.2096 6.94305V11.7776C16.2096 12.2676 16.0352 12.6869 15.6864 13.0357C15.3376 13.3846 14.9182 13.559 14.4283 13.559H12.011V16.2307ZM7.15518 20.1749C6.78414 20.1749 6.46869 20.0449 6.20883 19.7851C5.94915 19.5254 5.81932 19.21 5.81932 18.839V17.5665C5.81932 17.1955 5.94915 16.8801 6.20883 16.6205C6.46869 16.3606 6.78414 16.2307 7.15518 16.2307H12.4565C12.8275 16.2307 13.1429 16.3606 13.4025 16.6205C13.6624 16.8801 13.7923 17.1955 13.7923 17.5665V18.839C13.7923 19.21 13.6624 19.5254 13.4025 19.7851C13.1429 20.0449 12.8275 20.1749 12.4565 20.1749H7.15518ZM12.1808 19.0722H6.92197H12.6897H12.1808Z"
          fill="#FA9AA1"
        />
      </svg>
    ),
  },
  {
    label: 'Price Match Guarantee',
    href: '#', // TODO: price match page
    icon: (
      <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9.925 13.277L10.7037 10.6962L8.65375 9.19225H11.2155L12 6.5845L12.7845 9.19225H15.3462L13.2905 10.6962L14.0693 13.277L12 11.675L9.925 13.277ZM7 21.4615V14.8713C6.36667 14.2481 5.875 13.5186 5.525 12.6828C5.175 11.8468 5 10.9525 5 10C5 8.04867 5.67883 6.39417 7.0365 5.0365C8.39417 3.67883 10.0487 3 12 3C13.9513 3 15.6058 3.67883 16.9635 5.0365C18.3212 6.39417 19 8.04867 19 10C19 10.9525 18.825 11.8468 18.475 12.6828C18.125 13.5186 17.6333 14.2481 17 14.8713V21.4615L12 19.9615L7 21.4615ZM16.25 14.25C17.4167 13.0833 18 11.6667 18 10C18 8.33333 17.4167 6.91667 16.25 5.75C15.0833 4.58333 13.6667 4 12 4C10.3333 4 8.91667 4.58333 7.75 5.75C6.58333 6.91667 6 8.33333 6 10C6 11.6667 6.58333 13.0833 7.75 14.25C8.91667 15.4167 10.3333 16 12 16C13.6667 16 15.0833 15.4167 16.25 14.25ZM8 20.0443L12 18.923L16 20.0443V15.7135C15.4423 16.1237 14.8228 16.4407 14.1413 16.6645C13.4599 16.8882 12.7462 17 12 17C11.2538 17 10.5401 16.8882 9.85875 16.6645C9.17725 16.4407 8.55767 16.1237 8 15.7135V20.0443Z"
          fill="#FA9AA1"
        />
      </svg>
    ),
  },
  {
    label: 'Returns Policy',
    href: '#', // TODO: returns page
    icon: (
      <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 15.8496C4 17.3651 5.23414 18.5993 6.74969 18.5993H8.39951C8.70242 18.5993 8.94945 18.3522 8.94945 18.0493C8.94945 17.7464 8.7024 17.4994 8.39951 17.4994H6.74969C5.83993 17.4994 5.09988 16.7593 5.09988 15.8496V6.50061C5.09988 5.59085 5.83993 4.85079 6.74969 4.85079H10.5993V7.60049C10.5993 7.90339 10.8463 8.15042 11.1492 8.15042C11.4521 8.15042 11.6991 7.90338 11.6991 7.60049V4.85079H15.5487C16.4585 4.85079 17.1985 5.59085 17.1985 6.50061V9.80024C17.1985 10.1031 17.4456 10.3502 17.7485 10.3502C18.0514 10.3502 18.2984 10.1031 18.2984 9.80024V6.50061C18.2984 4.98506 17.0643 3.75092 15.5487 3.75092H6.74969C5.23414 3.75092 4 4.98506 4 6.50061V15.8496Z"
          fill="#F20819"
          fillOpacity="0.41"
        />
        <path
          d="M17.1985 19.1492H16.0987C15.7957 19.1492 15.5487 19.3963 15.5487 19.6992C15.5487 20.0021 15.7958 20.2491 16.0987 20.2491H17.1985C18.1083 20.2491 18.9579 19.8839 19.5884 19.2233C20.2178 18.5638 20.54 17.6949 20.496 16.784C20.4079 15.0268 18.9117 13.6519 17.0889 13.6519H11.9032L13.7378 11.8431C13.842 11.7389 13.9 11.6014 13.9032 11.4553C13.9032 11.3093 13.8484 11.1696 13.7442 11.0643C13.6401 10.9602 13.5026 10.9022 13.3565 10.9022C13.2083 10.9054 13.0708 10.9569 12.9655 11.059L10.7024 13.292C10.4575 13.5337 10.3232 13.8581 10.3232 14.2018C10.3232 14.5455 10.4575 14.8699 10.7024 15.1116L12.9655 17.3446C13.0622 17.4413 13.2018 17.4961 13.35 17.4961H13.3554C13.5036 17.4961 13.6465 17.4381 13.7432 17.3392C13.9547 17.1223 13.9526 16.7753 13.7378 16.5616L11.9032 14.7528H17.1439C18.2792 14.7528 19.2416 15.5745 19.3823 16.6669C19.4618 17.2963 19.2695 17.9322 18.8517 18.4047C18.4338 18.8806 17.8313 19.1523 17.1986 19.1523L17.1985 19.1492Z"
          fill="#F20819"
          fillOpacity="0.41"
        />
      </svg>
    ),
  },
];

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

interface State<F extends Field> {
  fields: F[];
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}

export type ProductDetailFormAction<F extends Field> = Action<State<F>, FormData>;

export interface StockDisplayData {
  stockLevelMessage?: string | null;
  backorderAvailabilityPrompt?: string | null;
}

export interface BackorderDisplayData {
  availableOnHand: number;
  availableForBackorder: number;
  unlimitedBackorder: boolean;
  showQuantityOnBackorder: boolean;
  backorderMessage: string | null;
}

export interface ProductDetailFormProps<F extends Field> {
  fields: F[];
  action: ProductDetailFormAction<F>;
  productId: string;
  // Rendered in the left cell above the variant options, inside the form, so the purchase panel
  // (right cell) sits alongside the product name/price from the top of the column.
  header?: ReactNode;
  // Rendered as its own grid item under the left column on desktop (via col-start-1), but placed
  // AFTER the purchase panel in DOM order so it doesn't push add-to-cart down on mobile.
  descriptionSlot?: ReactNode;
  ctaLabel?: string;
  quantityLabel?: string;
  incrementLabel?: string;
  decrementLabel?: string;
  emptySelectPlaceholder?: string;
  ctaDisabled?: boolean;
  prefetch?: boolean;
  additionalActions?: ReactNode;
  minQuantity?: number;
  maxQuantity?: number;
  stockDisplayData?: StockDisplayData;
  backorderDisplayData?: BackorderDisplayData;
  // Option-value entityId -> co-occurring option-value entityIds. When present, the Height
  // options are filtered to those valid for the selected Width (and vice versa).
  optionDependencyMap?: Record<number, number[]>;
  // Delivery/pickup message (__fulfillment). When set, a grey box with a delivery icon is shown
  // below the purchase panel.
  fulfillmentMessage?: string;
  // First trust-block row label (__delivery custom field, e.g. "Same Day Pickup"). Falls back to
  // the default label when absent.
  deliveryMessage?: string;
  // Variant-aware stock badge above the quantity: 'in' -> green "In stock", { low: N } -> dark red
  // "Only N in stock" (1–4 available), 'out' -> red "Out of stock". Consistent with the CTA.
  stockStatus?: 'in' | 'out' | { low: number };
}

export function ProductDetailForm<F extends Field>({
  action,
  fields,
  productId,
  header,
  descriptionSlot,
  ctaLabel = 'Add to cart',
  quantityLabel = 'Quantity',
  incrementLabel = 'Increase quantity',
  decrementLabel = 'Decrease quantity',
  emptySelectPlaceholder = 'Select an option',
  ctaDisabled = false,
  prefetch = false,
  additionalActions,
  minQuantity,
  maxQuantity,
  stockDisplayData,
  backorderDisplayData,
  optionDependencyMap,
  fulfillmentMessage,
  deliveryMessage,
  stockStatus,
}: ProductDetailFormProps<F>) {
  const router = useRouter();
  const pathname = usePathname();
  const events = useEvents();
  const t = useTranslations('Product.ProductDetails');

  const searchParams = fields.reduce<Record<string, typeof parseAsString>>((acc, field) => {
    return field.persist === true ? { ...acc, [field.name]: parseAsString } : acc;
  }, {});

  const [params] = useQueryStates(searchParams, { shallow: false });

  // A required option the shopper hasn't picked yet (e.g. Width / Height on windows). Until every
  // one is chosen there's no specific variant, so the stock badge would be reporting the whole
  // product's aggregate — showing "In stock" before any choice is made. We show a prompt instead.
  // Only persisted fields are product options (they round-trip through the URL); `quantity` and
  // other non-persisted inputs are also `required` but aren't variant selections.
  const hasUnselectedRequiredOption = fields.some(
    (field) =>
      field.persist === true &&
      field.required === true &&
      field.type !== 'checkbox' &&
      (params[field.name] ?? field.defaultValue ?? '') === '',
  );

  const onPrefetch = (fieldName: string, value: string) => {
    if (prefetch) {
      const serialize = createSerializer(searchParams);

      const newUrl = serialize(pathname, { ...params, [fieldName]: value });

      router.prefetch(newUrl);
    }
  };

  const defaultValue = fields.reduce<{
    [Key in keyof SchemaRawShape]?: z.infer<SchemaRawShape[Key]>;
  }>(
    (acc, field) => {
      // Checkbox field has to be handled separately because we want to convert checked or unchecked value to true or undefined respectively.
      // This is because the form expects a boolean value, but we want to store the checked or unchecked value in the query params.
      if (field.type === 'checkbox') {
        if (params[field.name] === field.checkedValue) {
          return {
            ...acc,
            [field.name]: 'true',
          };
        }

        if (params[field.name] === field.uncheckedValue) {
          return {
            ...acc,
            [field.name]: undefined,
          };
        }

        return {
          ...acc,
          [field.name]: field.defaultValue, // Default value is either 'true' or undefined
        };
      }

      return {
        ...acc,
        [field.name]: params[field.name] ?? field.defaultValue,
      };
    },
    { quantity: minQuantity ?? 1 },
  );

  const [{ lastResult, successMessage }, formAction] = useActionState(action, {
    fields,
    lastResult: null,
  });

  // Set when the "Buy now" button submits (vs. plain "Add to cart"), so the shared success handler
  // knows to send the shopper to checkout after the item is added. Uses the same form/validation
  // path as Add to cart, so an unselected required option blocks buy-now too.
  const buyNowRef = useRef(false);

  useEffect(() => {
    if (lastResult?.status === 'success') {
      const isBuyNow = buyNowRef.current;

      buyNowRef.current = false;

      if (isBuyNow) {
        startTransition(async () => {
          await revalidateCart();
          // `/checkout` is a route handler that mints a BigCommerce hosted-checkout redirect, so
          // use a full browser navigation rather than the client router.
          window.location.assign('/checkout');
        });

        return;
      }

      toast.success(successMessage);

      startTransition(async () => {
        // This is needed to refresh the Data Cache after the product has been added to the cart.
        // The cart id is not picked up after the first time the cart is created/updated.
        await revalidateCart();
      });
    }
  }, [lastResult, successMessage, router]);

  const [form, formFields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema(fields, minQuantity, maxQuantity)),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schema(fields, minQuantity, maxQuantity) });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();

      startTransition(() => {
        formAction(formData);

        events.onAddToCart?.(formData);
      });
    },
    // @ts-expect-error: `defaultValue` types are conflicting with `onValidate`.
    defaultValue,
    shouldValidate: 'onSubmit',
    shouldRevalidate: 'onInput',
  });

  const backorderMessages = useMemo(() => {
    const {
      availableForBackorder,
      availableOnHand,
      backorderMessage,
      showQuantityOnBackorder,
      unlimitedBackorder,
    } = backorderDisplayData || { availableForBackorder: 0, availableOnHand: 0 };

    if (!showQuantityOnBackorder && !backorderMessage) {
      return undefined;
    }

    const orderQuantity = Number(formFields.quantity.value);

    if (Number.isNaN(orderQuantity) || orderQuantity <= availableOnHand) {
      return {
        backorderQuantityMessage: undefined,
        backorderInfoMessage: undefined,
      };
    }

    if (!showQuantityOnBackorder) {
      return {
        backorderQuantityMessage: undefined,
        backorderInfoMessage: backorderMessage ?? undefined,
      };
    }

    return {
      backorderQuantityMessage: t('backorderQuantity', {
        quantity: unlimitedBackorder
          ? orderQuantity - availableOnHand
          : Math.min(orderQuantity - availableOnHand, availableForBackorder),
      }),
      backorderInfoMessage: backorderMessage ?? undefined,
    };
  }, [backorderDisplayData, formFields.quantity.value, t]);

  const quantityControl = useInputControl(formFields.quantity);

  return (
    <FormProvider context={form.context}>
      <FormStateInput />
      <form {...getFormProps(form)} action={formAction}>
        <input name="id" type="hidden" value={productId} />
        <div className="grid grid-cols-1 gap-6 pb-8 @5xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] @5xl:items-start">
          {/* LEFT (70%): product header (title/price/etc.) + variant option groups.
              The header keeps its own internal margins, so it's wrapped in a single element
              (not spread into the space-y-6 flow, which would add 24px between every header row). */}
          <div className="space-y-3">
            {header != null && <div>{header}</div>}
            <div className="space-y-2.5">
              {(() => {
                // Windows-style products expose a "Width (in.)" and "Height (in.)" option. When
                // both are present, render them side-by-side as `Width [ ] × Height [ ]` instead
                // of stacked. Keyed on the option labels (not the category, which the form never
                // receives), so it applies to any product with both dimensions.
                const widthField = fields.find((f) => /width/i.test(f.label));
                const heightField = fields.find((f) => /height/i.test(f.label));
                const paired = widthField != null && heightField != null;

                const renderField = (field: F) => (
                  <FormField
                    emptySelectPlaceholder={emptySelectPlaceholder}
                    field={field}
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    formField={formFields[field.name]!}
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    key={formFields[field.name]!.id}
                    onPrefetch={onPrefetch}
                  />
                );

                // Sort a select field's options by the numeric value in their label, ascending
                // (e.g. Width / Height dimensions: 24, 30, 36...). Falls back to a locale string
                // compare when a label has no leading number. Leaves non-select fields untouched.
                const sortOptionsAscending = (field: F): F => {
                  if (
                    !('options' in field) ||
                    !Array.isArray((field as { options?: unknown }).options)
                  ) {
                    return field;
                  }

                  // Parse dimension labels to a sortable number. Handles plain numbers ("30",
                  // "30.5") and the "whole-numerator/denominator" fraction format BigCommerce
                  // uses for windows ("17-3/4" -> 17.75, "23-1/4" -> 23.25).
                  const toNum = (label: string) => {
                    const fraction = /^(\d+)-(\d+)\/(\d+)/.exec(label.trim());

                    if (fraction) {
                      const [, whole, num, den] = fraction;

                      return Number(whole) + Number(num) / Number(den);
                    }

                    return parseFloat(label.replace(/[^0-9.]/g, ''));
                  };

                  return {
                    ...field,
                    options: [
                      ...(field as unknown as { options: Array<{ label: string }> }).options,
                    ].sort((a, b) => {
                      const na = toNum(a.label);
                      const nb = toNum(b.label);

                      if (Number.isNaN(na) || Number.isNaN(nb)) {
                        return a.label.localeCompare(b.label, undefined, { numeric: true });
                      }

                      return na - nb;
                    }),
                  } as F;
                };

                if (paired) {
                  const rest = fields.filter(
                    (f) => f !== widthField && f !== heightField,
                  );

                  // Dependent filtering (one-directional): Width always shows ALL options; once a
                  // Width is chosen, Height is restricted to values that co-occur with it in a real
                  // variant. Kept one-way on purpose — if it were bidirectional, picking a Height
                  // would shrink the Width list and the user could get stuck with no way back to
                  // the full set. Derived at render time from the current selection (no local
                  // state, so it never goes stale).
                  const selectedWidth = params[widthField.name] ?? undefined;

                  let filteredHeightField = heightField;

                  if (
                    optionDependencyMap != null &&
                    selectedWidth != null &&
                    'options' in heightField &&
                    Array.isArray((heightField as { options?: unknown }).options)
                  ) {
                    const allowed = optionDependencyMap[Number(selectedWidth)];

                    if (allowed != null) {
                      const allowedSet = new Set(allowed.map((id) => id.toString()));

                      filteredHeightField = {
                        ...heightField,
                        options: (
                          heightField as unknown as { options: Array<{ value: string }> }
                        ).options.filter((option) => allowedSet.has(option.value)),
                      } as F;
                    }
                  }

                  return (
                    <>
                      <div className="flex items-end gap-3">
                        {renderField(sortOptionsAscending(widthField))}
                        <span className="pb-2 text-lg text-contrast-400">×</span>
                        {renderField(sortOptionsAscending(filteredHeightField))}
                      </div>
                      {rest.map(renderField)}
                    </>
                  );
                }

                return fields.map(renderField);
              })()}
            </div>
          {form.errors?.map((error, index) => (
            <FormStatus className="pt-3" key={index} type="error">
              {error}
            </FormStatus>
          ))}

          {/* Reserved slot for backorder messages — collapses to zero height when empty.
              BigCommerce's stock-level count message ("N in stock") is intentionally NOT shown
              here; the stock state is conveyed by the In/Limited/Out badge above the quantity
              instead. */}
          {!!backorderMessages && (
          <div className="h-[1.6rem] sm:h-[1.3rem] @2xl:h-auto">
            {!!backorderMessages && (
              <div
                className={clsx(
                  'mt-1 flex flex-wrap justify-start gap-x-2.5 gap-y-2 text-sm text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]',
                  'ease-initial transition-opacity',
                  backorderMessages.backorderQuantityMessage ||
                    backorderMessages.backorderInfoMessage
                    ? 'duration-400 opacity-100'
                    : 'opacity-0 delay-0 duration-100',
                )}
              >
                <div className="flex-none whitespace-nowrap font-semibold text-black">
                  {backorderMessages.backorderQuantityMessage}
                </div>
                {!!backorderMessages.backorderInfoMessage && (
                  <div className="flex-none whitespace-nowrap border-s border-gray-300 pl-2.5">
                    {backorderMessages.backorderInfoMessage}
                  </div>
                )}
              </div>
            )}
          </div>
          )}
          {/* Description at the bottom of the LEFT column (under the options). */}
          {descriptionSlot != null && <div className="pt-2">{descriptionSlot}</div>}
          </div>
          {/* RIGHT (30%): purchase panel (quantity + buttons), the fulfillment box, and a small
              trust/service block (pickup / price match / returns). */}
          <div className="space-y-4 @5xl:sticky @5xl:top-4">
          <div className="space-y-4 rounded-xl border border-contrast-100 bg-[#f5f5f5] p-4">
            {hasUnselectedRequiredOption ? (
              <p className="text-sm font-semibold text-foreground">Select size for availability</p>
            ) : (
              stockStatus != null && (
                <p
                  className={clsx(
                    'text-sm font-semibold',
                    stockStatus === 'in' && 'text-[#16A34A]',
                    typeof stockStatus === 'object' && 'text-[#96050F]',
                    stockStatus === 'out' && 'text-error',
                  )}
                >
                  {stockStatus === 'in' && 'In stock'}
                  {typeof stockStatus === 'object' && `Only ${stockStatus.low} in stock`}
                  {stockStatus === 'out' && 'Out of stock'}
                </p>
              )
            )}
            <div>
              <Label className="mb-2" id="quantity-label" required>
                {quantityLabel}
              </Label>
              <NumberInput
                aria-label={quantityLabel}
                // +/- states (scoped to this PDP stepper):
                //  • regular icon: black (visible) — but NOT on hover (icon turns white there).
                //  • regular hover: black bg + white icon (from the global vars).
                //  • disabled (at min/max/stock): faded via disabled:opacity-30, and on hover a light
                //    (near-white) bg instead of the dark actionable hover, since it can't be used.
                //  • press: a lighter grey bg so the press reads distinct from the black hover.
                className={clsx(
                  '[&_button:active]:!bg-[#666666]',
                  // Black icon only when the button is enabled and not hovered/active.
                  '[&_button:not(:hover):not(:disabled)_svg]:!text-foreground',
                  // Disabled buttons: light hover bg + keep the (faded) icon, no dark fill.
                  '[&_button:disabled]:hover:!bg-contrast-100 [&_button:disabled_svg]:!text-foreground',
                )}
                decrementLabel={decrementLabel}
                incrementLabel={incrementLabel}
                max={maxQuantity}
                min={minQuantity ?? 1}
                name={formFields.quantity.name}
                onBlur={quantityControl.blur}
                onChange={(e) => quantityControl.change(e.currentTarget.value)}
                onFocus={quantityControl.focus}
                required
                value={quantityControl.value}
              />
            </div>
            {/* In-flow buttons — desktop only. On mobile they live in the sticky bottom bar. */}
            <div className="hidden flex-col gap-3 @2xl:flex">
              <SubmitButton disabled={ctaDisabled}>{ctaLabel}</SubmitButton>
              <SubmitButton
                disabled={ctaDisabled}
                onClick={() => {
                  buyNowRef.current = true;
                }}
                variant="tertiary"
              >
                Buy now
              </SubmitButton>
            </div>
          </div>
          {/* Fulfillment box (__fulfillment custom field): delivery/pickup message with an icon. */}
          {fulfillmentMessage != null && fulfillmentMessage !== '' && (
            <div className="flex items-start gap-3 rounded-xl bg-[var(--product-detail-fulfillment-background,#F6EBD6)] p-4">
              <FulfillmentIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--product-detail-fulfillment-icon,hsl(var(--foreground)))]" />
              <p className="text-sm text-[var(--product-detail-fulfillment-text,hsl(var(--contrast-500)))]">
                {fulfillmentMessage}
              </p>
            </div>
          )}
          {/* Trust / service block: three small icon + label rows under the purchase panel, each a
              link to its policy page (href placeholders for now). The first row's label comes from
              the __delivery custom field (deliveryMessage) when set. Only the TEXT is link-colored
              (#2162a1, darker on hover); the icon keeps its own color (SVGs to be supplied). */}
          <ul className="flex flex-col gap-2 rounded-xl border border-contrast-100 p-4 [&_svg]:size-6">
            {TRUST_ITEMS.map((item, idx) => {
              const isDeliveryRow = idx === 0;
              // The delivery row (first) is driven by the __delivery custom field — only shown when
              // that field is set. The other trust items always render.
              if (isDeliveryRow && (deliveryMessage == null || deliveryMessage === '')) {
                return null;
              }

              const label = isDeliveryRow ? deliveryMessage : item.label;

              return (
                <li key={item.label}>
                  <a className="flex items-center gap-3" href={item.href}>
                    <span className="shrink-0 text-foreground">{item.icon}</span>
                    {/* Same animated red-underline hover as breadcrumbs / "Write a review". */}
                    <span
                      className={clsx(
                        'text-xs font-normal text-[#2162a1]',
                        animatedUnderlineClassName,
                      )}
                    >
                      {label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
          </div>
        </div>

        {/* Mobile sticky bottom bar: Add to cart + Buy now side-by-side, fixed to the viewport
            bottom so the CTAs are always reachable while scrolling. Hidden on desktop (@2xl), where
            the in-flow buttons in the purchase panel are shown instead. Inside the <form> so both
            buttons submit correctly. */}
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-2 border-t border-contrast-100 bg-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] @2xl:hidden">
          {/* Compact quantity stepper. No `name` — it's display-only and drives quantityControl; the
              actual form value is carried by the (CSS-hidden but still-mounted) desktop input above,
              so we don't submit a duplicate quantity field. Black icons like the main stepper. */}
          <NumberInput
            aria-label={quantityLabel}
            className="shrink-0 [&_button:active]:!bg-[#666666] [&_button:not(:hover):not(:disabled)_svg]:!text-foreground [&_input]:w-6"
            decrementLabel={decrementLabel}
            incrementLabel={incrementLabel}
            max={maxQuantity}
            min={minQuantity ?? 1}
            onBlur={quantityControl.blur}
            onChange={(e) => quantityControl.change(e.currentTarget.value)}
            onFocus={quantityControl.focus}
            value={quantityControl.value}
          />
          <div className="flex-1 [&_button]:h-full [&_button]:w-full">
            <SubmitButton disabled={ctaDisabled}>{ctaLabel}</SubmitButton>
          </div>
          <div className="flex-1 [&_button]:h-full [&_button]:w-full">
            <SubmitButton
              disabled={ctaDisabled}
              onClick={() => {
                buyNowRef.current = true;
              }}
              variant="tertiary"
            >
              Buy now
            </SubmitButton>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

function SubmitButton({
  children,
  disabled,
  onClick,
  variant = 'primary',
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full"
      disabled={disabled}
      loading={pending && variant === 'primary'}
      onClick={onClick}
      size="medium"
      type="submit"
      variant={variant}
    >
      {children}
    </Button>
  );
}

// eslint-disable-next-line complexity
function FormField({
  field,
  formField,
  onPrefetch,
  emptySelectPlaceholder,
}: {
  field: Field;
  formField: FieldMetadata<string | number | boolean | Date | undefined>;
  onPrefetch: (fieldName: string, value: string) => void;
  emptySelectPlaceholder?: string;
}) {
  const controls = useInputControl(formField);

  const [, setParams] = useQueryStates(
    field.persist === true ? { [field.name]: parseAsString.withOptions({ shallow: false }) } : {},
  );

  const handleChange = useCallback(
    (value: string) => {
      // Checkbox field has to be handled separately because we want to convert 'true' or '' to the checked or unchecked value respectively.
      if (field.type === 'checkbox') {
        void setParams({ [field.name]: value ? field.checkedValue : field.uncheckedValue });
      } else {
        void setParams({ [field.name]: value || null }); // Passing `null` to remove the value from the query params if fieldValue is falsey
      }

      controls.change(value || ''); // If fieldValue is falsey, we set it to an empty string
    },
    [setParams, field, controls],
  );

  const handleOnOptionMouseEnter = (value: string) => {
    if (field.persist === true) {
      onPrefetch(field.name, value);
    }
  };

  switch (field.type) {
    case 'number':
      return (
        <NumberInput
          decrementLabel={field.decrementLabel}
          errors={formField.errors}
          incrementLabel={field.incrementLabel}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onChange={(e) => handleChange(e.currentTarget.value)}
          onFocus={controls.focus}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'text':
      return (
        <Input
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onChange={(e) => handleChange(e.currentTarget.value)}
          onFocus={controls.focus}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'date':
      return (
        <DatePicker
          defaultValue={controls.value}
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onChange={(e) => handleChange(e.currentTarget.value)}
          onFocus={controls.focus}
          required={formField.required}
        />
      );

    case 'textarea':
      return (
        <Textarea
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          maxLength={field.maxLength}
          minLength={field.minLength}
          name={formField.name}
          onBlur={controls.blur}
          onChange={(e) => handleChange(e.currentTarget.value)}
          onFocus={controls.focus}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          checked={controls.value === 'true'}
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onCheckedChange={(value) => handleChange(value ? 'true' : '')}
          onFocus={controls.focus}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'select':
      return (
        // Wrap in a fit-content box so the trigger shrinks to its widest option + padding
        // instead of spanning the whole form column. Scoped to the PDP; shared Select is untouched.
        <div className="w-fit max-w-full" key={formField.id}>
          <Select
            errors={formField.errors}
            label={field.label}
            name={formField.name}
            onBlur={controls.blur}
            onFocus={controls.focus}
            onOptionMouseEnter={handleOnOptionMouseEnter}
            onValueChange={handleChange}
            options={field.options}
            placeholder={emptySelectPlaceholder}
            required={formField.required}
            value={controls.value ?? ''}
          />
        </div>
      );

    case 'radio-group':
      return (
        <RadioGroup
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onOptionMouseEnter={handleOnOptionMouseEnter}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'swatch-radio-group':
      return (
        <SwatchRadioGroup
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onOptionMouseEnter={handleOnOptionMouseEnter}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'card-radio-group':
      return (
        <CardRadioGroup
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onOptionMouseEnter={handleOnOptionMouseEnter}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'button-radio-group':
      return (
        <ButtonRadioGroup
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onOptionMouseEnter={handleOnOptionMouseEnter}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );
  }
}
