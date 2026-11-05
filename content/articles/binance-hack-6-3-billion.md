---
title: "How Binance Absorbed the Biggest Hack in Crypto"
deck: "North Korean hackers drained $6.36 billion from Binance on October 29, 2026, the biggest crypto theft ever. Within three days Binance had covered 95% of it with its own money, while customers pulled nearly $11 billion out in the two days after withdrawals reopened."
date: 2026-11-05
category: exchanges
author: seb-montgomery
cover:
  src: banner.jpg
  alt: "Banner reading: The $6.3B Binance hack. How did users end up not losing a single dollar? With labels for 18,270 BTC, 971.1M USDT frozen and $11B withdrawn."
  position: left
disclosure: "I co-founded validator.com, which runs a Solana validator. This is information, not investment advice."
---

On October 29, 2026, at 20:05 UTC, five Binance wallets on the XRP Ledger started emptying into a single outside address. Within four hours the same thing had happened on nine more blockchains, and most of the money was gone in the first 20 minutes.

Blockchain analytics firm TRM Labs put the total at **\$6.36 billion** at the prices of the moment, about four times the \$1.5 billion taken from Bybit in February 2025. That makes it the biggest crypto theft on record.

Binance said within hours that it would cover every dollar.

## How did hackers steal \$6.3 billion from Binance?

The attacker got into an internal Binance wallet-signing service and used it to send transactions outside the normal withdrawal process, so to every blockchain they looked like ordinary transfers from Binance.

When you withdraw from an exchange, the coins come out of a hot wallet, one that stays online and signs transactions automatically so you aren't kept waiting. Everything else sits offline in cold wallets.

Binance's first explanation, on October 30, 2026, was one DevOps engineer's compromised laptop. Its incident report, published on November 3, shows a campaign that ran for months and went through three engineers.

It started in June, when a wallet DevOps engineer searched for a popular AI coding tool and installed a tampered copy of Homebrew to get it. Binance caught that, replaced his laptop and rotated his credentials, but the attackers now knew who worked on its wallet infrastructure.

In September a second engineer was approached on a job-hunting site by a fake project director. After a live video interview with a fake HR person, a second interview with a fake CEO ended with an instruction to download a coding "assignment" to his work computer. It carried zero-day malware that his endpoint security didn't detect.

From that machine, on October 20, the attacker used an internal Binance AI tool to take over the first engineer and a third wallet engineer, and found a token on the first engineer's computer that could deploy containers. On October 29, in the hours before the theft, the attacker logged onto the third engineer's computer, deployed a container with the stolen credentials and ran the script that launched the attack.

Binance says its security team stopped 57 suspected North Korea-linked attempts in 2026, using fake job interviews, fake developer tools and fake video-call apps, before this one got through.

On Ethereum the attacker used EIP-7702, a feature from the May 2025 Pectra upgrade that lets an ordinary wallet hand some of its powers to a smart contract. Through the signing service it signed 50 delegations in advance, one for each of the hot wallet's next 50 transaction numbers, so one was always going to match. That gave its own contract partial control of the wallet.

The delegation landed at about 20:21 UTC, and about three minutes later a sweeper contract emptied the Ethereum hot wallet in one go, taking **167,464 ETH** and more than 60 other tokens, 1.615 billion USDT among them. In the same minute, a Binance bitcoin hot wallet sent **18,270 BTC** to an address that broke it into smaller pieces inside the same block.

Pausing withdrawals didn't stop it, because the delegation lived on-chain. The hot wallet used multi-party computation (MPC), so there was no single private key Binance could use to cancel it, and the team had to build a special procedure. The last transfer, 2,961.9 ETH, landed at 23:56 UTC, and Binance cleared the delegation at 00:10 UTC on October 30.

Binance calls this an initial report. It says it has rebuilt the wallet system in a new environment, rebuilt the AI tool and its access controls, replaced the affected devices and cancelled the engineers' credentials, and it is bringing in independent security firms to review the incident.

![Timeline of the Binance hack on October 29 and 30, 2026, in UTC](hack-timeline.png "Timeline: the first Binance wallets were drained at 20:05 UTC on October 29, 2026; 18,270 BTC left at 20:20 and the Ethereum hot wallet was emptied at 20:24; Tether froze 971.1 million USDT at 21:01 and Circle froze 823 million USDC at 21:04; withdrawals on several networks were paused by about 22:30, a second wave hit Avalanche and Polygon at 23:05 and the last Ethereum sweep came at 23:56; Binance suspended all deposits and withdrawals at 00:13 on October 30. Source: TRM Labs; Bitquery; Binance on X. All times UTC.")

