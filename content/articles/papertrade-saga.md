---
title: "Papertrade Saga: The Hype, Lock & Exodus"
deck: "Papertrade was shilled by plenty of big accounts. Its stakers went from earning millions of dollars a day to under $30,000 on October 27, 2026, and they still can't sell PAPER."
date: 2026-11-05
category: defi
author: seb-montgomery
cover:
  src: banner.jpg
  alt: "Papertrade banner reading: $71.0M lost. PAPER still locked."
  position: left
disclosure: "I've traded on Papertrade. I also co-founded validator.com, which runs a Solana validator and earns a commission when people delegate to it. This is information, not investment advice."
---

On October 27, 2026, all 8.98 billion staked PAPER tokens earned their holders **\$29,937** between them, the lowest payout since launch. Twelve days earlier, the same pool paid out \$6.72 million.

Each one of these tokens was minted when someone lost money on Papertrade's 1,000x perpetuals exchange, and plenty of people lost on purpose because they expected to sell PAPER later. On October 19 the team said there are no plans to make the token tradable.

Traders finished **\$44,159** ahead on October 27, which left stakers with nothing but their half of the 2% trading fees. **So farmers are stuck with a token they can't sell, and what it pays depends on how much other traders lose that day.**

## How the PAPER farm worked

Papertrade launched on October 10 on HyperEVM, the smart contract side of Hyperliquid, with up to **1,000x** leverage on Bitcoin and Ether. You don't trade against other people there. Every position settles against a USDC pool the protocol owns, priced off the midpoint of Hyperliquid's order book.

That pool started at zero and only grows when traders lose. PAPER was the consolation prize: losing \$1 minted **100 PAPER** while the pool was small, and the rate fell as it filled, to roughly 11 per dollar by October 19.

There was no team allocation, no investor round and no airdrop. Staking PAPER earns a share of the USDC the exchange sends to stakers, which is why 9.01 billion of the 9.07 billion tokens in existence were staked on October 29.

One wallet pushed **\$10.1 billion** of volume through the exchange, almost all of it on launch day according to AirdropAlert. It lost \$979,000, minted 252 million PAPER, and has since claimed **\$2.14 million** in USDC, more than double what it lost.

Everyone who came after was chasing that trade at a worse rate. Papertrade's October 1 launch plan said PAPER would become transferable at some point, with no date, and that was enough for a lot of people to start losing money on purpose.

## Why won't Papertrade let PAPER trade?

Papertrade says a tradable PAPER would turn an attack on its pool into a profitable trade. Its October 19 post said that "at this juncture we do not have plans to allow off-contract token transferability."

In their example the pool holds \$10 million. Spending \$15 million to push the Bitcoin or Ether price on Hyperliquid would lose money on its own. With a \$10 million PAPER short open on another venue, the attacker comes out ahead.

Paragon had already listed a PAPER perp on October 18, and Aster followed the next day. Both closed theirs after the post, with Paragon settling at **\$0.026**.

The same post changed how new PAPER gets minted: every \$1 million of losses now creates about **0.1%** of the existing supply. The founders wrote that this will slowly dilute older holders in favor of newer ones.

Fees also went up on trades closed within 0.06% to 0.10% of their entry price. The team says that hits bots about 15 times harder than ordinary traders. All of it went live at 22:00 UTC on October 21, during a short scheduled trading halt.

Outside apps can now bring traders in too. Under "builder codes", approved frontends earn 0.5% of the profit or loss on positions their users close, and on a losing trade that slice comes out of what the pool keeps.

The first batch went live on October 25. By the morning of October 29, 58 approved apps had sent 158 traders and \$1.09 billion of volume and earned **\$1,515** between them, and one app made \$1,415 of that. The other 57 made less than \$100 combined.

## Payouts now depend on traders having a bad day

Stakers are paid out of trader losses, so a busy day can still pay almost nothing. On October 21 traders finished **\$313,000** ahead, and stakers split \$88,309, down 95% from the \$1.69 million paid on October 19, the day Papertrade announced the lock.

![Column chart of daily USDC paid to PAPER stakers, October 10 to 28, 2026](staker-payouts.png "Daily USDC paid to PAPER stakers (UTC days): $24.0 million on October 10, a $6.72 million peak on October 15, $1.69 million on October 19, $88,309 on October 21, $1.30 million on October 24 and $29,937 on October 27. Source: Papertrade stats API, read 29 Oct 2026, 09:52 UTC.")

