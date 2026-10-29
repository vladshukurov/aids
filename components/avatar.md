# Avatar, Sublogo

Figma: `Avatar`, `Sublogo` · search: "avatar", "merchant icon", "currency icon"

## Properties
| Property | Values | Use |
|---|---|---|
| Type | Avatar | People. `Style=Image` for a photo, `Style=Default` (initials) for people not on re:verse |
| Type | Currency | Accounts by currency: `Style=Euro, Dollar, Pound, USDT, USDC` |
| Type | Transaction | Merchants and categories: `Style=Food, Market, Home, Car, Netflix, Revolut, Coinbase, CashApp, Bells, Send, Plus, Re:verse` |
| Sublogo | boolean | Bank badge in the corner. IMPORTANT: default is on — turn it off for merchants and people not on re:verse |

Goals: `Style=Goal, Type=Transaction` (target icon). Style values exist only with their Type: set both together, e.g. `{Style:'Euro', Type:'Currency'}`.

All Style values: Goal, Default, Image, Re:verse, Euro, Dollar, USDT, USDC, Pound, Send, Plus, Market, Food, Home, Car, Revolut, Bells, Netflix, Coinbase, CashApp.

`Sublogo` set: `Type=Re:verse, Revolut, Coinbase, Cash App, ETH, TRX, Pocket`.

## Rules
- Size is 48 inside Cell. Don't resize avatars in rows.
- One photo per name across the whole flow.
- The re:verse sublogo only marks re:verse accounts and people who use re:verse.
- Never use the re:verse logo as a generic hint icon; hints use `SF / *` icons by meaning (calendar = date, sparkles = help, clock = reminders, chart.line.uptrend = pace).
