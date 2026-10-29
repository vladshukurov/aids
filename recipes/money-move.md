# Recipe: Send / Top up money (amount → confirm)

Figma examples: `Amount entry_example`, `Confirm_example`

## Screen 1: Amount
1. `StatusBar`, `TopBar` (back, mono title "TOP UP AMOUNT" / "SEND").
2. Source pill: `Avatar` 24 + "CashApp · $2,140.12 ›" (tap → picker).
3. `Amount` hero, caption under it: method · fee · speed ("Free · Arrives instantly").
4. Preset `Chip`s: 3 amounts + "Max".
5. Confirm round button, then `Keyboard` at the bottom.

## Screen 2: Confirm
1. `StatusBar`, `TopBar` (back, "TOP UP").
2. From → to: two `Cell`s (source with balance, destination card/account) joined by a small arrow.
3. Label "Top up amount" + amount `Title/Display 3` + caption "Free · arrives instantly · card balance after $331.65".
4. Spacer, `Button Type=Primary Size=l` "Top up" (label may carry the amount), `HomeIndicator`.

## Rules
- IMPORTANT: no success screen. After confirming, the person lands on the destination object (card or account) showing the new balance; undo is an "Undo" chip.
- Money leaving re:verse → Face ID before sending. Between own re:verse accounts → no Face ID.
- Numbers: source balance − amount and destination balance + amount must match on the next screen.
- Caption formula everywhere: method · fee · when.
