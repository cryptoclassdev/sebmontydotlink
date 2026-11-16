# validator.com logo

The "Powered by" block in the sidebar shows the official validator.com logo (three blocks and the "validator.com" wordmark) with the tagline "Safe and Trusted Staking" under it. The page uses the inline component `src/components/validator-logo.tsx`; the two SVGs here are the same artwork as standalone files.

| File | Use |
| --- | --- |
| `validator-lockup-light.svg` | Light backgrounds: navy, blue and orange blocks, black wordmark (Figma node 2001:2104) |
| `validator-lockup-dark.svg` | Dark backgrounds: white, blue and orange blocks, white wordmark (Figma node 2001:2140) |

## Source

- **Logo:** the tricolour lockups in the "Brand Kits - Validator" Figma file (file key `oqLqWZh1dYMmWJPSNt7YWm`), Assets page, "Logos New" group: light node 2001:2104, dark node 2001:2140. Exported as SVG through the Figma connector on 16 November 2026. In Figma the wordmark is live text; the SVG export outlines it, so the paths are Figma's own letterforms. Only the surrounding artboard was cropped away (viewBox `235.14 247.154 2034 171.635`); the paths and colours are unedited: navy `#1A1A40`, blue `#3295EB`, orange `#EC5228`, wordmark black, and on dark the first block and the wordmark white.
- **Component:** the same paths as the light export. The first block and the wordmark carry the classes `vc-block-first` and `vc-wordmark`, and `src/style.css` colours them for light mode and for `.dark`, which reproduces the two exports.
- **Tagline:** "Safe and Trusted Staking", the line set under validator.com in the same Figma file ("Current" page, for example text node 2249:198). On the page it is HTML text: 11.5 px, bold, in the page's foreground colour.

Seb approved this block (label, logo at the full sidebar width, tagline) in a local preview on 16 November 2026.

Never redraw, recolour or crop the artwork. To change the logo, export it from the Figma file again and replace the component and these files together.
