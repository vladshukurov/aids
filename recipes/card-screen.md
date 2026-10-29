# Recipe: Card screen

Figma example: `Card screen_example`

## Structure
1. `StatusBar`, `TopBar` with "CARD DETAILS".
2. `Segmented control` Physical / Virtual.
3. `Card Size=L` hero (Layout E for physical, F for virtual).
4. Row: caption "Physical card · USD" + balance `Title/Title 2` on the left; two round actions (Details, Freeze) on the right.
5. Buttons: `Primary` "Add money" + `Secondary` "Send", side by side.
6. "Transactions" + "View all", transaction Cells.
7. Suggestions row + `BottomBar`, `HomeIndicator`.

## Variations
- Frozen: `Card Frozen=true`, caption "Frozen · payments are blocked", Primary becomes "Unfreeze".
- Details: `Show details=true`, copy actions on rows.