TRM Labs and Chainalysis tied the attack to TraderTraitor, the North Korean state hacking unit behind the Bybit theft, and the FBI confirmed on October 31, 2026, that North Korea was behind it. North Korea denied it on November 3, when Kim Jong Un's sister, Kim Yo Jong, called the U.S. accusation "absurd rhetoric".

## Binance and CZ kept talking all week

The team and the exchange kept sharing updates frequently, and put a number on almost every update.

Changpeng Zhao, known as CZ, no longer runs Binance but is still its largest shareholder. At 21:15 UTC on October 29, 2026, he wrote that it looked like a hack and thanked Tether and Circle for freezing funds so quickly. As a shareholder, he added, he expected all user funds to be fully covered.

Binance's own account posted a minute later that it hadn't confirmed any impact on user funds, then edited the post at 21:29 UTC to say user funds were completely safe. About an hour after his first post, CZ answered someone who put the loss after freezes at about \$1 billion: "Loss might be a bit higher than that, but will cover."

By 00:13 UTC on October 30, Binance was promising to cover all losses, and at 02:25 UTC it named the compromised laptop. By November 3 it was on recovery update \#6, the second signed by both co-CEOs, and Teng posted a video of nearly five minutes with a full transcript. Binance then announced each network on X as it reopened.

CZ kept posting through the week. He wrote "It hurts, but we will survive," and mentioned that Gulf, Binance's partner in Thailand, had offered cash liquidity after the 2023 fine and this time told him it knew Binance could cover but was there if needed.

He also argued that it was the biggest theft ever in dollars but not in bitcoin, pointing to the 650,000 BTC lost at Mt. Gox.

![Bar chart of the largest crypto thefts on record, in dollars at the time](largest-crypto-thefts.png "Bar chart: the largest crypto thefts in dollars at the time: Binance about $6.36 billion (October 2026), the LuBian mining pool about $3.5 billion (December 2020, first reported in 2025), Bybit $1.5 billion (February 2025), Poly Network $610 million (August 2021), Ronin about $540 million (March 2022), Coincheck $530 million (January 2018) and Mt. Gox close to $500 million (2011 to 2014). Source: TRM Labs (Binance); Arkham (LuBian, August 2, 2025); Reuters, October 30, 2026 (the others).")

Every one of those updates led with what Binance had frozen or paid, which kept the story on the recovery. The account of how the breach happened came last, in the November 3 incident report, which opened with an apology: "This should not have happened."

## Stablecoin issuers froze \$2.7 billion in hours

Tether and Circle build a freeze switch into USDT and USDC. The blockchains keep running, but once an issuer blacklists an address, the tokens in it can't go anywhere. Tether froze **971.1 million USDT** in the attacker's main wallet at 21:01 UTC on October 29, about 37 minutes after the Ethereum drain, and Circle froze **823 million USDC** three minutes later.

The freezes then spread to every wallet the attacker used for stablecoins. TRM Labs counts about 1.77 billion USDT frozen by Tether and about 825 million USDC by Circle, with Ripple freezing 40.5 million RLUSD and World Liberty Financial 27.8 million USD1. Arbitrum's Security Council, the group that can push emergency changes on that network, even moved 8,425 ETH and 74.6 million ARB, about \$30 million between them, out of the attacker's wallet.

Later counts run a little higher. By November 1, analytics firm Elliptic had verified **\$2.85 billion** frozen or seized, 44% of the theft, after Paxos, First Digital and Optimism's governance joined in. Binance's incident report gives the same \$2.85 billion as frozen or intercepted.

![Bar chart of stolen funds frozen by each issuer after the Binance hack](stablecoin-freezes.png "Bar chart: about $2.7 billion of the stolen funds was frozen on-chain by October 30, 2026: Tether about $1.77 billion, Circle about $825 million, Ripple $40.5 million, Arbitrum Security Council about $30 million and World Liberty Financial $27.8 million. Elliptic counted $2.85 billion frozen or seized by November 1, the same figure Binance gives in its November 3 incident report. Source: TRM Labs, October 30, 2026, 00:30 UTC; Binance on X.")

The attacker tried to dump stablecoins before the freezes caught up. About 325 million USDT went through UniswapX and similar services for roughly 122,300 ETH, at a price more than 10% worse than the market, and Bitquery, an on-chain tracker, counts about \$729 million of stolen USDT that got out in time.

