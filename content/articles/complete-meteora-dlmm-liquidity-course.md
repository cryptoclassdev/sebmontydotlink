---
title: "How to LP on Meteora: A Practical DLMM Guide"
deck: A decision-by-decision guide to finding a real pool, checking the token, setting a range, and measuring fees against the risk you actually took.
excerpt: A practical workflow for choosing a Meteora DLMM pool, checking the token, setting a range, and measuring fees against risk.
date: 2026-07-21T12:00:00Z
category: solana
author: seb-montgomery
cover:
  src: /images/meteora-lp/02-2-top-performers-filters.png
  alt: Meteora's Top Performers page sorted by fees earned against active TVL over a two-hour window.
  caption: Top Performers is where the search starts. It is not where the decision ends.
readTime: 11
---

Meteora can show fee numbers that look almost impossible. Some are real. Some come from a tiny pool, a brief burst of volume, or a token collapsing underneath the LPs who are collecting those fees.

That is the central lesson of DLMM: **fees are income, not profit**. Your result depends on what the position is worth after price moves, what assets you now hold, the fees you collected, and what it cost to enter and exit.

This guide gives you a repeatable workflow for making those decisions. It is written for a first or early Meteora position, not for launching a token or building an automated market-making system. None of it is a promise of profit or financial advice. Start small enough that a complete loss would be tuition, not trauma.

