/* ------------------------------------------------------------------
   The build log. Newest first. To post an update, add an entry at the
   top and bump `date` on the sitemap entry in public/sitemap.xml.

   Plain strings only (no JSX): the same list feeds the page, the Atom
   feed at /updates.xml (see vite.config.ts) and the JSON-LD.

   Every entry has to be checkable against nerva-ring-overview.md or
   the site's own pages. No claim goes in here that the build cannot
   back yet.
   ------------------------------------------------------------------ */

export type Update = {
  /** ISO date, used for sorting, the feed and the printed date */
  date: string
  title: string
  /** one string per paragraph */
  body: string[]
  link?: { href: string; label: string }
}

export const UPDATES: Update[] = [
  {
    date: '2026-10-13',
    title: 'The waitlist has its own page',
    body: [
      'There is now a page that is only the email field, at nervaring.com/waitlist. Everyone on it gets build updates from me, about once a month, starting with the next hardware milestone.',
    ],
    link: { href: '/waitlist', label: 'Join the waitlist' },
  },
  {
    date: '2026-10-05',
    title: 'The bench prototype is working',
    body: [
      'The flex PCB is assembled, wrapped inside a black ceramic housing, and powered up with its green LED lit. These are the first photographs of the ring itself rather than renders of the CAD model.',
      'Next it goes to the University of Vermont to have its Bluetooth tested on a vector network analyzer. A ring is a hard place for an antenna, and the VNA shows how far the housing and a finger pull it off the 2.4 GHz band.',
    ],
    link: { href: '/prototype', label: 'See the photographs' },
  },
  {
    date: '2026-07-12',
    title: 'The design is settled on paper',
    body: [
      'The power architecture, the skin-conductance front end, the Bluetooth module and its antenna layout are designed. The housing and the way the flex PCB wraps inside it are modeled in Fusion 360, and the resin-potting process that seals the ring is defined.',
      'Still open at that point: the boost converter that drives the green LED, the final PCB layout, and all of the firmware.',
    ],
  },
]

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
