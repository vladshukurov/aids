# Controls & feedback (v1.1)

Figma: Components → section `08 · Controls & feedback`. All on tokens and Theme radii; all switch with light/dark and re:verse/Atlas.

| Component | Use when | Key properties | Don't |
|---|---|---|---|
| Toggle | A setting that applies immediately (online payments, notifications) | State On/Off, Disabled | Use for choices that need a confirm button → Selection control |
| Selection control | Checkbox = several choices (who was there); Radio = one of many with a confirm button | Type Checkbox/Radio, State Off/On/Disabled/Locked (Locked = on and can’t change). Also exposed inside `Cell` as `Selection` (right) and `Selection Left` | Put it on the left in sheets |
| Progress | Goal progress, money back from a split, limits | Value 0/25/50/75/100 (nearest; or set Fill width to the exact %), Label, Value text, Labels | Color it green unless it is incoming money |
| Section header | Title above a group of rows | Title, Aside (boolean), Aside text ("View all", "€2,140", "2 pending") | Use caps or the mono title style |
| Badge | Short status: Neutral, Info (new), Warning (pending), Error (failed), Success (received money only) | Type, Label (mono caps, 1–2 words) | Use as a button |
| Divider | Hairline between groups; Inset=True starts after the avatar | Inset | Put between rows of one group |
| Empty state | Empty list or first-time state | Title, Text, Icon (swap), Action (boolean; exposed Secondary button) | Add a Primary if the screen has another action |
| Alert | Irreversible action: block card, delete goal, leave without saving | Type Default/Destructive, Title (question), Message (consequence), exposed Action and Cancel buttons | Use for reversible actions — do them and offer Undo |
| Search field | Top of a picker or list | State Default/Typing, Text | Put it inside a sheet title |
| Avatar group | People in a split or shared goal | Count 2/3/4 (more → 3 + Default "+N") | Mix photos and names inconsistently |
| Page dots | Card carousel position (3 items) | Active 1/2/3 | Use for steps of a flow |
| Cell / Skeleton | Loading rows | — (stack 3–5) | Combine with a spinner |

## Notes
- Variant sets share text-property defaults, so the canvas shows the same label on every variant ("DRAFT", "0%"). Always set the text properties.
- A row with a toggle: an auto-layout row (text left `Body/Medium`, `Toggle` right), padding 12 top/bottom.
- Alert overlay: full-screen rectangle `background/overlay` + Alert centered, 40 from the sides.
