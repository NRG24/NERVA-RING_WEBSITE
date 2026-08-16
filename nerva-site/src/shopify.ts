/* ------------------------------------------------------------------
   Shopify Storefront API seam.

   Nothing in here fires until both env vars are set (see .env.example).
   Until then the sales page renders PLACEHOLDER_PRODUCT, the price slot
   reads "not priced yet", and the buy button stays disabled instead of
   pretending a checkout exists.

   To turn it on:
     1. Shopify admin, Headless channel, create a storefront and copy the
        public Storefront API access token. It is safe in client code;
        the Admin API token is NOT, so never put that one here.
     2. Put VITE_SHOPIFY_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN in
        .env.local, which is gitignored.
     3. Create the product in Shopify with the handle in PRODUCT_HANDLE
        and one variant per finish and size you actually sell.

   The page then reads the title, options, price, and stock straight off
   Shopify, and the button hands the buyer to Shopify's own checkout.
   ------------------------------------------------------------------ */

export type Money = { amount: string; currencyCode: string }

export type Variant = {
  id: string
  title: string
  availableForSale: boolean
  price: Money | null
  /* option name (lowercased) -> value, e.g. { finish: 'Graphite', size: '9' } */
  options: Record<string, string>
}

export type Product = {
  title: string
  variants: Variant[]
  /* false when this came from PLACEHOLDER_PRODUCT rather than Shopify */
  live: boolean
}

const DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN as string | undefined
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN as string | undefined

/* Storefront API versions ship quarterly and each is supported for a year.
   Check https://shopify.dev/docs/api/usage/versioning and bump this when you
   upgrade; override per environment with VITE_SHOPIFY_API_VERSION. */
const API_VERSION = (import.meta.env.VITE_SHOPIFY_API_VERSION as string | undefined) ?? '2025-01'

export const PRODUCT_HANDLE = 'nerva-ring'
export const shopifyReady = Boolean(DOMAIN && TOKEN)

type GraphQLBody<T> = { data?: T; errors?: { message?: string }[] }

async function storefront<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  if (!shopifyReady) throw new Error('Shopify is not configured')

  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN as string,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`Storefront API returned ${res.status}`)

  const body = (await res.json()) as GraphQLBody<T>
  if (body.errors?.length) throw new Error(body.errors[0]?.message ?? 'Storefront API error')
  if (!body.data) throw new Error('Storefront API returned no data')
  return body.data
}

/* ---------------- product ---------------- */

const PRODUCT_QUERY = `
  query Product($handle: String!) {
    product(handle: $handle) {
      title
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          price { amount currencyCode }
          selectedOptions { name value }
        }
      }
    }
  }
`

type ProductResponse = {
  product: {
    title: string
    variants: {
      nodes: {
        id: string
        title: string
        availableForSale: boolean
        price: Money | null
        selectedOptions: { name: string; value: string }[]
      }[]
    }
  } | null
}

export async function fetchProduct(handle = PRODUCT_HANDLE): Promise<Product | null> {
  const data = await storefront<ProductResponse>(PRODUCT_QUERY, { handle })
  if (!data.product) return null

  return {
    title: data.product.title,
    live: true,
    variants: data.product.variants.nodes.map((v) => ({
      id: v.id,
      title: v.title,
      availableForSale: v.availableForSale,
      price: v.price,
      options: Object.fromEntries(
        v.selectedOptions.map((o) => [o.name.toLowerCase(), o.value]),
      ),
    })),
  }
}

/* ---------------- checkout ---------------- */

const CART_CREATE = `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`

type CartResponse = {
  cartCreate: {
    cart: { id: string; checkoutUrl: string } | null
    userErrors: { message: string }[]
  }
}

/* Creates a cart holding one variant and returns Shopify's hosted checkout URL.
   Send the buyer there; Shopify takes the payment and creates the order, so no
   card details ever touch this site. */
export async function startCheckout(merchandiseId: string, quantity = 1): Promise<string> {
  const data = await storefront<CartResponse>(CART_CREATE, {
    lines: [{ merchandiseId, quantity }],
  })
  const { cart, userErrors } = data.cartCreate
  if (userErrors?.length) throw new Error(userErrors[0].message)
  if (!cart) throw new Error('Shopify did not return a cart')
  return cart.checkoutUrl
}

/* ---------------- placeholder (pre-Shopify) ---------------- */

/* The two finishes that exist as renders. */
export const FINISHES = ['Graphite', 'Champagne Gold'] as const

/* PLACEHOLDER. NERVA has no finalized sizing, so this is a conventional ring
   range standing in for the real one, and the page labels it as such. Replace it
   with the sizes you actually cut, or let Shopify's variants supply them. */
export const PLACEHOLDER_SIZES = ['7', '8', '9', '10', '11', '12'] as const

/* No price is set. The ring is a prototype that has never been sold, so this
   file does not invent a number: the page shows the price slot empty until
   Shopify returns a figure. To preview the layout with something in it, put a
   Money value on `price` below, then take it back out. */
export const PLACEHOLDER_PRODUCT: Product = {
  title: 'NERVA Ring',
  live: false,
  variants: FINISHES.flatMap((finish) =>
    PLACEHOLDER_SIZES.map((size) => ({
      id: `placeholder:${finish}:${size}`,
      title: `${finish} / ${size}`,
      availableForSale: false,
      price: null,
      options: { finish, size },
    })),
  ),
}

export function formatMoney(price: Money | null): string | null {
  if (!price) return null
  const amount = Number(price.amount)
  if (Number.isNaN(amount)) return null
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: price.currencyCode,
  }).format(amount)
}
