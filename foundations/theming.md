# Theming

Two independent switches. Both are variable modes, set on a frame with `setExplicitVariableModeForCollection`.

## Light / dark — collection `Color`
- Base UI screens: `light`.
- Spirit chat and anything over the Spirit gradient: `dark`. Components inside inherit it.
- Never mix: one mode per screen frame.

## Brand — collection `Theme`
| Variable | re:verse | Atlas (demo brand) |
|---|---|---|
| color/action | neutral/800 | #0B1F4D navy |
| color/action on dark | white | #DCE4FF |
| color/accent | pink #FF2D55 | blue #2F5BFF |
| radius/control | 999 (pill) | 12 |
| radius/field | 16 | 12 |
| radius/card | 16 | 12 |
| radius/sheet | 38 | 24 |
| font/text | Geist | Manrope |
| font/mono | Geist Mono | IBM Plex Mono |

What follows the theme: Primary button, selected chip, toggle, inverted surfaces, accent, all control/field/card/sheet radii, every text style and every component label.
What does not: card art (`Card / Art`), photos, avatars, the re:verse wordmark, Spirit persona colors.

## How to rebrand a screen
1. Select the screen frame.
2. Set `Theme` mode to the brand. Nothing else changes in the frame.
3. If something kept the old look, it has a raw value: fix the component, not the screen.

## Adding a client brand
Add a mode to `Theme`, fill the 10 variables, check `Foundations / Theme preview` and two Examples screens. Accent must not be green: green means incoming money.

## Spirit persona — third switch (chat only)
Mode of collection `Spirit persona` on a chat frame: neutral, analyst, trickster, caregiver. Changes the glow colors and the `voice/*` copy. See `foundations/voice.md`. Example: Examples → `03 · Spirit personas`.
