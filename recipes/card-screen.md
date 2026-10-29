# Recipe: Card screen

Figma example: `Card screen_example`

## Structure
1. `StatusBar`, `TopBar` with "CARD DETAILS".
2. `Segmented control` Physical / Virtual.
3. `Card Size=L` hero (Layout E for physical, F for virtual). It is 320 wide: center it (content `counterAxisAlignItems=CENTER`).
4. Row: caption "Physical card · USD" + balance `Title/Title 2` on the left; two round actions (Details, Freeze) on the right.
5. Buttons: `Primary` "Add money" + `Secondary` "Send", side by side.
6. "Transactions" + "View all", transaction Cells.
7. Suggestions row + `BottomBar`, `HomeIndicator`.

## Variations
- Frozen: `Card Frozen=true`, caption "Frozen · payments blocked", Primary becomes "Unfreeze", suggestions "Undo" / "I lost it". Freezing is reversible: no confirmation.
- Blocked: same frozen art + `Badge Type=Error` "Blocked", `Progress` for the new card delivery, row with the virtual card that keeps working. Blocking is irreversible: `Alert Type=Destructive` before it. Full flow: `scenarios/freeze-card.md`.
- Details: `Show details=true`, copy actions on rows.
