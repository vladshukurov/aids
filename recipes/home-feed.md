# Recipe: Home feed

Figma example: `Home feed_example` · archetype Home. No spec yet: the header and the peek have no blocks; build the statement with `{ "statement": [...] }` and the rest with `component` blocks.

## When
Home screen, "what's new", an insight or event that the product wants the person to notice.

## Structure (top to bottom)
1. `StatusBar`
2. Header row: total balance label + amount on the left (`Caption/Small` label, `Body/Medium` amount, `text/positive` delta only if it is income), bell and avatar on the right.
3. Statement: two-tone sentence, `Title/Title 1`: the dark part states the fact, the grey part (`text/secondary`) is what the person can do. 2–3 lines.
4. One related object: an amount hero (`Title/Display 3`) with a mono label, or one `Cell`.
5. 1–2 `Suggest Theme=Light` that open the chat with that intent ("Plan with Spirit" is wrong — never name Spirit; use "Plan the month").
6. The next statement peeks from below (cut by the bottom bar).
7. Quick suggestions row + `BottomBar` (chat input), `HomeIndicator`.

## Rules
- No banners, no cards, no carousels on home. A new feature appears as a statement.
- One statement = one fact. Most urgent first.
- Green only for incoming money in the hero ("+€2,400.00" salary).