On October 22 Bitcoin dropped 3.3% and traders lost **\$2.38 million**, so the payout grew twelvefold, even though only \$10.3 billion of volume went through, against \$564 billion on launch day. October 27 went the other way: \$10.5 billion of volume, the most of any day under the new rules, and traders still finished ahead, so stakers got the smallest payout since launch.

Across the first seven full days under the new rules, October 22 to 28, the payout went \$1.07 million, \$546,000, \$1.30 million, \$41,000, \$596,000, \$30,000 and \$101,000, while volume stayed between \$5.5 billion and \$10.5 billion a day. From October 25 to 28 it averaged **\$192,000** a day, against \$973,000 from October 22 to 24. A week still isn't enough to tell how much of the drop comes from the rules and how much from the market.

![Two bar charts sharing a date axis: daily volume falling, daily staker payout swinging](volume-and-payouts.png "Daily volume fell from $98.3 billion on October 15 to between $5.5 billion and $10.5 billion a day from October 22 to 28. The staker payout went from $6.72 million to $88,309 on October 21, then swung between $29,937 and $1.30 million over the next seven days. Source: Papertrade stats API, read 29 Oct 2026, 09:52 UTC.")

On October 27, all stakers combined got less than a seventh of the roughly **\$210,000** the launch-day farmer collected by itself on October 15.

For a while Papertrade even out-earned Hyperliquid. DefiLlama has Papertrade at **\$7.49 million** of revenue on October 15, against Hyperliquid's \$3.46 million. On October 27 Hyperliquid made \$1.65 million and Papertrade \$59,871.

## The money is leaving anyway

Papertrade's TVL is down **52%** since the lock, from \$62.3 million at the end of October 19 to \$30.2 million on the morning of October 29. That's \$32.1 million gone in under ten days.

For nine days before that, TVL stayed between \$61.0 million and \$68.7 million, even while payouts swung by millions. Then \$16.4 million left on October 20, the day after the post.

![Line chart of Papertrade TVL from October 10 to 29, 2026](tvl.png "Papertrade TVL at the end of each UTC day: a $104.9 million peak on October 10, between $61.0 million and $68.7 million from October 11 to 19, $45.9 million on October 20, $33.1 million on October 23, $30.6 million on October 28 and $30.2 million at 09:52 UTC on October 29. Source: Papertrade stats API, read 29 Oct 2026, 09:52 UTC.")

The October 22 bounce didn't bring anyone back. TVL fell another \$2.5 million that day and \$6.1 million more on October 23, and it has kept drifting down since.

Revenue had been sliding since its October 15 peak, with payouts already down to \$784,000 on October 17, so it can't tell you much about the lock by itself. TVL held steady for a week and then lost almost half in four days.

Sign-ups jumped on October 24, when Papertrade counted 1,941 new users, more than on any day since October 11. From October 25 to 28 they were back to between 337 and 685 a day.

## Who lost the \$71.0 million

Traders have lost a net **\$71.0 million** on Papertrade across 29,017 accounts, according to Papertrade's own stats, and \$60.9 million of that has gone back out to stakers.

Split evenly it would be about \$2,450 per account, but very few accounts look like that. The 1,000 that hold the most PAPER, about 3% of the total, own **87%** of the token, have claimed 86% of all the USDC paid out and account for 86% of the net losses.

![Three stacked bars comparing the top 1,000 accounts with everyone else](top-1000-accounts.png "The 1,000 accounts holding the most PAPER (3% of 29,017) hold 87% of PAPER, have claimed 86% of the USDC paid to stakers and account for 86% of net trader losses. Source: Papertrade leaderboard and stats API, read 29 Oct 2026, 09:52 to 09:53 UTC.")

The leverage did plenty of damage by itself. In the first week, 5,836 addresses traded at 1,000x and 75.3% of them were liquidated at least once, losing about \$20 million of margin between them, TechFlow reported.

The volume numbers look huge because of the leverage. Papertrade has handled **\$1.50 trillion** of notional volume, which counts the full size of every leveraged position, and traders lost about \$4.73 for every \$100,000 of it.

TokenPost counted about \$335 million deposited by October 19, when notional volume stood at \$1.36 trillion. At 1,000x, \$1,000 of margin opens a \$1 million position, so these totals say more about the leverage than about how much money changed hands.

## Nine of the ten biggest losers are still down

Nine of the ten wallets at the top of Papertrade's leaderboard, which ranks them by trading losses, are still in the red by \$4.33 million combined. Between them, the ten have lost **\$11.55 million** and claimed \$8.38 million back in USDC.

