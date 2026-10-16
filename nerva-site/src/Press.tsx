/* ------------------------------------------------------------------
   Press kit, at /press. What a writer needs in one place: a line they
   can quote, the facts, pictures they may use (labelled render or
   photograph, because the site is strict about which is which), and how
   to describe the ring without overclaiming.

   The facts are the ones in nerva-ring-overview.md. When those change,
   change them here in the same commit.
   ------------------------------------------------------------------ */

import type { ReactNode } from 'react'
import { SiteHeader, SiteFooter, SkipLink } from './Chrome.tsx'
import { CONTACT_EMAIL } from './Signup.tsx'
import benchPhoto from './assets/proto-bench.webp'
import handPhoto from './assets/proto-hand.webp'
import ringRender from './assets/ring-ceramic-black.webp'

const UPDATED = '16 October 2026'

const FACTS: [string, ReactNode][] = [
  ['Product', 'NERVA Ring, a smart ring'],
  ['Stage', 'Working bench prototype in a black ceramic housing. Not for sale.'],
  ['Maker', 'Ryan Schreiber, building it alone'],
  ['Senses', 'Heart rate and blood oxygen by optical sensor, and skin conductance (EDA) through two dry gold-plated electrodes on the inner band'],
  ['Connection', 'Bluetooth LE to a companion app'],
  ['Battery', '22 mAh cell, targeting about a month of standby'],
  ['Build', 'Flex PCB wrapped inside the band and potted in resin, sealed with no seams'],
  ['Next', 'Bluetooth testing on a vector network analyzer at the University of Vermont, then beta testers'],
  ['Availability', 'Update list at nervaring.com. A crowdfunding campaign is planned after prototype testing.'],
]

const IMAGES = [
  { src: benchPhoto, w: 1200, h: 1600, kind: 'Photograph', name: 'Bench prototype', alt: 'The NERVA Ring bench prototype standing on a dark table, its green LED lit inside the black ceramic band.', file: 'nerva-ring-bench-prototype.webp' },
  { src: handPhoto, w: 768, h: 1024, kind: 'Photograph', name: 'Prototype in hand', alt: 'The prototype resting in an open palm.', file: 'nerva-ring-in-hand.webp' },
  { src: ringRender, w: 1400, h: 1270, kind: 'Render', name: 'Black ceramic', alt: 'A render of the NERVA Ring in black ceramic, showing the flex PCB inside the band.', file: 'nerva-ring-render-black.webp' },
] as const

export default function Press() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="/press" />

      <main id="main" className="sheet press">
        <div className="wrap">
          <h1 className="sheet__title">Press kit</h1>

          <div className="titleblock sheet__block">
            <div className="tb tb--w2">
              <span className="tb__k">Press contact</span>
              <b className="tb__v"><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></b>
            </div>
            <div className="tb tb--w2">
              <span className="tb__k">Last updated</span>
              <b className="tb__v">{UPDATED}</b>
            </div>
            <div className="tb tb--w2">
              <span className="tb__k">Credit</span>
              <b className="tb__v">NERVA Ring</b>
            </div>
          </div>

          <p className="sheet__lede">
            NERVA Ring is a prototype smart ring that pairs heart rate and blood
            oxygen with continuous skin-conductance sensing, to help people see and
            manage their stress.
          </p>

          <section className="clause">
            <h2 className="clause__label">About</h2>
            <div className="clause__body">
              <p>
                Most wearables measure the heart. NERVA Ring adds a second signal, the
                electrical conductance of the skin, which follows the sympathetic
                nervous system and is a standard measure of arousal in stress
                research. Two dry gold electrodes on the inner band read it directly,
                alongside heart rate and blood oxygen from an optical sensor.
              </p>
              <p>
                It is built by Ryan Schreiber, who is designing the mechanics,
                electronics and firmware himself. A working prototype was powered
                up in October 2026. Read{' '}
                <a href="/science">how skin conductance works</a> or follow the{' '}
                <a href="/updates">build log</a>.
              </p>
            </div>
          </section>

          <section className="clause">
            <h2 className="clause__label">Facts</h2>
            <div className="clause__body">
              <dl className="facts">
                {FACTS.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="clause">
            <h2 className="clause__label">Pictures</h2>
            <div className="clause__body clause__body--wide">
              <ul className="pics">
                {IMAGES.map((im) => (
                  <li key={im.file}>
                    <img src={im.src} width={im.w} height={im.h} loading="lazy" alt={im.alt} />
                    <p>
                      <b>{im.name}</b>
                      <span>{im.kind}</span>
                    </p>
                    <a href={im.src} download={im.file}>Download</a>
                  </li>
                ))}
              </ul>
              <p>
                Please credit “NERVA Ring” and keep the label: the photographs show the
                bench prototype, and the renders show the CAD model, not a finished
                product. For anything else, write to {CONTACT_EMAIL}.
              </p>
            </div>
          </section>

          <section className="clause">
            <h2 className="clause__label">How to describe it</h2>
            <div className="clause__body">
              <ul className="plain">
                <li>It is a wellness product, not a medical device. It does not diagnose, treat, cure or prevent any disease.</li>
                <li>It is a prototype and is not for sale. Please do not give a price or a ship date, because there are none.</li>
                <li>Heart rate and blood oxygen are measured by the optical sensor. Stress is read from skin conductance. Say that it reads arousal, not that it reads emotion.</li>
                <li>Battery life and water resistance are design targets that testing has not confirmed yet.</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
