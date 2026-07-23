// Inline icons for the product-card CTA (an "expand" icon and "add_shopping_cart").
// currentColor so they inherit the button's text color and its hover transition.

export function OptionsIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M240-240v-200h40v160h160v40H240Zm440-280v-160H520v-40h200v200h-40Z" />
    </svg>
  );
}

export function AddToCartIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M460-620v-120H340v-40h120v-120h40v120h120v40H500v120h-40ZM249.65-132.73q-17.34-17.35-17.34-42.65 0-25.31 17.34-42.66 17.35-17.34 42.66-17.34 25.31 0 42.65 17.34 17.35 17.35 17.35 42.66 0 25.3-17.35 42.65-17.34 17.35-42.65 17.35t-42.66-17.35Zm375.39 0q-17.35-17.35-17.35-42.65 0-25.31 17.35-42.66 17.34-17.34 42.65-17.34t42.66 17.34q17.34 17.35 17.34 42.66 0 25.3-17.34 42.65-17.35 17.35-42.66 17.35-25.31 0-42.65-17.35ZM80-820v-40h97.92l163.85 344.62h265.38q6.93 0 12.31-3.47 5.39-3.46 9.23-9.61L768.54-780h45.61L662.77-506.62q-8.69 14.62-22.58 22.93-13.88 8.31-30.5 8.31H324l-48.62 89.23q-6.15 9.23-.38 20 5.77 10.77 17.31 10.77h435.38v40H292.31q-35 0-52.35-29.39-17.34-29.38-.73-59.38l60.15-107.23L152.31-820H80Z" />
    </svg>
  );
}
