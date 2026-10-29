# Sheets: SheetBar, Sheet - Full Screen, Top up / From

## Bottom sheet anatomy
1. Overlay over the screen: rectangle `background/overlay` full size.
2. Sheet frame: fill `fill/sheet`, top corners Theme `radius/sheet`, vertical auto layout, width 402, hug height.
3. `SheetBar` first (`Type=Title` with Title text, or `Default` for grabber only).
4. Content: `Cell` options, fields or a short text.
5. Button(s) at the bottom, then `HomeIndicator`.

## Rules
- Options in a sheet: `Cell` with `Checkbox Right`, no chevrons.
- One Primary at the bottom if the sheet needs confirmation; a pick-one list closes on tap and needs no button.
- In a dark context (chat) the sheet inherits dark mode: set `Color` mode `dark` on the sheet frame.
- Title in sentence case, 1–3 words: "Top up from", "Choose account".

## Sheet - Full Screen
402×812 container for full-height flows (Top up, Send). `Keyboard` boolean adds the numpad, `Swap` swaps the inner content.

## Top up / From
Ready-made sheet. `Bank=Linked` (has linked banks) or `None` (empty state). Use as is.
