# Recipe: Account

Figma example: `Account_example`

## Structure
1. `StatusBar`, `TopBar` (back, account name in mono caps, avatar).
2. Label "re:verse · +4%" (`Caption/Small`), balance hero `Title/Display 3` or `Title/Title 1`.
3. Cards row: `Card Size=S` thumbnails + a plus tile to add a card.
4. Actions: `Button Type=Primary Size=m` "Top up" + `Secondary` "Send" + a round "···" more button.
5. Section header "Distribution" (left) + "Add new" (right, `text/secondary`).
6. Sub-accounts as `Cell`: `Avatar Type=Currency`, name, currency code caption, amount right, no chevron.
7. Section "Transactions" + "View all", 3–5 transaction Cells.
8. Suggestions row + `BottomBar`, `HomeIndicator`.

## Rules
- Balances of sub-accounts add up to the hero balance.
- Amounts right-aligned, no chevrons on rows with amounts.
- Account details, QR, close account live under "···", not on the screen.
