# Screen chrome: StatusBar, TopBar, Title, HomeIndicator

## Screen frame
- 402×874 (variables `Platform/width`, `Platform/height`), fill `background/primary`, vertical auto layout, clip content.
- Order: `StatusBar` → `TopBar` (if the screen has navigation) → content → bottom CTA → `HomeIndicator`.

## StatusBar
IMPORTANT: on every screen, first child, time 9:41. Never draw your own.

## TopBar
Back or close on the left, optional `Avatar` on the right (property Avatar). Title text is not inside TopBar: put a title or hero in the content.

## Title
Mono screen title with optional Subtitle. Use for system-like screens (settings, sheets). Product screens use a hero instead (sentence or amount, `Title/Title 1`).

## HomeIndicator
Last child of every full screen. In sheets it sits at the sheet bottom.
