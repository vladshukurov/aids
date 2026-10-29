# Button

Figma: `Button` (component set) · search: "button", "primary button"

## Use when
- The screen has one main action → `Type=Primary, Size=l`, full width at the bottom.
- An alternative to the main action → `Secondary`.
- A low-emphasis way out ("Not now", "Skip") → `Ghost`.
- A destructive action (Freeze, Delete, Close account) → `Error`.

## Don't use when
- The action is a reply in the chat → `Suggest`.
- It is a quick action under a balance → `Action button`.
- It opens an object from a row → tap on the `Cell` itself.

## Properties
| Property | Type | Values | Default |
|---|---|---|---|
| Type | variant | Primary, Secondary, Ghost, Error | Primary |
| Size | variant | l (56, full width CTA), m (inline), s (in rows) | l |
| Label | text | 1–3 words, verb first | "Button" |
| Icon Left / Icon Right | boolean | | false |
| → Icon Left / → Icon Right | instance swap | any `Icon / *` | |

## Rules
- IMPORTANT: max one `Primary` on a light screen. On dark screens (chat, dark mode) Primary turns light automatically; still one.
- Label carries the amount when money moves: "Send €40", "Top up €100".
- Bottom CTA: `Size=l`, `layoutSizingHorizontal=FILL`, 16 from screen edges, above `HomeIndicator`.
- Two stacked bottom buttons: Primary on top, Ghost below. Never two Primaries.
- Colors and radius come from Theme. Never recolor an instance.

## Correct / wrong
| Correct | Wrong |
|---|---|
| "Send €40" Primary + "Not now" Ghost | Two Primary buttons |
| `Error` "Freeze card" | Primary with red label |
| Chat follow-ups as `Suggest` | Buttons inside a chat answer |
