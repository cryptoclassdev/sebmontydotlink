# Project logos

Official marks for the projects in `data/seed.json`, used only to identify each project on the guide. Downloaded on 13 November 2026 from each project's own source, then resized to 96 x 96 px WebP. `scripts/build.mjs` copies them to `public/breakpoint/logos/`.

| Project | File | Source |
| --- | --- | --- |
| Kamino | `kamino.webp` | KMNO token icon, https://cdn.kamino.finance/kamino.svg (as listed in Jupiter's token data for mint KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS) |
| Jupiter | `jupiter.webp` | JUP token icon from Jupiter's token data (static.datapi.jup.ag) |
| Meteora | `meteora.webp` | MET token icon from Jupiter's token data (static.datapi.jup.ag) |
| Jito | `jito.webp` | JTO token icon from Jupiter's token data; matches the icon on https://www.jito.network/ |
| Solana | `solana.webp` | SOL token icon from Jupiter's token data (static.datapi.jup.ag) |
| Backpack | `backpack.webp` | Site icon, https://backpack.exchange/ |
| Helius | `helius.webp` | Site icon, https://www.helius.dev/ |
| Sunrise | `sunrise.webp` | App icon, https://sunrise.xyz/ |
| Ledger | `ledger.webp` | Site icon, https://www.ledger.com/ |

To add a project logo: take it from the project's own site or token metadata, save it here as `<project id>.webp` (96 x 96), add the id to `LOGOS` in `src/main.tsx`, and add a row above. Projects without a logo show their initials.
