# Recipe: Account

Spec: `specs/examples/account-usd.json` · archetype Object

## When
An account, its balance, sub-accounts or wallets, what moved in and out.

## Structure
1. `TopBar`: Back, Avatar on; no title (the hero names the account).
2. Hero amount: label = account name ("USD account"), amount = balance, caption = a fact about it ("3 wallets · card •••• 0020").
3. Action row, pair: "Top up" / "Send" + "···" (details, IBAN, statements, close account live there).
4. Section with the parts of the balance: "Wallets" / "Distribution" with the total in the aside; one money row per part (`Avatar Type=Currency`), no chevrons.
5. Section "Transactions", aside "View all": 3–5 money rows from persona.md.
6. Bottom chat: 1–2 questions about this account.

## Rules
- Sub-account balances add up to the hero balance.
- Amounts right-aligned, no chevrons on rows with amounts; balances have no sign, payments carry "−", money in "+" (green).
- Account details, QR, close account live under "···", not on the screen.

## Variations
- Empty account (Pounds £0.00): hero £0.00, action row "Top up" single Primary, `Empty state` instead of transactions ("No payments yet").
- Main account (EUR): same structure; "Coming up" section with the salary (€2,400 today) is a good second section.
