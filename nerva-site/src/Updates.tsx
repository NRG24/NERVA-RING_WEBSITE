const CONTACT_EMAIL = 'hello@nervaring.com'

const FAQ = [
  {
    q: 'What does NERVA actually measure?',
    a: 'Heart rate and blood oxygen from an optical PPG sensor, plus continuous skin conductance (GSR/EDA) from two dry gold electrodes built into the inner band. Most rings stop at the first pair; the electrodermal channel is what NERVA adds.',
  },
  {
    q: 'Is NERVA available to buy right now?',
    a: 'No. NERVA is in functional prototyping. There is a store preview at /buy.html so you can see how checkout will look, but nothing on that page can be ordered and no payment details are collected anywhere on the site.',
  },
  {
    q: 'When does it launch?',
    a: 'There is no fixed launch date yet, and this page will say so plainly instead of guessing. The build stands between firmware and prototype testing right now; see the timeline below for what has to happen before a date is meaningful.',
  },
  {
    q: 'How much will it cost?',
    a: 'Not decided. Pricing follows the production run, since the housing material and small-batch assembly cost are both still open questions.',
  },
  {
    q: 'How long does the battery last?',
    a: 'The target is roughly a month of standby from a 22 mAh cell, using a wake-on-finger architecture that keeps the ring asleep until a finger is on it. That is a design target, not a measured result yet, since full firmware is not written.',
  },
  {
    q: 'Is it waterproof?',
    a: 'The internal flex assembly is potted in clear resin inside the housing, with no seams or gaps, which is designed to make it safe for hand-washing and showering. It has not yet been through formal waterproofing testing.',
  },
  {
    q: 'Who is building this?',
    a: 'One person: Ryan Schreiber. Mechanical, electrical, and firmware design are all done in-house, from first principles, rather than assembled from an off-the-shelf reference design.',
  },
  {
    q: 'How do I find out when something changes?',
    a: `Join the build list on the main site (the "Follow the build" link), or check this page, which stays current as the build log below changes. You can also reach out directly at ${CONTACT_EMAIL}.`,
  },
] as const

/* Newest first. Add a dated entry here each time something ships — the
   `date` field is the one part of this file that must never be guessed;
   leave it unset until the real date of that milestone is known. */
const LOG = [
  {
    date: null,
    title: 'Housing & flex-PCB wrap modeled in Fusion 360',
    body: 'The internal flex assembly now has a modeled wrap path around the inner circumference, along with the resin-potting and waterproofing process it will go through.',
  },
  {
    date: null,
    title: 'BLE module and antenna layout complete',
    body: 'A u-blox ANNA-B402 module with an antenna tuned to the ring form factor is locked in, keeping the companion app in sync without draining the cell.',
  },
  {
    date: null,
    title: 'GSR analog front end designed and tuned',
    body: 'A custom transimpedance-amplifier circuit on a dual op-amp is tuned for the low-current, low-noise range that skin conductance sits in.',
  },
  {
    date: null,
    title: 'Power architecture finalized',
    body: 'A single BQ25120A PMIC handles the 1.8 V MCU rail, a switched 3.3 V sensor rail, plus battery charging, monitoring, and load-switching.',
  },
] as const

/* what still has to happen, roughly in order, with no dates attached
   until they are real */
const TIMELINE = [
  { s: 'done', label: 'Power architecture finalized (BQ25120A-based)' },
  { s: 'done', label: 'GSR analog front end designed and tuned' },
  { s: 'done', label: 'BLE module and antenna layout complete' },
  { s: 'done', label: 'Housing & flex-PCB wrap modeled in Fusion 360' },
  { s: 'done', label: 'Resin-potting and waterproofing process defined' },
  { s: 'wip', label: 'Boost converter for LED drive' },
  { s: 'wip', label: 'Final PCB layout & prototype assembly' },
  { s: 'todo', label: 'Firmware implementation of full sensing pipeline' },
  { s: 'todo', label: 'Functional prototype testing' },
  { s: 'todo', label: 'Small-batch hand-assembled production run' },
  { s: 'todo', label: 'Beta testing / crowdfunding phase — first real launch window' },
] as const

export default function Updates() {
  return (
    <>
      <div className="strip">
        In functional prototyping · solo-built hardware · not yet for sale
      </div>

      <header className="nav">
        <div className="nav__inner">
          <a className="brand" href="/" aria-label="NERVA home">
            <span className="brand__mark" aria-hidden="true" />
            NERVA
          </a>
          <a className="btn btn--ghost" href="/">Back to the build</a>
        </div>
      </header>

      <main className="shop">
        <div className="wrap updates__hero">
          <span className="eyebrow">FAQ · build log · timeline</span>
          <h1 className="display">Questions, updates, and where launch actually stands.</h1>
          <p className="lead__sub">
            No countdown clock and no guessed date. This page holds the answers people ask most,
            a running log of what has shipped, and an honest read on what is still ahead before
            NERVA is buyable.
          </p>
        </div>

        {/* ---------------- FAQ ---------------- */}
        <section className="shop-sec" id="faq">
          <div className="wrap shop-sec__grid">
            <h2 className="shop-sec__h">FAQ</h2>
            <div className="faq">
              {FAQ.map((item) => (
                <details className="faq__item" key={item.q}>
                  <summary>
                    <span>{item.q}</span>
                    <span className="faq__icon" aria-hidden="true" />
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- LAUNCH TIMELINE ---------------- */}
        <section className="shop-sec shop-sec--tint" id="timeline">
          <div className="wrap shop-sec__grid">
            <h2 className="shop-sec__h">Launch timeline</h2>
            <div>
              <p className="updates__note">
                NERVA does not have a launch date, because it would not be true yet. What it has
                is a build order, five steps finished and three still ahead, with beta testing /
                crowdfunding as the first real launch window.
              </p>
              <div className="ledger">
                {TIMELINE.map((row) => (
                  <div className={`lrow lrow--${row.s}`} key={row.label}>
                    <span className="lrow__mark" aria-hidden="true" />
                    <span className="lrow__label">{row.label}</span>
                    <span className="lrow__tag">
                      {row.s === 'done' ? 'Done' : row.s === 'wip' ? 'In progress' : 'Planned'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- BUILD LOG ---------------- */}
        <section className="shop-sec" id="log">
          <div className="wrap shop-sec__grid">
            <h2 className="shop-sec__h">Build log</h2>
            <div className="log">
              {LOG.map((entry) => (
                <div className="log__row" key={entry.title}>
                  <span className="log__date">{entry.date ?? 'Undated'}</span>
                  <div>
                    <b>{entry.title}</b>
                    <p>{entry.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="shop-sec shop-sec--tint updates__cta">
          <div className="wrap">
            <h2 className="shop-sec__h">Still have a question?</h2>
            <p className="updates__note">
              Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, or{' '}
              <a href="/#follow">join the build list</a> on the main site to get a note the moment
              a milestone lands.
            </p>
          </div>
        </section>
      </main>

      <footer className="shopfoot">
        <div className="wrap shopfoot__inner">
          <a className="brand" href="/">
            <span className="brand__mark" aria-hidden="true" />
            NERVA
          </a>
          <p>© 2026 NERVA · FAQ, updates &amp; timeline</p>
        </div>
      </footer>
    </>
  )
}
