# Anti-patterns

Signs that a screen looks assembled instead of designed. Check your screenshot against this list before calling the critic.

## Wireframe look
| Sign | Fix |
|---|---|
| Content stops in the top half, a spacer pushes the button down | Add the sections this object really has (layout.md §1), or make it a Sheet |
| A section with one row | Merge it into another section or turn it into a row elsewhere |
| Captions that say nothing ("Details", "Requested · just now") | Caption = fact or consequence: "Online €2,800 a month", "Pays back in re:verse" |
| Hero is small (avatar 48–72, name 32) next to the list | Hero ≥ 36 for names, Display 2/64 for amounts, or the card L; avatar 96 on profile-like heroes |
| Everything has the same weight | One hero, then 17 Medium section titles, then rows — nothing else big |
| A lonely button floating after the last section | Put it 24 below the last group inside the same block |

## Craft slips
| Sign | Fix |
|---|---|
| Outline and filled icons mixed in one list | One family per screen: kit `Icon / *` (outline) or SF outline; filled only for categories in coloured plates |
| Icon doesn't mean the row (eye for passcode, document for chat) | Pick by meaning: shield for passcode, question mark for help, bells for notifications |
| Label truncated or touching the pill edge | Shorten the copy (1–2 words), never shrink the type |
| Suggestions row overflowing the screen | ≤ 2 suggestions on base screens, each ≤ 3 words |
| Bottom chat overlapping the last content | Bottom space = Bottom chat height − 16 |

## Product slips
- "Spirit" or its logo in base UI (section titles, captions) → say "Assistant" or describe the setting.
- Account actions on a profile (Share IBAN) → profile actions are about the person (My details, Limits).
- Invented or decorative data (city next to email, "EUR · Main account" for a currency setting) → only facts the row needs.
- Alert for a choice with options → Option sheet.

## These are our brand, not AI clichés
Mono captions and mono caps titles, the middle dot "·" in captions, two-tone sentences (home feed and chat only), pill buttons, grey icon plates. Keep them; generic "anti-slop" advice doesn't apply to them.