If you are ready to follow along, [open Meteora with my referral link](https://app.meteora.ag/ref/SEBMONTY). This guide contains referral links; I may earn rewards if you use them, at no extra cost to you.

## The workflow in 60 seconds

1. **Shortlist a DLMM pool** with real TVL and sustained two-sided volume.
2. **Verify the token** by contract address, holders, liquidity, and recent price action.
3. **Compare the available pools** by fee tier, bin step, depth, and where fees are paid.
4. **Choose a liquidity shape** that matches what you want to happen as price moves.
5. **Set a range you can explain** and size the position for the worst plausible outcome.
6. **Manage the position by net P\&L**, not by the fee counter alone.

If any step is unclear, do not deposit yet. High fees do not repair a weak thesis.

Want AI help applying the checklist? Load my free [Meteora LP Skill File](https://github.com/sebmonty/skills/tree/main/meteora-lp-sebmonty) into Claude or Codex. It asks about your capital and risk first, then works through the same mechanics, strategy choices, and risk checks. You still need to verify the live pool and transaction yourself.

## First: understand what the position does

A Meteora DLMM pool divides price into discrete buckets called **bins**. You choose a set of bins and decide how to distribute liquidity across them. There is one active bin at the current pool price. As trades consume liquidity, price moves through the bins.

While price trades inside your selected range, your active liquidity can earn fees. If price leaves the range, the position stops earning until price returns or you change the position.

![A Meteora position with minimum and maximum price lines around the active range.](/images/meteora-lp/03-2-range-buy-sell-mechanics.png "Inside the range, trades change your asset mix and can generate fees. Outside it, the position is inactive and holds one side of the pair.")

The asset mix changes too. A move through the top of the range can leave you holding mostly the quote asset, such as SOL or USDC. A move through the bottom can leave you holding mostly the token that fell. That conversion is not a side effect. It is the position doing exactly what you instructed it to do.

Measure the full result like this: **current position value + claimed fees + unclaimed fees − deposits − transaction and swap costs**. The fee percentage on its own is never the answer.

## Step 1: shortlist a pool with real activity

Open the [Meteora app through my referral link](https://app.meteora.ag/ref/SEBMONTY) and use Discover or Top Performers. Filter for **DLMM** when you are looking for the bin-based strategies covered here. DAMM v2 is a different product.

Choose a recent timeframe and sort by **Fees/Active TVL**. This shows fees relative to the capital currently sitting where trades can reach it. It is useful for finding activity, but it is easy to misread.

A nearly empty pool can produce an enormous percentage from a handful of trades. Set a minimum TVL filter to remove obvious noise. A $1,000 floor is a useful first pass for discovery, not a declaration that the pool is safe.

![Meteora's filter panel with a minimum TVL of one thousand dollars.](/images/meteora-lp/02-3-min-tvl-filter-preset.png "Use a TVL floor to remove near-empty pools, then compare the survivors on volume, depth, token quality, and fee tier.")

Before adding a pool to your shortlist, check:

- **TVL:** is there enough depth for ordinary trading?
- **Volume:** is activity sustained across several windows, or did it arrive in one spike?
- **Buy and sell flow:** are trades moving both ways, or is the market only dumping?
- **Pool age:** is the market established, or still discovering a price?

The goal is not to find the highest number. It is to find a pool whose fee activity might still exist after your transaction lands.

## Step 2: vet the token behind the pool

Copy the token's exact contract address from Meteora and paste it into a Solana screener such as [GMGN](https://gmgn.ai/?chain=sol). Never trust the ticker or name. Duplicate-name tokens are common.

Run four checks:

- **Contract:** confirm that the address matches the pool exactly.
- **Volume:** compare recent windows instead of relying on a single 24-hour total.
- **Holders:** look for a few wallets or connected clusters controlling a large share.
- **Price:** avoid entering blindly after a vertical move or during chaotic price discovery.

![A holder map showing groups of connected wallets around a Solana token.](/images/meteora-lp/04-2-gmgn-holder-clusters.png "Connected holder clusters can sell together. No displayed fee rate compensates for a token you never investigated.")

For a pair such as SOL/USDC, token risk is easier to understand, although range risk and **impermanent loss** remain: the LP position can still underperform simply holding the two assets. For a fresh meme coin, work from a harsher assumption: the token can go to zero and the position can finish holding it.

## Step 3: compare pools for the same pair

The same token pair can have several DLMM pools. Each can use a different **bin step** and fee tier, so choosing the token pair is only half the decision.

![A Meteora comparison showing four pools for the same token pair with different bin steps, fee tiers, TVL, volume, and fee-to-TVL ratios.](/images/meteora-lp/05-1-bin-step-comparison.png "The highest fee tier is not automatically the best pool. Compare it with the volume and liquidity that actually use that pool.")

Bin step sets the percentage gap between neighboring bins. Smaller steps create finer price increments. Larger steps create wider jumps and can cover a broad move with fewer bins. Neither is universally better.

Compare each candidate on:

- **Bin step:** does it fit the volatility and range you want?
- **Fee tier:** is it earning from real flow, or is the price deterring ordinary traders?
- **TVL and volume:** is this the pool the market is actually using?
- **Fee collection mode:** will fees arrive in both tokens or primarily in the quote token?

When two pools look similar, prefer the one with clearer, repeatable activity over the one with the most dramatic short-window percentage.

## Step 4: choose the right liquidity shape

Meteora offers three common shapes. Think of each as an instruction for where your capital should work.

- **Spot:** a balanced distribution across the selected range. Useful when you want broad exposure without concentrating around one level.
- **Curve:** more liquidity near the middle. More capital-efficient if price stays close, but easier to leave behind when price moves.
- **Bid-ask:** more liquidity toward the edges. Useful for DCA-style buying below price or selling above it.

For a volatile token, I often use a small bid-ask position below the current price. The purpose is not to make the interface display the highest yield. It is to define where I am willing to exchange SOL or USDC for the token if price falls.

![Meteora's bid-ask strategy with liquidity distributed below the current pool price.](/images/meteora-lp/05-2-bid-ask-position-setup.png "A bid-ask range can stage progressively more liquidity below price. It is a deliberate buying plan, not automatic downside protection.")

That last distinction matters. Bid-ask is sometimes described as safer, but the shape does not make a bad token safe. If price falls through the entire range, the position can still end up holding the token that collapsed.

## Step 5: set a range you can defend

Your range is where the position can earn. A narrow range concentrates capital and can earn more while active, but a modest price move can push it out. A wide range gives price more room, but spreads capital across more bins and reduces concentration.

Place the boundaries using a reason you can state in one sentence: a recent trading range, an area of repeated support and resistance, or the prices at which you are genuinely willing to buy or sell. Do not drag the handles until the projected return looks exciting.

Then run a simple three-outcome test:

1. **Price exits above:** what asset will you mostly hold, and are you happy with that?
2. **Price stays inside:** is the expected activity enough to justify monitoring the position?
3. **Price exits below:** what token will you own, and how much could it fall?

If one outcome would leave you with an asset you do not want, change the range, change the pair, or walk away.

## Step 6: open small and check the transaction

Use a dedicated wallet containing only the amount you intend to deploy. Review the pair, strategy, minimum price, maximum price, bin count, asset split, and transaction costs before approving.

When you are ready to open the position, use [my Meteora referral link](https://app.meteora.ag/ref/SEBMONTY) and connect the wallet you intend to use.

For a first position:

- Use an amount you can lose without needing to win it back.
- Confirm that the live pool price is inside the selected range.
- Check that the pool price is still close to the wider market price.
- Verify the position appears in your portfolio after the transaction lands.
- Wait for real trades and confirm claimable fees begin to change.

![A fast-moving Meteora pool showing a warning that the pool price differs from the market price while price has moved beyond the selected range.](/images/meteora-lp/09-3-new-pool-out-of-range.png "If the pool price differs from the market or price has already escaped your range, stop. Do not increase slippage simply to force the original plan through.")

A failed transaction is frustrating. A successful transaction into a stale or badly priced pool can be much more expensive.

## Step 7: manage the position, not the fee counter

The pool screen tells you where market liquidity sits, what fee the pool charges, how your range compares with the current price, and whether your position is active.

![A Meteora pool screen showing current price, liquidity distribution, fee settings, several open positions, claimable fees, and P and L.](/images/meteora-lp/08-2-liquidity-distribution-chart.png "Read the whole screen together: current price, distribution, fee settings, range, inventory, fees, and P\&L.")

Every time you check a position, answer four questions:

- **Is it in range?** If not, it is not earning trading fees.
- **What does it hold now?** Price movement may have converted most of the position into one asset.
- **Why is P\&L moving?** Separate fees from the changing value of the inventory.
- **Does the original reason still hold?** Reinvesting into a broken setup compounds the mistake.

![A Meteora portfolio where some volatile pools show very high fee-to-TVL percentages while the corresponding positions remain at a loss.](/images/meteora-lp/10-2-fee-tvl-percentage.png "This is why fees are not profit: the highest Fee/TVL rows can still show negative P\&L when the underlying token falls.")

Claiming fees is an accounting action, not a rescue strategy. Reinvest only if you would still choose the same token, pool, shape, and range with fresh capital today.

## When to rebalance or close

Decide the exit rules before the position becomes emotional. Consider closing or rebuilding when:

- Price leaves the range and the reason for the range no longer holds.
- Volume and fees disappear while your capital remains exposed.
- The holder distribution or token thesis changes.
- The position has converted into an asset you do not want to keep.
- The net result reaches the loss or profit level you set in advance.

Meteora lets you withdraw or close a position. A zap-out flow may swap the assets during withdrawal, so check price impact and the asset you will receive before approving.

If you finish in USDC and want to spend it in the real world, use [my Kast referral](https://app.kast.xyz/referral/SEBMONTY). Kast is my favorite crypto debit card, and I have used it for two years.

![Meteora's position close screen with a generated profit and loss summary card.](/images/meteora-lp/13-3-generate-pnl-card.png "After closing, record the complete result. Fees make a good screenshot; net P\&L makes a better decision log.")

## A simple first-position plan

There are two sensible ways to learn, depending on what you want from the exercise.

**Mechanics first:** choose a more established pair, use a small amount, and give the range enough room to observe how inventory and fees change. The fee rate may be unexciting. That is fine. The purpose is to understand the controls.

**Volatility first:** choose a volatile pair only after vetting it, use an amount you expect could go to zero, and treat the position as paid training. Monitor it closely. Do not confuse a dramatic fee counter with a sustainable strategy.

Do not start by creating a brand-new pool. Learn to read and manage an existing one before adding pool creation, price discovery, routing, and arbitrage risk.

If you keep SOL outside your LP positions, stake your SOL with [validator.com](https://validator.com/) to support me and grow your Solana bags through staking rewards. Rewards vary, and staking still carries validator and protocol risk.

## Pre-deposit checklist

- The contract address matches the intended token.
- The pool has real TVL and sustained two-sided volume.
- The holder map does not reveal a risk you are unwilling to take.
- You compared the available bin steps and fee tiers.
- You know why Spot, Curve, or Bid-Ask fits this position.
- You can explain the minimum and maximum prices.
- You know what asset you will hold beyond either boundary.
- The current pool price is inside the range and close to the market price.
- The amount is small enough for the worst case.
- You have a schedule and a rule for closing or rebuilding.

## Sources

- [My Meteora referral link](https://app.meteora.ag/ref/SEBMONTY) for finding and managing positions.
- [Official DLMM overview](https://docs.meteora.ag/core-products/dlmm/what-is-dlmm) for bins, dynamic fees, and product mechanics.
- [Official strategy guide](https://docs.meteora.ag/core-products/dlmm/strategies-and-use-cases) for Spot, Curve, and Bid-Ask use cases.
- [GMGN](https://gmgn.ai/?chain=sol) for contract, holder, volume, and chart checks.
- [Follow me on X](https://x.com/SebMontgomery) for new guides, position updates, and Solana research.
- [Seb Montgomery on YouTube](https://www.youtube.com/@SebMontgomery) for the longer walkthrough.
- [Stake SOL with validator.com](https://validator.com/) to support me and earn variable staking rewards.
- [Use my Kast referral](https://app.kast.xyz/referral/SEBMONTY) when you want to spend USDC in the real world.
- [Meteora LP Skill File](https://github.com/sebmonty/skills/tree/main/meteora-lp-sebmonty) for mechanics-grounded guidance in Claude or Codex.

_Published 21 July 2026. Interface details, pool metrics, and the point-in-time figures shown in screenshots will change. Check the live app before acting._
