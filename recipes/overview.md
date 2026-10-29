# Recipes

Each recipe has a Figma example component on the Examples page (search `<name>_example`). Start from the closest example: read its structure, then build your screen from instances in the same order. Never copy-detach the example.

| Request sounds like | Recipe | Figma example |
|---|---|---|
| home, feed, "what's new", insight | [home-feed.md](home-feed.md) | Home feed_example |
| account, balance, wallet, sub-accounts | [account.md](account.md) | Account_example |
| card, card details, freeze card | [card-screen.md](card-screen.md) | Card screen_example |
| choose source / account / recipient, picker, list in a sheet | [picker.md](picker.md) | Source picker_example |
| send money, top up, enter amount, confirm payment | [money-move.md](money-move.md) | Amount entry_example, Confirm_example |
| Spirit, chat, AI answer, assistant | [chat-answer.md](chat-answer.md) | Chat · one fact / numbers / money check_example |

No match → pick the nearest recipe, say which one you used and why.

## Shared screen rules
- Frame 402×874, `background/primary`, vertical auto layout, clip.
- `StatusBar` first, `HomeIndicator` last.
- Content side padding 16 (`space/screen margin`).
- One Primary per light screen.
- Real-looking data: one person (Alex Morgan), EUR by default, numbers that add up across screens.
