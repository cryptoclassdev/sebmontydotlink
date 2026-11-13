# Project logos

Each logo is the project's profile picture on its official, verified X account, used only to identify the project next to its own name. Downloaded on 14 November 2026 (400 x 400 from X), resized to 96 x 96 px WebP. `scripts/build.mjs` copies them to `public/breakpoint/logos/`.

| Project | File | X account | How the account was confirmed |
| --- | --- | --- | --- |
| Kamino | `kamino.webp` | https://x.com/kamino | Verified account named Kamino |
| Jupiter | `jupiter.webp` | https://x.com/JupiterExchange | Linked from jup.ag |
| Meteora | `meteora.webp` | https://x.com/MeteoraAG | Verified account named Meteora |
| Jito | `jito.webp` | https://x.com/jito | Verified; profile links to jito.network |
| Solana | `solana.webp` | https://x.com/solana | Verified account named Solana |
| Backpack | `backpack.webp` | https://x.com/Backpack | Linked from backpack.exchange |
| Helius | `helius.webp` | https://x.com/Helius | Linked from helius.dev |
| Sunrise | `sunrise.webp` | https://x.com/sunrise | Linked from sunrise.xyz |
| Ledger | `ledger.webp` | https://x.com/Ledger | Linked from ledger.com |

Profile pictures change. To refresh one, take the current picture from the account above, save it as `<project id>.webp` (96 x 96), rebuild, and update the date here. To add a project, also add its id to `LOGOS` in `src/main.tsx`. Projects without a logo show their initials.
