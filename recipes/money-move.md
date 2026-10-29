# Recipe: Send / Top up money (amount → confirm)

Figma examples: `Amount entry_example`, `Confirm_example`

## Screen 1: Amount
1. `StatusBar`, `TopBar` (back, mono title "TOP UP AMOUNT" / "SEND").
2. Source pill: `Avatar` 24 + "CashApp · $2,140.12 ›" (tap → picker).
3. `Amount` hero, caption under it: method · fee · speed ("Free · Arrives instantly").
4. Preset `Chip`s: 3 amounts + "Max".
5. Confirm round button, then `Keyboard` at the bottom.

## Screen 2: Confirm
1. `StatusBar`, `TopBar` (Back on, Title "SEND" / "TOP UP", Subtitle off, Right action off).
2. From → to: two `Cell`s (source with balance in the caption, destination with "On re:verse" or the bank) joined by `Icon / arrow-down`. No chevrons, no right block.
3. `Label/Hero` "You send" / "Top up amount" + amount `Title/Display 3` (`text/primary`, never green) + `Body/Small` caption: method · fee · when · balance after ("Free · arrives instantly · Main after €1,300.00", or "card balance after $331.65").
4. Spacer (content fills), `Button Type=Primary Size=l` "Send €40", `HomeIndicator`.

## Face ID
Needed only when money leaves re:verse (SEPA to another bank, crypto out). Then tapping the Primary shows the system Face ID sheet over this same screen — draw it as a separate state frame "· Face ID" if asked. To a re:verse user (Anna) or between own accounts: no Face ID. See `foundations/persona.md` for who is where.

## Rules
- IMPORTANT: no success screen. After confirming, the person lands on the destination object (card or account) showing the new balance; undo is an "Undo" chip.
- Money leaving re:verse → Face ID before sending. Between own re:verse accounts → no Face ID.
- Numbers: source balance − amount and destination balance + amount must match on the next screen.
- Caption formula everywhere: method · fee · when.