Bitcoin, ether, XRP and SOL have no issuer, so no company can freeze them the way Tether and Circle did. On November 1 the attacker still controlled about **\$3.25 billion** that no issuer can touch, including about 584,000 ETH and the stolen bitcoin, according to Elliptic. By then none of the bitcoin had reached an exchange or any other service.

The laundering has already started. In under four days the money spread across about 12,000 wallets on 11 blockchains, with Tron as the main route, according to Elliptic data reported by Decrypt on November 2.

A freeze stops the tokens but doesn't hand them back. Lawyers who spoke to CoinDesk said the issuers can destroy the frozen tokens and reissue them to Binance once its ownership is established, which may take court orders in more than one country.

The speed also reopened an old argument. Critics quoted by CoinDesk asked why issuers moved within minutes for the world's biggest exchange when smaller victims get sent to the courts, and Circle had been criticized for not freezing USDC after the Drift hack in April 2026. Circle's CEO Jeremy Allaire said this freeze was done in coordination with law enforcement.

## U.S. agencies worked the case from the first hour

U.S. law enforcement was part of the response while the theft was still going on.

The Secret Service said on November 1, 2026, that its investigators worked with industry partners within minutes of the theft to identify and freeze a big part of the funds. It named the FBI, IRS Criminal Investigation, two U.S. Attorney's offices and the Justice Department's cybercrime and national security units as partners on the case.

The FBI had said on October 30 that it was working with public and private partners, and its statement the next day, which named North Korea, also listed the Secret Service and IRS Criminal Investigation. It said the hackers were turning most of the stolen assets into ether and asked THORChain node operators, RPC providers, instant exchanges and DeFi platforms to block anything coming from the listed addresses.

CZ gave those agencies credit for more than the freezes. On November 1 he wrote that a lot of the credit for why bitcoin "didn't drop more" goes to the FBI, Secret Service, IRS and others.

Bitcoin was at **\$80,769** at 20:00 UTC on October 29. It climbed back to about \$78,300 on November 2 after the first dip, then slipped to about \$76,500 by 07:00 UTC on November 3, roughly 5% below where it started.

## How did Binance cover the stolen funds?

Binance replaced the stolen coins with its own money before it let anyone withdraw.

The coins that were taken were Binance's own operating funds. Teng said in his October 30, 2026 video that Binance never uses customer funds, and that most user assets sit in cold wallets and only move to a hot wallet when someone withdraws.

They still had to be replaced, though. Every balance you see on the exchange is a promise that Binance holds the same coins one to one, so the gap had to be filled before withdrawals reopened.

On October 30 Binance said it had set aside more than **\$6.34 billion** of company funds, with \$5 billion already held in the exact tokens that were stolen, which covered about 80% of the loss. CZ explained where that pile comes from, writing that users pay trading fees in the coins they trade, so Binance builds up a stock of every token it lists.

On November 2 he added that Binance had already allocated all of the money and only the conversion into a few small coins was left. Binance didn't borrow, sell assets or raise money to do it, he wrote. It "covered from its balance sheet." Yi He put it more simply: "Binance has no funding gap."

The incident report goes further. Binance says it has set aside more than 100% of the money needed and that 98% of the affected token assets had been replenished as of October 31, a higher figure than the 95% in its daily updates, which it didn't explain.

![Column chart of the share of stolen assets Binance had replaced, October 30 to November 1, 2026](assets-replaced.png "Column chart: Binance said it had replaced about 80% of the stolen assets on October 30, 2026, about 90% on October 31 and about 95% on November 1, a figure it repeated on November 2. The last 5% is less liquid tokens outside its top ten that it is still buying through market and over-the-counter channels. Source: Binance recovery updates 2 to 5 on X, October 30 to November 2, 2026.")

The money came from three places, starting with SAFU, the Secure Asset Fund for Users. Binance set it up in July 2018 with a share of its trading fees, and it's held by Nest Clearing and Custody, a clearing house regulated in Abu Dhabi.

The rest came from part of the futures insurance fund, which normally covers bankrupt trading positions, and from Binance's corporate treasury.

You can see the SAFU draw on the bitcoin blockchain. The fund had held 15,000 BTC since February 12, 2026, and at 14:51 UTC on October 31 it sent out **7,499 BTC**, about \$581 million at the time, which cut it in half.

Binance has promised to refill it to about \$1 billion, and on November 3 the address still held 7,500 BTC. It first used the fund in May 2019, when hackers stole 7,000 BTC, worth about \$40 million then.

