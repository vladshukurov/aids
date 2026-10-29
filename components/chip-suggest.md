# Chip, Suggest

## Chip
Figma: `Chip` · search: "chip", "filter"
Selectable option or filter. `Type=Default | Selected | On card | On card small`, `Label` text, `Dot` boolean.
- Filters above a list: a horizontal row, 8 gap, scrolls sideways.
- `On card small`: badges on a card (USD, Virtual), 26 high.

## Suggest
Figma: `Suggest` · search: "suggest", "suggestion", "follow-up"
A suggestion that sends its text as a message to the Spirit chat.
| Property | Values |
|---|---|
| Label | text, up to 6 words, in the person's voice, with the amount if any |
| Theme | Light (home feed, light screens), Dark (chat) |
| State | Default, Pressed, Disabled |
| Dot | boolean |

## Rules
- IMPORTANT: a suggestion is a message, never an interface action. No "Copy", "Share", "Open" chips.
- In chat: chips sit above the input (`BottomBar`), never inside the answer and never under choice rows.
- Usually 1–2, max 4. Money confirmation: exactly three — action with amount → other amount → Cancel.
- Never duplicate a row that is already tappable above.
- Home feed: under each statement, 1–2 Light suggestions that open the chat with that intent.