![Horizontal bar chart of the share of trading losses each top-10 loser has claimed back](top-10-losers.png "USDC claimed as a share of trading losses for Papertrade's ten biggest losers on October 29, 2026. Only the launch-day farmer (0x35b2, 219%) is past breakeven; HypeTrader is lowest at 9%. Source: Papertrade leaderboard (all-time, by realized PnL), read 29 Oct 2026, 09:52 UTC.")

The launch-day farmer is the only one in profit, up \$1.16 million after getting the best mint rate there ever was. The biggest single loss belongs to a wallet named stablealt, \$1.71 million, and it has clawed back 88% of that.

HypeTrader is in the worst shape. The wallet was down about \$1.08 million on October 20 and kept trading after the lock. It has now lost \$1.69 million, more than anyone except stablealt, and claimed \$147,000.

In the top 25, 21 wallets are still underwater, by \$9.0 million combined.

## How long does it take to break even on PAPER?

Anywhere from 69 days to 82 years, depending on when you minted and how much other traders lose each day. You can't sell PAPER, so the USDC payout is the only way back to even.

To work it out, divide a day's payout by the PAPER staked, which gives you what one token earned that day, then multiply by the PAPER you minted per dollar. One staked token earned about **\$0.00015** on October 24 and less than **\$0.000004** on October 27.

![Dot chart of days to breakeven at three payout rates, on a log scale](days-to-breakeven.png "Days to earn back a dollar of losses at October 24's payout rate, the average since the lock ($563,713 a day, October 20 to 28) and October 27's rate. At 100 PAPER per dollar: 69, 160 and 3,001 days. At 10 PAPER per dollar: 689, 1,598 and 30,013 days. Source: calculated from the Papertrade stats API (daily payouts and staked PAPER), read 29 Oct 2026, 09:52 UTC.")

If every day paid like October 24, an early farmer on 100 PAPER per dollar would be back to even in **69 days**. At October 27's rate it would take more than eight years. A late farmer on about 10 per dollar needs 1.9 years even at the better rate, and more than four years at the post-lock average.

HypeTrader holds 98.3 million PAPER and is \$1.54 million short of even. At October 24's rate that takes 108 days, and at October 27's it takes almost 13 years.

Bad days for traders mint new PAPER too, though. Supply grew by about **0.5%** on October 22 alone, so each holder got a slightly smaller share of the bigger payout.

The last price anyone paid for PAPER was Paragon's \$0.026 settlement, which values the supply on October 29 at about **\$238 million**. Against that price, October 24's payout works out to a 198% yearly yield and October 27's to 5%. Both assume a price you can't actually sell at.

## Is Papertrade a rug pull?

I don't think so. User funds haven't been drained and stakers are still being paid in real USDC, so the anger is about broken expectations.

The security risk the team describes is real, too. On launch night a trader nudged ETH on Hyperliquid by about 0.12% and netted roughly **\$1.28 million** from the pool, The Block reported. Papertrade says the trader later gave almost all of it back through new accounts.

Papertrade on HyperEVM isn't the best to use, with around 8 transactions a second at peak, and a queue. At that speed it was mostly whales who got in, and before launch the team itself warned of long waits "especially for smaller notional trades". On Solana, thousands of traders could have come in at once with big and small amounts, and PAPER would have spread far wider than the top wallets.

But crypto is about experimentation, and a product survives or fails on the operator's skill and on how they look after their community.

Locking PAPER for security reasons was a fair call, and the dilution change makes sense too, because PAPER needs fresh blood to keep paying. Bundled together, though, they hit the people who filled the pool in the first place. And in the end, fresh blood is just exit liquidity.

## What Papertrade got right and wrong

The fair launch and the USDC payouts worked, and most of what went wrong traces back to what the team promised.

**What it got right**

- A fair launch with no team allocation, investors or airdrop, and **\$60.9 million** in USDC paid back to stakers by October 29.

- Paying stakers in USDC instead of more PAPER, so the payout keeps its value while the token is locked.

- Keeping PAPER off outside markets. It's not right for the people holding PAPER, but it's right for the protocol, because it protects the pool from price attacks.

**What it got wrong**

- Transfers went on the roadmap before the team knew it could ship them, and farmers priced them in.

- The rules changed for people who had already played, nine days after launch.

- The mint curve rewarded speed so heavily that the top 1,000 accounts ended up with 87% of all PAPER.

- HyperEVM was the wrong chain for this. The team are EVM developers, so I understand sticking with an EVM, but they ran it so the chain only ever used about half its gas, to keep fees from spiking, and I think they should have taken 95%.

- Nobody planned for PAPER perps. Co-founder Jez told Bankless he underestimated the demand for pre-market perps.

## If you farm the next loss-to-mint token

