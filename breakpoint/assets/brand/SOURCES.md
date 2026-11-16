# validator.com logo

The "Powered by" block in the sidebar shows the validator.com logo: the three-block mark with "validator.com" beside it. The page uses the inline component `src/components/validator-logo.tsx`; the two SVGs here are the same logo as standalone files.

| File | Use |
| --- | --- |
| `validator-lockup-light.svg` | Light backgrounds: navy, blue and orange blocks, black wordmark |
| `validator-lockup-dark.svg` | Dark backgrounds: white, blue and orange blocks, white wordmark |

## Where each part comes from

- **Blocks:** the geometry of the official mark exported from the "Brand Kits - Validator" Figma file (canvas "Current", node 2116:2), as kept in `SebMontyDepartment/Seb_Validator.com_Infographic_Generator` at `data/brands/validator/assets/validator-logo.svg`: three 84.9 px squares, 7.62 px corner radius, 16.12 px apart.
- **Colours:** the tricolour lockup on the Assets page ("Logos" group) of the same Figma file, which is the version Seb picked on 16 November 2026: navy `#1A1A40`, blue `#3395EB`, orange `#ED5228`. On dark backgrounds the kit's own dark lockup turns the navy block and the wordmark white.
- **Wordmark:** "validator.com" in Degular Bold, the typeface validator.com uses for it. It was converted to outlines (paths) so no font file ships. Size and position follow the Figma lockup: the "l" is 0.88 of a block tall, the baseline sits 0.08 of a block above the bottom of the blocks, the word starts 0.61 of a block after the last block and is 7.7 blocks wide (Degular Bold at its normal spacing).

The live validator.com header draws the blocks with slightly different colours (CSS `oklch`, a lighter cyan). The Figma lockup above is the reference used here.

Never redraw, recolour or crop the blocks. To change the logo, export it from the Figma file and replace the component and these files together.