Binance took a fresh proof-of-reserves snapshot at 00:00 UTC on October 31, 2026, and published the zero-knowledge proof for it on November 2. Anyone holding BTC, ETH, USDT, BNB, SOL, USDC, XRP, USD1, RLUSD or ZEC on Binance can now check that their balance is backed at least one to one. That snapshot came before withdrawals reopened, so the next one, planned for November 4 with more tokens, is the first that will show the reserves after the outflows.

## How much money does Binance make?

Binance doesn't publish audited accounts, but every estimate, CZ's own included, puts its yearly revenue above the part of this theft that's likely gone for good.

For now Binance is carrying the whole bill, because it set aside \$6.34 billion and replaced 95% of the stolen assets before any frozen funds came back.

Binance puts the damage at \$6.34 billion and the frozen or intercepted part at \$2.85 billion. If that frozen part does come back, the loss shrinks to about **\$3.5 billion**, most of it bitcoin and ether still sitting with the attacker. Getting frozen tokens reissued may need court orders in several countries, so that won't happen quickly.

Bloomberg's billionaires index estimated Binance's revenue at about **\$10.7 billion** in September 2026, scaling \$5.4 billion of estimated trading-fee revenue by the ratio seen at listed companies. Analytics firm Artemis told Forbes in March 2026 that Binance made an estimated \$16 billion to \$17 billion in revenue in 2024 and 2025.

CZ's own number is lower. On March 11, 2026, arguing that Forbes had overstated his wealth, he put Binance's estimated yearly revenue at \$5 billion. Co-CEO Yi He wrote on October 30 that "our company's revenue for the year is sufficient to cover the losses."

