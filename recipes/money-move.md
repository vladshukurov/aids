# Recipe: Send / Top up money (amount → confirm)

Spec: `specs/examples/send-confirm.json` (confirm + pay-from sheet) · Figma: `Amount entry_example`, `Confirm_example`

## Screen 1: Amount (archetype Amount)
1. `TopBar`: Back, mono title "SEND" / "TOP UP".
2. Source pill: who pays ("Main account · €1,340.00 ›"; tap → picker).
3. `Amount` hero, caption under it: method · fee · speed ("Free · arrives instantly").
4. Preset `Chip`s: 3 amounts + "Max" (only on this screen).
5. `bottom.keyboard`. The Primary "Send €40" sits above the keyboard and looks disabled until an amount is typed.
No block for the source pill and the Amount yet: use `{ "component": … }` blocks and say so in the report.

## Screen 2: Confirm (archetype Confirm)
1. `TopBar`: Back, title "SEND" / "TOP UP".
2. `fromTo`: source (balance in the caption) → destination ("On re:verse · by phone" or the bank). No chevrons on these rows, except the source when it can be changed (→ sheet).
3. Hero amount: label "You send", amount (never green), caption: method · fee · when · balance after ("Free · arrives instantly · Main after €1,300.00").
4. `bottom.cta`: "Send €40".

## Face ID
Only when money leaves re:verse (SEPA to another bank, crypto out): tapping the Primary shows the system Face ID sheet over this screen — a separate state frame "· Face ID" if asked. To a re:verse user (Anna) or between own accounts: no Face ID.

## Rules
- IMPORTANT: no success screen. After confirming, the person lands on the destination object (account, goal, person) showing the new balance; undo is an "Undo" chip.
- Numbers: source − amount and destination + amount match on the next screen.
- Caption formula everywhere: method · fee · when.
