/* the pages every sub-page header and footer links to, in order. /updates
   is labelled by its own title, as the main page's footer already does,
   so "Updates" is left to mean the email list. */
export const SITE_LINKS = [
  { href: '/science', label: 'Science' },
  { href: '/updates', label: 'Build log' },
  { href: '/prototype', label: 'Prototype' },
  { href: '/press', label: 'Press' },
] as const

/* The Kickstarter pre-launch page ("Notify me on launch"). Empty until
   Ryan creates it; /subscribed shows a follow button once it's set. */
export const KICKSTARTER_URL = ''

/* the waitlist only starts printing its size once the number helps */
export const SHOW_COUNT_FROM = 50
