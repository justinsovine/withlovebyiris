# With Love by Iris: product and business spec

The canonical local record of what this store sells and why. Derived from the
panel research in `docs/research/panel-2026-09-10/` (six expert memos, a critic
pass, two adversarial reviewers, the panel's rebuttal, delivery coaching, three
buyer walkthroughs, and three market research memos). Published synthesis:
https://claude.ai/code/artifact/cfb4272f-7528-4a88-836f-600e9afb5661

When this file and a research memo disagree, this file wins. When this file and
the code disagree, fix one of them in the same commit.

## Brand

- **With Love by Iris** is the house brand and the site.
- **Wholesome Living** is the bath and body line name only. Her printed labels
  already say "Wholesome Living, by ir!s".
- The wordmark is plain **Iris** set in the label serif. Drop the `ir!s`
  stylization everywhere on the site.
- Owner: Iris McLaren, Bethel, Ohio (Clermont County). Full-time caregiver for
  her husband. Sells at craft fairs and church bazaars.
- Positioning: handmade in Bethel, Ohio, with scripture and love. Comfort for
  your body, your home, and your memories.
- Scripture is a deliberate, visible thread, not something to soften.

## Priority order

The market data put her uncontested lane first. Everything about navigation,
the homepage, and the booth table follows this order.

1. **Memory keepsakes** (bears, memory pillows, memory quilts). Zero local
   competitors. The only product with real margin.
2. **Men's and tallow balms.** No local men's line exists. Tallow is the
   fastest-rising adjacent trend.
3. **Shampoo bars.** The repeat-purchase engine, not the headline. Crowded.
4. **Candles.** A gift add-on. Overdone generally, thinnest margin (36%).
   Three verses, no hero placement.

Never start bar soap. It is the most crowded category at every fair.

## Catalog: 12 sellable SKUs

A hard cap. A new SKU requires a retired one plus 90 days of sales data.

| SKU | Price | Notes |
|---|---|---|
| Shampoo bar (4 scents as variants) | $12, 3 for $32 | Scents chosen by her fair sales |
| Seasonal shampoo scent | $12 | Rotating slot; Rose of Sharon takes the first |
| Strong & Steadfast beard balm | $18 | Sandalwood, 1 Cor 16:13 |
| The Noble Man beard balm | $18 | Frankincense, Prov 20:7 |
| Whipped tallow balm | $22 to $28 | 4 oz, unscented plus one light scent. New. |
| Scripture candle (3 verses as variants) | $22 to $24 | 100% beeswax, unscented |
| Paw-Fection two-pack | $18 | Single tubes at the booth only, $12 each |
| Memory pillow | $60 | From the leftover shirt. New. |

Inquiry-only, outside the SKU count: **memory bears** ($195, 50% deposit, one
per month) and **memory quilts** ($200 to $600). Baby quilts with birth details
are the entry product at $200 and up, two patterns only.

Cut from v1: lip gloss, clay mask, facial scrub, muscle balm, samplers, gift
sets, character bears as catalog items, the Find Me At page.

## Categories

Four, in priority order. `For Him` is a tag and a landing page, never a category.

```
Keepsakes          memory bears, memory pillows, memory quilts, baby quilts
Bath & Body        shampoo bars, beard balms, tallow balm  (the Wholesome Living line)
Candles            scripture beeswax candles
Gifts              paw balm two-pack, bundles later
```

## Pricing rules

- Retail is at least 4x materials. Wholesale is 2x. The catalog rejects
  anything under. "I'll take the loss" is a veto trigger.
- Paw-Fection is $12 at the booth and $6 wholesale to the vet at a 12-unit
  prepaid minimum. Never sold online as a single tube.
- Memory bears are $195 flat. Raise toward the specialist band once there is a
  waiting list. Never discount.
- Free shipping at $45. Flat rate $6. Local pickup in Bethel is free.

## Channels

In: the site, six fairs a year that clear $500 gross and $30/hr after
materials, Facebook, funeral home and hospice brochures, the vet on prepaid
wholesale.

Out for year one: Etsy, all consignment, paid ads, Facebook Shop, TikTok,
Instagram, Faire.

## Operating rules Justin enforces through the site

