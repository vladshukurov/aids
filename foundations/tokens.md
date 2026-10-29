# Tokens

All values in the Figma file are variables. IMPORTANT: bind every fill, stroke, radius, gap and padding to a variable. A raw hex or number is a bug unless the table below says otherwise.

## Collections
| Collection | Modes | What it holds | Bind to it? |
|---|---|---|---|
| Color | light, dark | Semantic colors by role: background, fill, text, icon, border, components/* | Yes, always for color |
| Theme | re:verse, Atlas | Brand layer: action and accent colors, radius roles, font families | Radius roles yes; colors through Color |
| Size | Value | space/2…80, space/screen margin, radius scale | Yes for gaps and padding |
| Type | Value | Font family, size and weight roles used by text styles | Through text styles |
| Spirit persona | neutral, analyst, trickster, caregiver | Spirit glow colors per persona | Only inside Spirit glow components |
| Platform | iOS, Android | Screen width/height (402×874 on iOS) | Frame size |
| Primitives / Color, Primitives / Type | Value | Raw palette and type scale | IMPORTANT: never bind directly. Hidden from pickers |

## Which color for what
| You are coloring | Token |
|---|---|
| Screen background | `background/primary` |
| Grouped area behind lists and cards | `background/secondary` |
| Sheet, popover | `background/elevated`, sheet fill `fill/sheet` |
| Dim behind a sheet | `background/overlay` |
| Main text | `text/primary` |
| Captions, grey half of a two-tone sentence | `text/secondary` |
| Disabled text, placeholder | `text/tertiary` |
| Incoming money amount (+€120) | `text/positive`. IMPORTANT: never for anything else |
| Error message | `text/error` |
| Text on dark imagery or the chat gradient | `text/on dark/primary`, `text/on dark/secondary` |
| Icons | `icon/primary`, `icon/secondary`, `icon/tertiary` |
| Row divider, field outline | `border/subtle` |
| Glass controls in chat | `fill/glass` + effect style `Blur/Glass` + stroke `border/glass` |
| Accent dot or highlight | `fill/accent` / `text/accent`. Small doses |

Buttons, chips, badges and toggles already carry their colors. Do not recolor component instances.

## Spacing
- Screen side padding: `space/screen margin` (16).
- Between rows in a list: 0 (Cell has its own height). Between groups: `space/28`.
- Section title → content: `space/12`. Hero → actions: `space/24`.
- Bottom CTA: 16 from the sides, sits above `HomeIndicator`.
- Use only the scale: 2, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80.

## Radius
| Element | Token |
|---|---|
| Buttons, chips, suggestions, round actions | Theme `radius/control` |
| Text fields, selects, chat bubbles | Theme `radius/field` |
| Cards (L/M), content cards | Theme `radius/card` |
| Bottom sheets (top corners) | Theme `radius/sheet` |
| Avatars and other circles | `radius/full` |

## Allowed raw values
- Icon pixel geometry inside icon components.
- Card art and photos (images, gradients inside `Card / Art`).
- 1px hairline thickness.

## Naming
`group/role[/state]`, lowercase, spaces allowed: `text/on dark/secondary`. Code syntax is set on every variable: Web `var(--color-text-primary)`, iOS `colorTextPrimary`.
