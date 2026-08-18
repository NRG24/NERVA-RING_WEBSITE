import { useEffect, useMemo, useState } from 'react'
import ringGraphite from './assets/ring-graphite.jpg'
import ringGold from './assets/ring-gold2.jpg'
import ringChrome from './assets/ring-chrome.jpg'
import blueprint from './assets/blueprint.jpg'
import {
  PLACEHOLDER_PRODUCT,
  fetchProduct,
  formatMoney,
  shopifyReady,
  startCheckout,
  type Product,
  type Variant,
} from './shopify'

const FINISH_ART: Record<string, string> = {
  Graphite: ringGraphite,
  'Champagne Gold': ringGold,
}

const SWATCH: Record<string, string> = {
  Graphite: 'linear-gradient(140deg,#3a3d42,#0d0e10 70%)',
  'Champagne Gold': 'linear-gradient(140deg,#e6cf9b,#8f7636 72%)',
}

/* what physically ships, per the charging and housing sections of the overview */
const IN_THE_BOX = [
  {
    k: 'The ring',
    body: 'Flex PCB wrapped to the inner circumference and potted in clear resin, so there are no seams to catch water.',
  },
  {
    k: 'Charging dock',
    body: 'A 2-pin pogo dock, the same approach the rest of the smart-ring industry uses, with protection against sweat bridging the contacts.',
  },
]

const MEASURES = [
  { k: 'Heart rate & SpO₂', body: 'Optical PPG reading pulse and blood oxygen off the finger.' },
  { k: 'Skin conductance', body: 'Two dry gold electrodes on the inner band tracking sympathetic arousal.' },
  { k: 'Standby target', body: 'Roughly a month between charges from a 22 mAh cell, on a wake-on-finger duty cycle.' },
]

function uniq(values: (string | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))]
}