1. A product gets a page only with the watercolor botanical label and a
   complete legal label.
2. A listing goes live only with a cream or linen, window-lit hero and one
   detail shot. No workbench photos in the catalog.
3. Twelve sellable SKUs. One in, one out, plus 90 days of data.
4. Retail 4x materials, wholesale 2x. Enforced in the catalog.
5. Custom sewing shows only curated examples and sells only through the
   inquiry form with a 50% deposit.
6. One memory bear per month. The form closes when the month is booked.
7. Supplies come from the business account only, and only if $600 remains.
8. Quarterly: under 10 units in 90 days, or a fair under $30/hr after
   materials, is retired.

### The making-to-selling gate

She goes from idea to Facebook "for sale" post in about a week. Three stages,
one week minimum each, nothing skips:

1. **Workbench.** Make it, use it a week, put it on the Workbench page. Process
   posts are fine. No price, no "message me to buy".
2. **Trial.** 30 days, 10 units, full legal label, booth and friends only. No
   site listing, no "now available" post.
3. **Catalog.** Ten units sold in 30 days at 4x materials, legal label,
   window-light photos, and a retired slot if the twelve are full.

### Capital

One fixed monthly transfer funds supplies. Workbench idea cap $40, trial batch
cap $100, restocks from revenue only. The household disability income never
buys inventory directly.

### Audience

The Facebook Page lives in a Meta Business Manager Justin owns, with Iris as an
editor, never sole admin. She deletes her personal profile roughly once a year,
so nothing may depend on it. The email list is the durable asset. Three of every
four posts are about catalog products, never the newest idea.

### Hours

She works about 20 hours a week by choice. Target split: 8 core making, 3
bears, 3 packing, 2 content, 1 admin, 3 free Workbench play. Any week can drop
to zero for caregiving, so the plan must also work at 10.

## Site v1 scope

Build, in order:

1. Catalog and the shampoo bar page with scent variants, net weight in ounces,
   and a one-line "smells like" note on every product.
2. Guest checkout with Stripe wallets. USPS flat rate is the default for any
   non-Bethel address; pickup is a toggle above the Apple Pay button and
   carries real instructions ("I text you when it's ready, usually 2 days").
   The gift-note field shows for pickup orders too.
3. Homepage: one finished bear with a line of its story and a "Start a bear"
   button, "Handmade in Bethel, Ohio" as the headline, balms as the second
   block, and "Wholesome Living is my bath and body line" where bath goods
   begin.
4. Memory bear inquiry form with a live booking line ("Next open slot:
   [month]. For Christmas, clothing must reach me by November 1. I reply within
   2 days.") and mailing instructions, then a Medusa draft order for the 50%
   deposit and a second for the balance after the approval photo.
5. Three transactional emails in her voice (confirmation, shipped or ready for
   pickup, day-14 review ask) plus a day-55 one-tap reorder reminder prefilled
   with the last scent.
6. The From the Workbench page (no cart, no prices), then the quarterly numbers
   pull.

Deferred: bundles, subscriptions, required accounts, the `/booth` promo route,
Facebook Shop, a scent quiz, wishlist, chat, blog.

## Before the first shipped order

- Product liability insurance, Ohio county vendor's license plus the state
  transient license, EIN, separate business checking, Stripe under the EIN. The
  LLC once revenue is real. About $700 total.
- Labels: identity statement, net weight in oz and grams, full INCI ingredient
  list, business name and address, an adverse-event contact. No drug claims.
  ASTM F2058 caution text on candle tins. Dated tallow tubes. Lot codes on every
  batch.
- Photos: one window-lit session per product family.

## Open questions

- **Ship-from and tax origin: Bethel or Cincinnati?** The seed currently uses
  Hamilton County at 7.8%. Her own disclaimer says she lives in Bethel, which is
  Clermont County at roughly 6.75%. Ohio is origin-sourced, so this decides the
  rate on every in-state order. Verify on Ohio's The Finder before launch.
- Does she make bar soap? If so, does it take one of the twelve slots? The
  market answer is no.
- Which four shampoo scents launch? Her fair sales decide.
- How do her 20 hours actually split today? Log four weeks before trusting the
  target split.
