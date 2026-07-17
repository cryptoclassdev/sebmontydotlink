import type { ArticleGalleryImage } from '@/lib/blog/article-content'
import type { PortableTextBlock } from '@/sanity/types'

type EditorialOverride = {
  updatedAt: string
  imageOverrides: Record<string, ArticleGalleryImage>
  textOverrides: Record<string, string[]>
  linkOverrides?: Record<string, string>
  blockOverrides?: Record<string, PortableTextBlock | null>
}

const robostrategyJuly17: EditorialOverride = {
  updatedAt: '2026-07-17T00:00:00.000Z',
  imageOverrides: {},
  textOverrides: {
    kc81e728d9d: ['Figures as of July 17, 2026. They expire fast. Check before you act.'],
    k26657d5ff9: ['To be transparent, Kang has gotten plenty wrong too. He has been liquidated on eight-figure leveraged bets, and his 2024 short on the Ethereum ETF was a public, drawn-out miss. Back in June 2025 he predicted that treasury-strategy companies, the kind that hold an asset and trade above its worth, would slide to discounts within a year. That is close to the exact risk his own fund now carries at about 2.8x book. Buying BOT means betting his robot calls keep landing the way Figure did, not the way his ETH short did.'],
    k73278a4a86: ['Paying $2.78 for $1 of assets sounds insane. Sometimes it is. Sometimes it is how the best business development companies grew.'],
    k2b44928ae1: ['The stock closed at $29.25 on July 16 against that $10.51 NAV. You are paying 2.78x the fund’s own accounting of its assets, a 178 percent premium. But this is deal flow that you cannot get. That looks irrational until you see the mechanism.'],
    keb160de1de: ['When a fund trades above its book value, it can issue new shares at that premium and buy more assets with the proceeds. At the current market multiple, a hypothetical share sold at 2.78x NAV brings in about $2.78 of cash for $1 of book dilution, which lifts NAV per share for the holders already in. This is old machinery. Main Street Capital, a business development company built on the same 1940-era fund rules as RoboStrategy, has run it for years: it trades at a steady premium to book, lately around 1.5x, and sells new shares above book through a standing program, so its NAV per share climbs on the share sales themselves, on top of whatever its investments earn.'],
    k1afa34a7f9: ['The price: ', '$29.25 at the July 16 close against a $10.51 NAV the fund marks itself. You pay 2.78x book, a 178 percent premium, down from around 4x in late June.'],
    ka8baa56554: ['The clean short argument is 3 sentences. The NAV is self-assessed on illiquid private holdings, so the $248.9 million is the fund’s own mark with no market check behind it. The stock closed at about 2.78x that mark on July 16, so the companies have to keep compounding just to grow into the price you already paid. And a $2 billion issuance facility sitting behind a sub-billion market cap means dilution is built into the model.'],
    k7ef605fc8d: ['The overhang is not hypothetical, and it is what just moved the stock. On July 6, 2026 the fund filed to register the resale of up to 3.84 million PIPE shares, stock sold privately to institutions weeks earlier at $25 to $36 (PIPE stands for private investment in public equity), with no lock-up in the way. A resale of that size landing on a name at roughly 3x book is exactly the setup this whole section warns about. Over the next two sessions BOT fell about 10 percent, from $35.63 to a $31.91 close on July 7 and an intraday low near $30.66. By July 16 it had closed at $29.25, reducing the price-to-NAV multiple to 2.78x. It still had not broken the $19.20 all-time low, but it was the clearest live example yet of the premium deflating.'],
    kbd4c9ab730: ['The token trades under the plain symbol BOT. On July 17, 2026 it was around $27.91 on its largest pool, tracking the Nasdaq stock within a few percent. Around $216,000 of liquidity sat across the observed Raydium and Meteora pools at the time of this update, though both price and liquidity move constantly.'],
    k045117b0e0: ['The token lives in active, permissionless AMM pools. On July 17, 2026 the largest Raydium pool held about $184,000 of liquidity, while the observed Meteora pools held about $32,000 combined. Aggregate 24-hour volume across those pools was about $437,000 at the time of the update. You can route into these through Jupiter like any Solana token.'],
    k757b505cfd: ['The token: ', 'real BOT shares held one for one by regulated broker-dealers, tradable around the clock on Raydium, Meteora, and Jupiter at about $28 when checked on July 17.'],
    k69adc1e107: ['LP reality: ', 'about $216,000 of observed pool liquidity on July 17, income is swap fees only, and divergence can arrive as an overnight jump.'],
    k289dff0766: ['You pay about 2.78x a self-marked NAV, a 178 percent premium. ', 'Most of the portfolio is priced by the fund itself, with no market check.'],
    k3cec07e9ba: ['Short answer: yes, but as a small, high-variance bet you hold for years, not a position you size like a conviction buy. The upside is real. The entry price means it can round-trip you first, and the July slide below $30 was a small taste.'],
    k19f3cd308f: ['The case against is price. Even after the July slide, roughly 2.8x a self-marked NAV is a lot of forward performance to buy up front. The flywheel runs only while the market keeps believing, and DXYZ showed how fast belief can crack.'],
    k8c19f571e2: ['Figures are as of July 17, 2026 and they expire. NAV of $10.51 and net assets of $248.9 million are the fund’s latest published unaudited mark, dated June 30, 2026. BOT closed at $29.25 on July 16, equal to 2.78x NAV or a 178 percent premium. The $19.20 all-time low, set May 13, 2026, remained intact. On July 17, the Backpack Securities token was around $27.91 on its largest pool, with about $216,000 of observed liquidity across Raydium and Meteora. On-chain price, pool depth, and token supply move constantly. Verify the Backpack mint address before you buy, confirm current pool liquidity on DexScreener, and check your own jurisdiction. This is research, not financial advice.'],
    k918317b579: ['Nasdaq: BOT market data'],
    k4734ba6f3d: ['RoboStrategy: NAV update to $10.51 per share, Jun 30 2026'],
    ke369853df7: ["What we'll cover:"],
    ka1d0c6e83f: ['how the Solana version works'],
  },
  linkOverrides: {
    k918317b579: 'https://www.nasdaq.com/market-activity/stocks/bot',
    k4734ba6f3d: 'https://www.globenewswire.com/news-release/2026/07/08/3324072/0/en/robostrategy-inc-announces-updated-net-asset-value-and-additional-private-placements.html',
  },
  blockOverrides: {
    kb53b3a3d6a: {
      _key: 'kb53b3a3d6a',
      _type: 'sourceQuote',
      eyebrow: 'Quoted directly from the prospectus',
      quote: 'Investing in our common stock involves a high degree of risk and is highly speculative.',
      sourceTitle: 'RoboStrategy, Inc. prospectus (Form 424B3)',
      sourceDetail: 'Filed with the SEC on May 5, 2026',
      sourceUrl: 'https://www.sec.gov/Archives/edgar/data/2081119/000121390026052329/ea0287946-02_424b3.htm',
    },
    k072b030ba1: null,
    k1679091c5a: null,
    k6512bd43d9: null,
    keccbc87e4b: {
      _key: 'keccbc87e4b',
      _type: 'metricGrid',
      eyebrow: 'Market snapshot',
      title: 'BOT at a glance',
      dateLabel: 'Figures checked July 17, 2026',
      dateTime: '2026-07-17',
      metrics: [
        { _key: 'nav', label: 'NAV / share', value: '$10.51', detail: 'Latest unaudited NAV · Jun 30', tone: 'gauge' },
        { _key: 'price', label: 'Share price', value: '$29.25', detail: 'Nasdaq close · Jul 16', tone: 'sebring' },
        { _key: 'premium', label: 'Premium to NAV', value: '+178%', detail: 'Share price is 2.78× NAV', tone: 'neutral' },
        { _key: 'low', label: 'All-time low', value: '$19.20', detail: 'May 13 · third trading session', tone: 'neutral' },
      ],
      caption: 'Share price uses the July 16 Nasdaq close; NAV is the fund’s latest published unaudited mark as of June 30.',
      ariaLabel: 'RoboStrategy market snapshot checked July 17, 2026. NAV per share 10 dollars 51 cents. Share price 29 dollars 25 cents at the July 16 Nasdaq close. Premium to NAV 178 percent, or 2.78 times NAV. All-time low 19 dollars 20 cents.',
    },
    kf457c545a9: {
      _key: 'kf457c545a9',
      _type: 'stackedBar',
      eyebrow: 'Portfolio weights',
      title: 'Where the fund was concentrated',
      dateLabel: 'June 22, 2026',
      dateTime: '2026-06-22',
      highlight: {
        value: '38.8%',
        label: 'held in Figure AI and Dyna',
      },
      segments: [
        { _key: 'figure-ai', name: 'Figure AI', value: 19.4, displayValue: '19.4%', tone: 'gauge' },
        { _key: 'dyna', name: 'Dyna', value: 19.4, displayValue: '19.4%', tone: 'sebring' },
        { _key: 'apptronik', name: 'Apptronik', value: 10.2, displayValue: '10.2%', tone: 'redline' },
        { _key: 'dexmate', name: 'Dexmate', value: 6, displayValue: '~6%', tone: 'infield' },
        { _key: 'smaller-names', name: 'Smaller names', value: 45, displayValue: '~45%', tone: 'pitlane' },
      ],
      caption: 'Portfolio weights as reported on June 22, 2026. Figures are approximate.',
      ariaLabel: 'Portfolio weights on June 22, 2026. Figure AI 19.4 percent. Dyna 19.4 percent. Apptronik 10.2 percent. Dexmate about 6 percent. Smaller names about 45 percent.',
    },
    k37693cfc74: {
      _key: 'k37693cfc74',
      _type: 'youtube',
      url: 'https://www.youtube.com/watch?v=99pOdGEGu6s',
      title: 'Brett Adcock - Shawn Ryan’s First Interview with a Robot | SRS #292',
      caption: 'Brett Adcock demonstrates Figure 03 live in the studio on the Shawn Ryan Show, March 30, 2026.',
    },
    k7f39f8317f: {
      _key: 'k7f39f8317f',
      _type: 'premiumChart',
      eyebrow: 'Exhibit 1 · The premium',
      source: 'Sources: RoboStrategy NAV update, Jun 30 2026 · Nasdaq close, Jul 16 2026',
      title: 'Of the $29.25 you pay, $10.51 is book. The rest is the bet.',
      sharePrice: { label: 'Share price', value: 29.25, displayValue: '$29.25' },
      bookValue: { label: 'NAV', value: 10.51, displayValue: '$10.51' },
      premium: { label: 'Premium', value: 18.74, displayValue: '$18.74' },
      multipleLabel: '2.78× book',
      navHistory: [
        { label: 'NAV per share', dateLabel: 'May 31', value: 7.24, displayValue: '$7.24', tone: 'pitlane' },
        { label: 'NAV per share', dateLabel: 'Jun 30', value: 10.51, displayValue: '$10.51', tone: 'sebring' },
      ],
      axisTicks: [0, 10, 20, 30, 40],
      caption: 'The July 16 Nasdaq close was 2.78× the fund’s June 30 NAV per share. The premium is the market’s bet that the private holdings keep compounding.',
      ariaLabel: 'Premium-to-NAV exhibit checked July 17, 2026. RoboStrategy shares closed at 29 dollars 25 cents on July 16. The fund reported NAV of 10 dollars 51 cents per share on June 30, leaving an 18 dollar 74 cent premium, or 2.78 times book value.',
    },
    k6974ce5ac6: {
      _key: 'k6974ce5ac6',
      _type: 'valuationGrowth',
      eyebrow: 'Portfolio companies · repricing',
      title: 'Figure was marked 15× higher in 19 months. Private markets can move fast.',
      source: 'Sources: company funding announcements · reported private rounds',
      caption: 'Figure AI moved from a $2.6B valuation in February 2024 to $39B. Apptronik was reported near $5B after its 2026 round. Standard Bots’ $1B Series C was led by RoboStrategy.',
      maxValue: 40,
      rows: [
        { name: 'Figure AI', earlierValue: 2.6, earlierLabel: '$2.6B · Feb 2024', latestValue: 39, latestLabel: '$39B', note: '15× since Feb 2024' },
        { name: 'Apptronik', earlierValue: 1.6, earlierLabel: '$1.6B · Feb 2025', latestValue: 5, latestLabel: '≈$5B', note: '≈3× since Feb 2025' },
        { name: 'Standard Bots', latestValue: 1, latestLabel: '$1B', note: 'New Series C · Jun 2026' },
      ],
      ariaLabel: 'Private robotics company valuation comparison. Figure AI moved from 2.6 billion dollars in February 2024 to 39 billion dollars. Apptronik moved from about 1.6 billion dollars in February 2025 to about 5 billion dollars. Standard Bots reached a 1 billion dollar Series C in June 2026.',
    },
    k013d407166: {
      _key: 'k013d407166',
      _type: 'priceTimeline',
      eyebrow: 'Exhibit 2 · The price path',
      title: 'The price swung wildly. It never traded near its own NAV.',
      source: 'Sources: Nasdaq historical prices · RoboStrategy NAV updates',
      sourceUrl: 'https://www.nasdaq.com/market-activity/stocks/bot',
      priceLabel: 'BOT share price',
      navLabel: 'NAV per share',
      maxValue: 60,
      price: [
        { position: 0, value: 59, date: 'May 11', label: '$59.00 debut' },
        { position: .03, value: 19.2, date: 'May 13', label: '$19.20 low', accent: 'low' },
        { position: .48, value: 41.74, date: 'Jun 8', label: '$41.74' },
        { position: .66, value: 26.26, date: 'Jun 24', label: '$26.26' },
        { position: .86, value: 39.75, date: 'Jul 2', label: '$39.75' },
        { position: 1, value: 29.25, date: 'Jul 16', label: '$29.25 close' },
      ],
      nav: [
        { position: .35, value: 7.24, date: 'May 31' },
        { position: .7, value: 10.51, date: 'Jun 30' },
        { position: 1, value: 10.51, date: 'Jul 16', label: 'NAV $10.51' },
      ],
      caption: 'The share price travelled from a $59 debut high to a $19.20 all-time low, then closed at $29.25 on July 16. The June 30 NAV remained $10.51 per share throughout the latest stretch.',
      ariaLabel: 'BOT share price and NAV timeline. Share price began at 59 dollars on May 11, reached a 19 dollar 20 cent low on May 13, and closed at 29 dollars 25 cents on July 16. The latest NAV was 10 dollars 51 cents per share.',
    },
    k47d1e99058: {
      _key: 'k47d1e99058',
      _type: 'priceTimeline',
      eyebrow: 'Exhibit 3 · The precedent',
      title: 'DXYZ ran to 20× book, then collapsed 93 percent in eight weeks.',
      source: 'Sources: Nasdaq historical prices · Destiny Tech100 reported NAV',
      sourceUrl: 'https://www.nasdaq.com/market-activity/stocks/dxyz',
      priceLabel: 'DXYZ share price',
      navLabel: 'Last-reported NAV',
      maxValue: 110,
      price: [
        { position: 0, value: 105, date: 'Apr 8', label: '$105.00 printed' },
        { position: .15, value: 43.5, date: 'Apr 16', label: '$43.50' },
        { position: .39, value: 17.49, date: 'Apr 30', label: '$17.49' },
        { position: 1, value: 7.75, date: 'Jun 3', label: '$7.75 low', accent: 'low' },
      ],
      nav: [
        { position: 0, value: 4.84, date: 'Apr 8', label: 'NAV $4.84' },
        { position: 1, value: 4.84, date: 'Jun 3' },
      ],
      caption: 'DXYZ printed $105.00 against a $4.84 last-reported NAV on April 8, 2024. Within eight weeks it fell to $7.75. The warning is the speed at which a premium can unwind.',
      ariaLabel: 'DXYZ precedent timeline. The share price printed at 105 dollars on April 8, 2024 against a 4 dollar 84 cent NAV and fell to 7 dollars 75 cents by June 3.',
    },
    ka8f15eda80: {
      _key: 'ka8f15eda80',
      _type: 'statStrip',
      eyebrow: 'Short interest · PIPE overhang',
      title: 'Positioning changed before the resale registration.',
      dateLabel: 'June 15–July 6, 2026',
      metrics: [
        { label: 'Shares sold short', value: '762,086', detail: 'Reported as of Jun 15', tone: 'ink' },
        { label: 'Short-interest jump', value: '+166%', detail: 'May 31 to Jun 15', tone: 'marigold' },
        { label: 'Resale registered', value: '3.84M', detail: 'PIPE shares · Jul 6', tone: 'redline' },
      ],
      caption: 'Short-interest figures are historical filings. The resale registration covered shares previously sold privately at $25 to $36, with no lock-up in the way.',
      ariaLabel: 'Short interest and PIPE overhang. 762,086 shares were sold short as of June 15, up 166 percent from May 31. Up to 3.84 million PIPE shares were registered for resale on July 6.',
    },
    kfa7cdfad1a: {
      _key: 'kfa7cdfad1a',
      _type: 'tokenComparison',
      eyebrow: 'On-chain listing · side by side',
      title: 'BOT is the actively traded token. BOTon is a different, cash-settled product.',
      dateLabel: 'Observed July 17, 2026',
      primary: {
        name: 'BOT',
        issuer: 'RoboStrategy · Backpack Securities',
        status: '1:1-backed share token',
        metrics: [
          { label: 'Observed price', value: '$27.91', tone: 'gauge' },
          { label: 'Observed 24h volume', value: '$437k', tone: 'marigold' },
          { label: 'Observed liquidity', value: '$216k', tone: 'gauge' },
          { label: 'Market access', value: 'Raydium · Meteora' },
        ],
      },
      comparison: {
        name: 'BOTon',
        issuer: 'RoboStrategy · Ondo',
        status: 'Cash-settled · non-US',
        metrics: [
          { label: 'DEX market', value: '—' },
          { label: 'DEX volume', value: '—', tone: 'redline' },
          { label: 'DEX liquidity', value: '—' },
          { label: 'Settlement', value: 'Mint and redeem only' },
        ],
      },
      caption: 'Observed BOT pool price, liquidity, and volume are volatile. BOTon is not the same market: it is cash-settled and does not have an observed DEX trading pool.',
      ariaLabel: 'Token comparison checked July 17, 2026. BOT was observed around 27 dollars 91 cents with 437 thousand dollars of 24-hour volume and 216 thousand dollars of observed liquidity. BOTon has no observed DEX market, volume, or liquidity.',
    },
    k33e75ff09d: null,
  },
}

