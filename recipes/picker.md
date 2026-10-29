# Recipe: Picker (choose source, account or recipient)

Spec: the sheet in `specs/examples/send-confirm.json` · archetype Picker (full screen) or Sheet

## When
Choosing where money comes from or goes to: source, account, recipient, people for a split.

## Structure (full screen)
1. `TopBar`: close (×), mono title ("TOP UP FROM", "SEND TO").
2. `Search field` when the list can be long (people, banks).
3. Sections: "Recent" (last used, balance in the caption), "All sources" / "People" (rows), "Other ways" (by details, ask people).
4. Primary only for multi-select ("Split with 2"); single pick closes on tap.

## Structure (sheet, ≤ 4 options with consequences)
`overlay.sheet` over the screen it came from: title ("Pay from"), 2–4 radio rows with the consequence in the caption ("£0.00 · not enough money"), Primary that names the result ("Pay from Main").

## Rules
- Rows that open a next step have a chevron; rows that pick a value close the picker.
- Radios and checkboxes on the right. The person themself in a split is `locked`.
- Bank badge (`Sublogo`) only on accounts and people on re:verse.
- Empty state (no linked banks): `Empty state` with one Secondary action ("Link a bank").
