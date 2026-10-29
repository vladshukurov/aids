# Recipes

A recipe says which blocks a screen type has, in which order, with which data. Each has a ready spec in `specs/examples/` — copy the closest one and change the content. Figma `_example` frames on the Examples page show older hand-built versions; the specs are the current standard.

| Request sounds like | Recipe | Spec to start from |
|---|---|---|
| account, balance, wallet, sub-accounts | [account.md](account.md) | `specs/examples/account-usd.json` |
| card, card details, freeze / block / replace card | [card-screen.md](card-screen.md) | `scenarios/freeze-card.json` (c1, c4) |
| profile, me, personal details | [profile.md](profile.md) | `specs/examples/profile.json` |
| settings, notifications, privacy, any list of switches | [settings.md](settings.md) | `specs/examples/notifications.json` |
| transactions, history, payments list | [transactions.md](transactions.md) | `specs/examples/transactions.json` |
| goal, savings, "Spain trip" | [goal.md](goal.md) | `specs/examples/goal.json` |
| choose source / account / recipient, picker, list in a sheet | [picker.md](picker.md) | `specs/examples/send-confirm.json` (sheet) |
| send money, top up, enter amount, confirm payment | [money-move.md](money-move.md) | `specs/examples/send-confirm.json` |
| home, feed, "what's new", insight | [home-feed.md](home-feed.md) | — (component blocks, see recipe) |
| Spirit, chat, AI answer, assistant | [chat-answer.md](chat-answer.md) | `specs/examples/chat-*.json` |

No match → pick the nearest recipe, say which one you used and why. When the screen ships (critic ≥ 8), write the new recipe and add its spec to `specs/examples/`.

## Shared screen rules
- Frame 402×874 (taller when content needs it), `background/primary`, vertical auto layout, clip. The renderer does this.
- `StatusBar` first, `HomeIndicator` last.
- Spacing: `foundations/layout.md` §3.
- One Primary per light screen.
- Data from `foundations/persona.md` only: one person (Alex Morgan), numbers that add up across screens.