const overridesBySlug: Record<string, EditorialOverride> = {
  'robostrategy-bot-solana': robostrategyJuly17,
}

export function getArticleEditorialOverride(slug: string) {
  return overridesBySlug[slug]
}

export function applyArticleEditorialOverride(slug: string, body: PortableTextBlock[]) {
  const override = getArticleEditorialOverride(slug)
  if (!override) return body

  return body.map((block) => {
    if (override.blockOverrides && Object.prototype.hasOwnProperty.call(override.blockOverrides, block._key)) {
      return override.blockOverrides[block._key]
    }

    const replacementText = override.textOverrides[block._key]
    const replacementLink = override.linkOverrides?.[block._key]
    const imageOverride = override.imageOverrides[block._key]
    let nextBlock = block

    if (replacementText && block.children) {
      nextBlock = {
        ...nextBlock,
        children: block.children.map((child, index) => ({
          ...child,
          text: replacementText[index] ?? child.text,
        })),
      }
    }

    if (replacementLink && block.markDefs) {
      nextBlock = {
        ...nextBlock,
        markDefs: block.markDefs.map((mark) => mark._type === 'link' ? { ...mark, href: replacementLink } : mark),
      }
    }

    if (imageOverride) nextBlock = { ...nextBlock, caption: imageOverride.caption }
    return nextBlock
  }).filter((block): block is PortableTextBlock => block !== null)
}