![Bar chart comparing Binance's unfrozen hack loss with estimates of its yearly revenue](loss-vs-revenue.png "Bar chart: the roughly $3.5 billion of stolen funds outside any freeze, against estimates of Binance's yearly revenue: $5 billion (CZ, March 2026) and $10.7 billion (Bloomberg, September 2026). On Bloomberg's figure the loss is about 33% of a year's revenue. Source: Binance incident report, November 3, 2026 (impact and frozen totals); CZ on X, March 11, 2026; Bloomberg Billionaires Index via Nairametrics, September 20, 2026.")

On Bloomberg's number the unfrozen \$3.5 billion is about **33%** of Binance's revenue, and on CZ's lower figure it's about 70%. Against the \$171 billion in assets Binance reported as of October 28, 2026, it's about 2%.

Put another way, Bloomberg's estimate works out to about **\$29 million** a day. At that pace the unfrozen \$3.5 billion is about 119 days of revenue, just under four months, and even the full \$6.34 billion Binance fronted is about seven months. On CZ's \$5 billion, the unfrozen part comes to about eight months.

Teng said in his video that Binance holds most of what it earns in crypto and has kept a lot of it inside the company, which is how it could take a hit this size straight away with its own money. CZ made the same point to Elon Musk, telling him the SpaceX shares Binance got from its \$500 million stake in the Twitter deal are worth more than \$1 billion.

## Customers still pulled \$11 billion in two days

Nearly \$11 billion left Binance in the first two days after withdrawals came back, though \$5.7 billion came in over the same stretch and most of the money stayed put.

Binance restarted withdrawals in phases at 06:00 UTC on November 1, 2026, starting with bitcoin and then the networks its users had wanted most in the past week. By 12:36 UTC all 15 networks in the first phase were open, Ethereum, BNB Smart Chain, Solana, Tron and the XRP Ledger among them. Phase two started at 04:00 UTC on November 3, and by 07:08 UTC it had added stablecoins and dozens of tokens on Ethereum and Solana.

The first rush was the biggest. Between 06:00 and 15:30 UTC on November 1, Binance processed **\$4.649 billion** in withdrawals against \$1.01 billion in deposits, a net outflow of about \$3.64 billion. Binance put that at 2.1% of its assets under management, and CZ summed it up as 98% choosing to stay.

Binance's own running totals show how the two days played out. From 06:00 UTC on November 1 to 04:00 UTC on November 3, it processed **\$10.97 billion** in withdrawals against \$5.70 billion in deposits, a net outflow of **\$5.28 billion**, about 3% of its \$171 billion in assets. Withdrawals peaked at \$1.24 billion in a single hour on November 1, and by 03:00 UTC on November 3 hourly deposits had overtaken withdrawals, Binance said.

![Bar chart of Binance withdrawals, deposits and net outflow from November 1 to November 3, 2026](withdrawals-deposits.png "Bar chart: from 06:00 UTC on November 1 to 04:00 UTC on November 3, 2026, Binance processed $10.97 billion in withdrawals and $5.70 billion in deposits, a net outflow of about $5.28 billion, or 3.1% of the $171 billion in assets it reported as of October 28. Source: Binance on X, November 3, 2026.")

Independent trackers show a bigger drop. DefiLlama, which follows Binance's publicly known wallets, saw those balances fall from \$144.9 billion before the hack to **\$124.8 billion** at the start of November 3 (UTC), a slide that includes the stolen funds and price moves. Binance told Reuters the DefiLlama figures leave out funds it moved into its own new hot wallet.

Some of it went to rivals. DefiLlama showed OKX taking in a net \$496 million over the 24 hours to 06:09 UTC on November 2, with smaller inflows at Gate, Bybit and Bitget.

The last scare gives a sense of scale. In December 2022, after FTX collapsed, Nansen counted about \$3.7 billion in net outflows from Binance over seven days, and FTX itself lost 87% of its balances in five days in November 2022, according to Arkham data.

This time a similar amount left Binance in under ten hours, though from a much bigger base.

Binance is also spending to keep customers trading. On November 2 it launched a Community Appreciation Campaign, promoted as \#ThankYouBinancians, that runs to November 21. Verified users get a 100 USDC spot-fee rebate voucher, traders share a 20 million USDC pool and stablecoin savings earn bonus yield of up to 10% APR, though users in the U.S., UK, EEA, Hong Kong, Singapore and other restricted regions can't take part.

## What Binance got right and wrong

The money side of the response worked, and the security side is where Binance fell short.

What it got right

- Stablecoin issuers, working with U.S. agencies, started freezing funds within about an hour, and Elliptic counted \$2.85 billion frozen or seized by November 1.

- It put a number on almost every update, from the impact and frozen totals to the coverage percentage and the withdrawal figures.

- It replaced the stolen assets before reopening withdrawals and published a zero-knowledge proof that lets users check their own balances are backed.

- Its incident report opened with an apology and laid out the whole attack chain, down to the fake job interview.

What it got wrong

- An EIP-7702 delegation sent through its own signing service emptied its main Ethereum hot wallet, and its MPC setup had no single key to cancel it, so the delegation stayed live until 00:10 UTC, nearly four hours after it landed.

- Its first post said it hadn't confirmed any impact on user funds, and an edit at 21:29 UTC on October 29 changed that to "completely safe" before anyone knew the size of the loss.

- It caught the June compromise but the attackers still knew who ran its wallets, its endpoint security missed the malware from the fake interview, and an internal AI tool let the attacker move from one engineer to the next.

## Where should you keep your crypto?

Keep it on an exchange big enough to pay for its own worst day, or in a wallet you control.

Binance is the second big exchange in two years to absorb a billion-dollar hack without passing it to customers. When North Korean hackers took **\$1.5 billion** in ether from Bybit on February 21, 2025, Bybit kept withdrawals open and rebuilt about 447,000 ETH within 72 hours through emergency loans and large deposits.

Bitget did the same on a smaller scale. Hackers took about \$388 million from its hot wallets on September 24, 2026, and its User Protection Fund and reserves covered customers. The fund alone was worth more than \$464 million before the hack, and Bitget had refilled it to \$309 million by September 30.

Smaller exchanges don't have that cushion. Lykke lost about **\$22 million** on June 4, 2024, and halted operations two days later. A UK court ordered it wound up in March 2025, with about \$68 million of client assets still stuck inside.

New Zealand's Cryptopia lost about NZ\$24 million in January 2019 and went into liquidation that May. Its users got their first payouts in December 2024, nearly six years later.

India's WazirX lost about **\$235 million** in July 2024, close to half the reserves it had reported a month earlier, and its users only got 85% back after a Singapore court approved a restructuring in October 2025.

![Bar chart of exchange hacks and who paid for them](exchange-hacks-who-paid.png "Bar chart: Binance ($6.36 billion, October 2026) and Bybit ($1.5 billion, February 2025) covered their hacks themselves; WazirX ($235 million, July 2024) gave users 85% back after a court-approved restructuring; Lykke ($22 million, June 2024) was wound up. Source: TRM Labs; Bybit via CNBC, February 24, 2025; WazirX restructuring (Singapore High Court, October 2025); Interpath liquidation of Lykke Corp UK (March 2025).")

That's why I'd keep exchange money only on the big names that have shown they can pay or prove their reserves, such as Binance, Bybit, OKX and Kraken. OKX has published a proof-of-reserves report every month for four years, and its latest, out on October 29, 2026, showed 110% backing for BTC, 100% for ETH and 105% for USDT.

Kraken was founded in 2011, and its one recent exploit, in June 2024, took nearly \$3 million from Kraken's own treasury rather than client accounts. The money was returned.

Backpack is much smaller, with about \$522 million in customer balances, but its reserves are the most frequently checked of any exchange here. It has published a proof of reserves almost every day since August 2025, verified by security firm OtterSec, and on November 3, 2026 it held \$525.6 million against \$521.6 million owed to customers, a ratio of 100.75%.

Armani Ferrante, Backpack's co-founder, has always been loud about security, and I'd expect Backpack to take it as seriously as anyone. Users can put a time delay on their own withdrawals, and after the Binance hack he wrote that "you have to assume anything that is not formally verified will get hacked." Backpack couldn't absorb a Binance-sized loss, though, so its case rests on prevention and proof rather than deep pockets.

The other route is holding your own keys. A hardware wallet takes the exchange out of the picture, but buy it straight from the maker, because Singapore police warned on October 28, 2026 that tampered Ledger wallets sold through local stores had drained about S\$3.5 million from buyers.

Whichever you choose, a few habits help:

1. Check the proof of reserves where you keep funds. Binance's next snapshot, on November 4, 2026, is the first taken after withdrawals reopened, and its proof should follow about two days later.

2. Ignore screenshots, compensation offers and links in group chats. CZ, Yi He and Richard Teng warned of fake screenshots, phishing, "priority processing" offers and fake compensation claims after withdrawals reopened.

3. Turn on withdrawal address allowlists and time delays wherever the exchange offers them.

4. Remember that USDT and USDC can be frozen by their issuers. That power held back about \$2.6 billion of stolen funds here, and issuers can use it on any address.

## My verdict on Binance

All in all, Binance took the biggest theft crypto has ever seen and dealt with it with utmost professionalism. The communication from the team and rapid action in the initial moments after the hack helped avoid uncertainty and chaos.

An exchange sells trust, and a promise that none of its 335 million users pays for the hack protects that trust far better than any marketing budget. Saving face is the whole point, and it explains the order of the announcements, with coverage figures every day and the incident report, apology and all, coming last.

It still costs Binance on the customer side, with about \$5.3 billion net withdrawn in the first two days back. Binance is losing assets under management, but it has kept its name and trust.

For a business that earns from trading fees, the name matters more, because customers who stay keep trading.

Before you trust an exchange with your coins, ask whether it could pay for its own worst day.

**Sources:** Binance incident report on X (November 3, 2026) · Binance on X (security statements and recovery updates 2 to 6, October 29 to November 3, 2026) · Binance campaign announcement (November 2, 2026) · Richard Teng on X (video transcript, October 30, 2026, and November 2) · Yi He on X · CZ on X (October 29 to November 2, 2026, and March 11, 2026) · U.S. Secret Service on X · FBI · TRM Labs · Bitquery · CoinDesk · CNBC · Decrypt · Nextgov · Security Affairs · Reuters · Forbes · Bloomberg via Nairametrics · The Block · Bloomberg via BNN (December 2022) · CoinDesk (November 2022) · DefiLlama · CoinGecko · mempool.space · CNBC (Bybit, February 2025) · Interpath and CYK (Lykke liquidation) · Cryptopia liquidation · WazirX restructuring · OKX proof-of-reserves report · The Block (Kraken, June 2024) · FinanceFeeds · Backpack proof of reserves · Armani Ferrante on X · Singapore Police Force · Arkham (LuBian) · Finance Magnates and 247 Wall St (Bitget) · Elliptic · Decrypt (Elliptic laundering data) · AP via ABC News (North Korea's denial). Figures checked November 3, 2026, 07:00 to 08:30 UTC; incident report read at 15:05 UTC.

## Sources

- [Binance on X, "29 October Binance Security Incident: Initial Findings and Response Update" (November 3, 2026)](https://x.com/binance/status/2117626126214504729)

- [Binance on X, "Security Incident, Recovery Update \#2" (October 30, 2026)](https://x.com/binance/status/2116258356109496479)

- [Binance on X, "Security Incident, Update \#3: 90% of Stolen Assets Replenished" (October 31, 2026)](https://x.com/binance/status/2116538196259684457)

- [Binance on X, "Security Incident, Recovery Update \#4: Withdrawals Resume in Phases" (November 1, 2026)](https://x.com/binance/status/2116744986096292263)

- [Binance on X, initial investigation: compromised DevOps laptop (October 30, 2026)](https://x.com/binance/status/2115993361517891592)

- [Binance on X, investigation update: additional points of breach (October 30, 2026)](https://x.com/binance/status/2116089661408108712)

- [Binance on X, withdrawals and net outflow, November 1, 2026](https://x.com/binance/status/2116926305254133892)

- [Binance on X, "Security Incident, Recovery Update \#5: October 31st PoR Snapshot Now Fully Verifiable by Users" (November 2, 2026)](https://x.com/binance/status/2117237539098521938)

- [Binance on X, "Security Incident, Recovery Update \#6: Withdrawals Reopen for More Assets" (November 3, 2026)](https://x.com/binance/status/2117444179630707088)

- [Binance on X, withdrawal data from November 1 06:00 to November 3 04:00 UTC (November 3, 2026)](https://x.com/binance/status/2117494793446298084)

- [Binance on X, latest withdrawal update, Ethereum and Solana tokens (November 3, 2026)](https://x.com/binance/status/2117514123089231963)

- [Binance, Community Appreciation Campaign announcement (November 2, 2026)](https://www.binance.com/en/support/announcement/detail/dad3f7336cd343fd9752c63b21f8d52a)

- [Richard Teng on X, video transcript (October 30, 2026)](https://x.com/_RichardTeng/status/2116176703823528024)

- [CZ on X, the size of the hack in bitcoin terms (October 30, 2026)](https://x.com/cz_binance/status/2116198836729520420)

- [CZ on X, trading fees and Binance's token holdings (October 30, 2026)](https://x.com/cz_binance/status/2116137390180065546)

- [CZ on X, partner support (October 30, 2026)](https://x.com/cz_binance/status/2116124551386132816)

- [CZ on X, 12 hours after withdrawals resumed (November 1, 2026)](https://x.com/cz_binance/status/2116954044988354798)

- [CZ on X, Binance has allocated 100% of the funds (November 2, 2026)](https://x.com/cz_binance/status/2117300264738889901)

- [CZ on X, Binance covered from its balance sheet (November 2, 2026)](https://x.com/cz_binance/status/2117302637574144147)

- [Yi He on X, no funding gap (November 2, 2026)](https://x.com/heyibinance/status/2117306403731951809)

- [Richard Teng on X, scam warning (November 2, 2026)](https://x.com/_RichardTeng/status/2117271494208225735)

- [TRM Labs, "North Korea Steals USD 6.36 Billion From Binance in the Largest Hack in History"](https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history)

- [Bitquery, Binance hack investigation](https://bitquery.io/investigations/binance-hack)

- [CoinDesk, experts on the Binance hack asset freezes (October 30, 2026)](https://www.coindesk.com/business/2026/10/30/experts-divided-over-binance-hack-asset-freezes-warn-recovery-is-another-matter)

- [CNBC, Binance's \$6.3 billion hack: what we know and what comes next](https://www.cnbc.com/2026/10/30/billions-in-crypto-frozen-in-binance-hack-heres-what-happens-next-.html)

- [Nextgov, FBI involved in response to the Binance hack](https://www.nextgov.com/cybersecurity/2026/10/fbi-involved-response-63-billion-binance-hack-linked-north-korea/416946/)

- [Security Affairs, FBI blames North Korea for the Binance theft](https://securityaffairs.com/202221/apt/fbi-blames-north-korea-for-6-billion-binance-crypto-theft.html)

- [Decrypt, Yi He on revenue covering the losses](https://decrypt.co/382236/elon-musk-cz-trade-blows-spacex-shares-binance-hack)

- [Arkham, LuBian mining pool theft uncovered (August 2, 2025)](https://info.arkm.com/announcements/arkham-uncovers)

- [Finance Magnates, Bitget's \$388 million hack and its protection fund (September 25, 2026)](https://www.financemagnates.com/cryptocurrency/exchange/bitgets-388-million-hack-could-consume-84-of-its-protection-fund/)

- [247 Wall St, Bitget rebuilt a \$309 million protection fund (October 3, 2026)](https://247wallst.com/investing/cryptocurrency/2026/10/03/bitget-rebuilt-a-309-million-protection-fund-after-a-388-million-hack-is-your-crypto-safe-on-an-exchange/)

- [Elliptic, the largest theft in history (updated November 1, 2026)](https://www.elliptic.co/insights/binance-largest-hack-in-history)

- [Decrypt via Yahoo Finance, North Korea is laundering Binance hack loot (November 2, 2026)](https://finance.yahoo.com/markets/crypto/articles/north-korea-laundering-binance-hack-184603378.html)

- [ABC News (AP), North Korea denies involvement in the Binance hack (November 3, 2026)](https://abcnews.com/International/wireStory/north-korea-denies-involvement-binance-hack-criticizes-fbi-137788208)

- [Khaleej Times (Reuters), where the Binance hack ranks among crypto heists](https://khaleejtimes.com/business/cryptocurrency/binance-hack-october-2026-biggest-crypto-heists-in-history)

- [Forbes, Binance revenue estimate from Artemis (March 10, 2026)](https://www.forbes.com/sites/ninabambysheva/2026/03/10/binance-founder-cz-is-now-richer-than-bill-gates/)

- [Nairametrics, Bloomberg Billionaires Index estimate of Binance revenue (September 20, 2026)](https://nairametrics.com/2026/09/20/binance-founder-changpeng-zhaos-net-worth-jumps-9-8bn-in-24-hours-to-91-2-billion/)

- [The Block, Binance outflows after reopening withdrawals](https://www.theblock.co/news/business/2026-11-01-binance-sees-3-64-billion-in-net-outflows-after-reopening-withdrawals-following-record-hack-432259)

- [The Standard (Reuters), Binance says outflows are stabilising](https://www.thestandard.com.hk/finance/article/347188/Binance-sees-outflows-stabilising-as-exchange-returns-online-after-US63-billion-heist)

- [BNN Bloomberg, Binance outflows in December 2022](https://www.bnnbloomberg.ca/binance-hit-by-crypto-outflows-as-ftx-s-fall-shakes-exchanges-1.1858550)

- [CoinDesk, FTX balances fell 87% in five days (November 2022)](https://coindesk-coindesk-prod.cdn.arcpublishing.com/markets/2022/11/10/ftx-balances-tumbled-87-in-5-days-in-epic-crypto-deposit-run-data-shows/)

- [DefiLlama, Binance exchange wallets](https://defillama.com/cex/binance)

- [mempool.space, Binance SAFU bitcoin address](https://mempool.space/address/1BAuq7Vho2CEkVkUxbfU26LhwQjbCmWQkD)

- [CoinGecko, bitcoin price history](https://www.coingecko.com/en/coins/bitcoin)

- [CNBC via NBC San Diego, Bybit fully replenished reserves after \$1.5 billion hack (February 24, 2025)](https://www.nbcsandiego.com/news/business/money-report/crypto-exchange-bybit-says-it-fully-replenished-reserves-after-record-1-5-billion-hack/3762071/)

- [Forklog, Lykke halts operations after \$22 million hack (June 2024)](https://forklog.com/en/lykke-exchange-halts-operations-following-22-million-hack/)

- [CYK, provisional liquidators and liquidators appointed for Lykke Corp UK](https://cyklaw.com/?p=3719)

- [Wikipedia, Cryptopia (hack, liquidation and distributions)](https://en.wikipedia.org/wiki/Cryptopia)

- [Wikipedia, 2024 WazirX hack and restructuring](https://en.wikipedia.org/wiki/2024_WazirX_hack)

- [Cryptonews.net, OKX proof-of-reserves report (October 29, 2026)](https://cryptonews.net/news/market/33673055/)

- [The Block, Kraken exploit took nearly \$3 million from its treasury (June 19, 2024)](https://www.theblock.co/post/300888)

- [FinanceFeeds, Binance edited its first hack statement (October 30, 2026)](https://financefeeds.com/binance-hack-statement-edited-user-funds-safe)

- [U.S. Secret Service on X (November 1, 2026)](https://x.com/SecretService/status/2116956218887389218)

- [Backpack, proof of reserves (November 3, 2026)](https://backpack.exchange/reserves)

- [Armani Ferrante on X (October 31, 2026)](https://x.com/armaniferrante/status/2116582119149273202)

- [Singapore Police Force, advisory on tampered hardware wallets (October 28, 2026)](https://www.police.gov.sg/Media-Hub/News/2026/10/20261028_police_advisory_on_tampered_cryptocurrency_hardware_wallets)