export default function Buy() {
  const [product, setProduct] = useState<Product>(PLACEHOLDER_PRODUCT)
  const [loadError, setLoadError] = useState('')
  const [finish, setFinish] = useState('')
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [checkout, setCheckout] = useState<'idle' | 'sending' | 'error'>('idle')
  const [checkoutMsg, setCheckoutMsg] = useState('')

  /* With credentials present the real product replaces the placeholder. Without
     them this never runs and the page stays in preview mode. */
  useEffect(() => {
    if (!shopifyReady) return
    let cancelled = false
    fetchProduct()
      .then((p) => {
        if (cancelled) return
        if (p) setProduct(p)
        else setLoadError('That product handle does not exist in Shopify yet.')
      })
      .catch((e: Error) => { if (!cancelled) setLoadError(e.message) })
    return () => { cancelled = true }
  }, [])

  const finishes = useMemo(() => uniq(product.variants.map((v) => v.options.finish)), [product])
  const sizes = useMemo(() => uniq(product.variants.map((v) => v.options.size)), [product])

  /* keep the selection valid whenever the option lists change */
  useEffect(() => {
    if (finishes.length && !finishes.includes(finish)) setFinish(finishes[0])
    if (sizes.length && !sizes.includes(size)) setSize(sizes[0])
  }, [finishes, sizes, finish, size])

  const variant: Variant | undefined = useMemo(() => {
    if (!finishes.length && !sizes.length) return product.variants[0]
    return product.variants.find(
      (v) =>
        (!finishes.length || v.options.finish === finish) &&
        (!sizes.length || v.options.size === size),
    )
  }, [product, finishes, sizes, finish, size])

  const price = formatMoney(variant?.price ?? null)
  const art = FINISH_ART[finish] ?? ringGraphite
  const buyable = product.live && Boolean(variant?.availableForSale)

  async function onBuy() {
    if (!variant || !buyable || checkout === 'sending') return
    setCheckout('sending')
    try {
      window.location.href = await startCheckout(variant.id, qty)
    } catch (e) {
      setCheckout('error')
      setCheckoutMsg(e instanceof Error ? e.message : 'Could not reach Shopify.')
    }
  }

  return (
    <>
      <div className="shopbar">
        <span className="shopbar__dot" aria-hidden="true" />
        Store preview · checkout is not connected · nothing here can be bought
      </div>

      <header className="nav">
        <div className="nav__inner">
          <a className="brand" href="/" aria-label="NERVA home">
            <span className="brand__mark" aria-hidden="true" />
            NERVA
          </a>
          <div className="nav__right">
            <a className="btn btn--ghost" href="/updates.html">FAQ &amp; updates</a>
            <a className="btn btn--ghost" href="/">Back to the build</a>
          </div>
        </div>
      </header>

      <main className="shop">
        <div className="wrap buy">
          {/* ---------------- gallery ---------------- */}
          <div className="buy__art">
            <div className="buy__stage">
              <img
                key={art}
                src={art}
                width={1400}
                height={1270}
                alt={`The NERVA ring in ${(finish || 'graphite').toLowerCase()}, showing the flex PCB and sensor LEDs inside the band.`}
              />
            </div>
            <div className="buy__strip">
              <img src={ringChrome} loading="lazy" alt="Inside the band: flex PCB, gold electrodes, and the optical sensor LEDs." />
              <img src={blueprint} loading="lazy" alt="Engineering drawing of the ring housing and internal flex-PCB assembly." />
            </div>
          </div>

          {/* ---------------- purchase panel ---------------- */}
          <div className="buy__panel">
            <h1 className="buy__title">{product.title}</h1>
            <p className="buy__sub">
              Heart rate and blood oxygen on one channel, skin conductance on the other, from a
              ring no bigger than a normal one.
            </p>

            <div className="buy__price">
              {price ? (
                <span className="buy__amount">{price}</span>
              ) : (
                <>
                  <span className="buy__amount buy__amount--unset">Not priced yet</span>
                  <span className="buy__pricenote">
                    The number lands here once the Shopify product goes live.
                  </span>
                </>
              )}
            </div>

            {finishes.length > 0 && (
              <div className="opt">
                <div className="opt__label">Finish. <span>{finish}</span></div>
                <div className="opt__swatches" role="radiogroup" aria-label="Finish">
                  {finishes.map((f) => (
                    <button
                      key={f}
                      role="radio"
                      aria-checked={finish === f}
                      aria-label={f}
                      className={`swatch ${finish === f ? 'is-active' : ''}`}
                      style={{ background: SWATCH[f] ?? 'var(--studio)' }}
                      onClick={() => setFinish(f)}
                    />
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="opt">
                <div className="opt__label">
                  Size. <span>US {size}</span>
                </div>
                <div className="opt__sizes" role="radiogroup" aria-label="Ring size">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      role="radio"
                      aria-checked={size === s}
                      className={`sizebtn ${size === s ? 'is-active' : ''}`}
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {!product.live && (
                  <p className="opt__note">
                    Placeholder range. Sizing is not locked until the housing goes to tooling.
                  </p>
                )}
              </div>
            )}

            <div className="opt opt--qty">
              <div className="opt__label">Quantity</div>
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="One fewer">−</button>
                <span aria-live="polite">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(5, q + 1))} aria-label="One more">+</button>
              </div>
            </div>

            <button
              className="btn btn--accent btn--lg btn--block buy__cta"
              onClick={onBuy}
              disabled={!buyable || checkout === 'sending'}
            >
              {checkout === 'sending' ? 'Opening checkout…' : buyable ? 'Add to cart' : 'Checkout not connected'}
            </button>

            <p className="buy__state">
              {loadError
                ? `Shopify said: ${loadError}`
                : !shopifyReady
                  ? 'This page is a layout preview. No store is wired up, so nothing can be ordered and no payment details are collected anywhere on it.'
                  : buyable
                    ? 'Checkout is handled by Shopify. Card details never touch this site.'
                    : 'That combination is not in stock.'}
            </p>
            {checkout === 'error' && <p className="buy__err" role="alert">{checkoutMsg}</p>}

            <p className="buy__alt">
              Want to know when it is buyable? <a href="/#follow">Join the build list</a> instead.
            </p>
          </div>
        </div>

        {/* ---------------- what ships ---------------- */}
        <section className="shop-sec">
          <div className="wrap shop-sec__grid">
            <h2 className="shop-sec__h">In the box</h2>
            <div className="rows">
              {IN_THE_BOX.map((item) => (
                <div className="row" key={item.k}>
                  <b>{item.k}</b>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="shop-sec shop-sec--tint">
          <div className="wrap shop-sec__grid">
            <h2 className="shop-sec__h">What it measures</h2>
            <div className="rows">
              {MEASURES.map((item) => (
                <div className="row" key={item.k}>
                  <b>{item.k}</b>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- the honest part ---------------- */}
        <section className="shop-sec">
          <div className="wrap shop-sec__grid">
            <h2 className="shop-sec__h">Before you order</h2>
            <div className="rows">
              <div className="row">
                <b>It is a prototype</b>
                <p>
                  NERVA is in functional prototyping. Firmware for the full sensing pipeline is
                  not written yet, and no unit has been through prototype testing.
                </p>
              </div>
              <div className="row">
                <b>No date</b>
                <p>
                  There is no ship date to give you. The <a href="/updates.html">FAQ &amp; updates</a> page
                  tracks the launch timeline and what is finished and what is not, and it stays current.
                </p>
              </div>
              <div className="row">
                <b>No price</b>
                <p>
                  Pricing follows the production run, since the housing material and the small-batch
                  assembly cost are both still open.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="shopfoot">
        <div className="wrap shopfoot__inner">
          <a className="brand" href="/">
            <span className="brand__mark" aria-hidden="true" />
            NERVA
          </a>
          <p>© 2026 NERVA. Store layout preview, not a live shop.</p>
        </div>
      </footer>
    </>
  )
}