Cardboard on Solana already works the same way, minting 100 tokens per dollar of losses according to Bankless, and those can't be moved until transfers are switched on either.

- Treat "transferable later" as "maybe never", and only farm an amount you could live with if the token never trades.

- Work out the breakeven on a bad day as well as a good one: tokens minted per dollar, times what one token earns per day.

- Read the mint rules for dilution. If new losses mint new tokens, your share shrinks every time someone else loses.

- Get in early or skip it. Of the ten wallets that have lost the most on Papertrade, the only one in profit farmed on launch day, at the best mint rate there ever was.

- If you already hold PAPER, leave it staked and collect the USDC. Trading more just to mint more PAPER only adds to what you've lost.

## My verdict on Papertrade

All in all, Papertrade generated hype and got people talking, but what it built couldn't last. It could have been modeled a lot better.

The biggest letdown for me was the chain. A high-throughput chain like Solana would have let far more traders farm at once. Failing that, a lower starting mint rate, around 50 PAPER per dollar instead of 100, and 95% of HyperEVM's block space would have spread PAPER much more evenly.

Meanwhile, the team has cooked quite well. Its half of the 2% fees came to **\$5.1 million** in the 19 days from October 10 to 28, according to DefiLlama.

**Sources:** Papertrade, "A note on transferability" (X, 19 Oct 2026) · Papertrade, launch timing and details (X, 10 Oct 2026) · Papertrade stats, leaderboard and builders API · Papertrade docs (contract set 2, builder codes, staking) · DefiLlama (Papertrade revenue and dev fees, Hyperliquid revenue) · CoinGecko (BTC price) · HyperEVM RPC (PAPER supply, upgrade transaction) · AirdropAlert · TokenPost · TechFlow · Bankless · The Block · Paragon (X) · Seb Monty (X, 17 Oct 2026). Figures checked 29 Oct 2026, 09:52 to 10:15 UTC.

## Sources

- [Papertrade: "A note on transferability" (X, 19 Oct 2026)](https://x.com/papertrade_xyz/status/2112310325521399982)

- [Papertrade: launch timing and details (X, 10 Oct 2026)](https://x.com/papertrade_xyz/status/2108852108766437759)

- [Papertrade: trading halt notice for 22:00 UTC, 21 Oct (X)](https://x.com/papertrade_xyz/status/2112984178988069356)

- [Papertrade: exchange stats](https://exchange.papertrade.xyz/stats)

- [Papertrade: leaderboard (accounts, all time)](https://exchange.papertrade.xyz/leaderboard?mode=accounts&window=all)

- [Papertrade docs: protocol changes (contract set 2)](https://docs.papertrade.xyz/dev/protocol-changes/)

- [Papertrade docs: builder codes](https://docs.papertrade.xyz/how/builder-codes/)

- [Papertrade docs: staking dividends (how the 2% fee is split)](https://docs.papertrade.xyz/learn/staking-dividends/)

- [Papertrade: builders (approved apps, users, volume, fees)](https://exchange.papertrade.xyz/builders)

- [Papertrade: first batch of builder codes in the timelock (X, 24 Oct 2026)](https://x.com/papertrade_xyz/status/2114011969032507790)

- [DefiLlama: Papertrade revenue, dev fees, holders revenue and TVL](https://defillama.com/protocol/papertrade)

- [DefiLlama: Hyperliquid revenue](https://defillama.com/protocol/hyperliquid)

- [CoinGecko: Bitcoin price history](https://www.coingecko.com/en/coins/bitcoin)

- [AirdropAlert: PAPER goes live on Hyperliquid](https://airdropalert.com/blogs/paper-hyperliquid/)

- [TokenPost: Papertrade distributed \$54.1M to stakers as traders lost \$63.2M](https://www.tokenpost.com/news/investing/35550)

- [TechFlow: Why did Papertrade backfire on you?](https://www.techflowpost.com/en-US/article/34664)

- [Bankless: Why Papertrade won't let PAPER trade](https://www.bankless.com/read/why-papertrade-wont-let-paper-trade)

- [The Block: Trader nets \$1.28 million on new 1,000x exchange Papertrade by moving Hyperliquid's ETH prices](https://www.theblock.co/news/defi/2026-10-11-trader-nets-1-28-million-on-new-1000x-exchange-papertrade-by-moving-hyperliquids-eth-prices-418239)

- [Paragon: para:PAPER halted and settled (X)](https://x.com/tradeparagon/status/2112311821411721596)

- [Seb Monty: my October 17 post on Papertrade (X)](https://x.com/SebMontgomery/status/2111374910614585660)
