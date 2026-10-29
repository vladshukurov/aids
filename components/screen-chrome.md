# Screen chrome: StatusBar, TopBar, Title, HomeIndicator

## Screen frame
- 402×874 (variables `Platform/width`, `Platform/height`), fill `background/primary`, vertical auto layout, clip content.
- Order: `StatusBar` → `TopBar` (if the screen has navigation) → content → bottom CTA → `HomeIndicator`.

## StatusBar
IMPORTANT: on every screen, first child, time 9:41. Never draw your own.

## TopBar
| Property | Type | Default | Use |
|---|---|---|---|
| Back | boolean | true | chevron button on the left |
| Right action | boolean | false | round icon button on the right (Secondary). Make it Primary only on a screen without a bottom Primary |
| Avatar | boolean | false | profile photo on the right (home, account) |
| Title (nested, exposed) | text | "Title" | mono caps, 1–2 words: "SEND", "CARD DETAILS". IMPORTANT: always set it or the audit flags a placeholder |
| Subtitle (nested) | boolean | true | turn off unless the screen needs a second line |
| Subtitle text (nested) | text | | |

## Title
The same mono title as a standalone component (under TopBar on settings-like screens). Properties: Title, Subtitle, Subtitle text.

## HomeIndicator
Last child of every full screen. In sheets it sits at the sheet bottom.
