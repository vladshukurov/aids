# Recipe: Picker (choose source, account or recipient)

Figma example: `Source picker_example`

## Structure
1. `StatusBar`, `TopBar` with close (×) and a mono title ("TOP UP FROM").
2. Groups, each: section title (`Title/Title 3` or 17 Medium) + `Cell`s.
   - "Recent": last used sources with balance in the caption.
   - "All sources": categories (re:verse accounts, Banks, Crypto) with counts in the caption and chevrons.
   - "Other ways": transfer by details, ask people.
3. `HomeIndicator`.

## Rules
- Rows that open a next step have a chevron; rows that pick a value directly close the picker.
- In a bottom sheet version: `SheetBar Type=Title` + same Cells with `Checkbox Right`, no chevrons.
- Bank badge (`Sublogo`) only on accounts.
