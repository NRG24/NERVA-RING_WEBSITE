/* The questions on the main page, kept in their own file so the page, the
   FAQPage JSON-LD that vite.config.ts writes into index.html, and anything
   else that needs them read one list. Every answer is checkable against
   nerva-ring-overview.md or the site's own disclaimers. Keep it that way:
   no claim goes in this list that the build cannot back yet. */
export const FAQ = [
  {
    q: 'Can I buy one yet?',
    a: 'Not yet. NERVA Ring is an early prototype built by one person, and nothing on this site is for sale. The plan is a crowdfunding campaign once the prototype has been tested, and the update list hears about it first.',
  },
  {
    q: 'What is EDA?',
    a: 'Electrodermal activity: how easily your skin conducts a tiny current. When your sympathetic nervous system fires, your sweat glands respond and skin conductance rises within seconds. It is the arousal signal clinical stress research relies on.',
  },
  {
    q: 'How is it different from other smart rings?',
    a: 'Most rings estimate stress from heart rate and heart rate variability, through a model. NERVA adds two dry gold electrodes on the inner band that read skin conductance directly, alongside heart rate and blood oxygen.',
  },
  {
    q: 'How long will the battery last?',
    a: 'The ring carries a 22 mAh cell and sleeps between readings, targeting about a month of standby. Battery life in everyday wear will be measured during prototype testing and published in the update notes.',
  },
  {
    q: 'Can I wear it in the shower?',
    a: 'The electronics are fully potted in resin inside the band, so the ring is sealed with no seams, and it is designed for hand-washing and showering. It has not been through formal water-rating tests yet.',
  },
  {
    q: 'Is it a medical device?',
    a: 'No. NERVA Ring is a wellness product. It is not intended to diagnose, treat, cure, or prevent any disease.',
  },
] as const
