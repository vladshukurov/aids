# Icons

One family per screen: **SF outline** (`SF / *` without `.fill`) on grey avatar plates in rows and on buttons. Kit `Icon / *` mixes filled and outline — use it only for chevrons, arrows, ×, dots. In a spec: `"avatar": { "icon": "lock" }` or `"icon": "plus"` on an action.

Pick by meaning. The renderer logs an icon that isn't in the library; the full list is below (generated).

| Meaning | Icon |
|---|---|
| Passcode, security, blocked | `lock` |
| Face ID | `faceid` |
| Notifications | `bell` |
| Help, question | `questionmark.circle` |
| Appearance | `sun.max` |
| Language | `globe` |
| Phone | `phone` |
| Email | `envelope` |
| Address, delivery address | `house` |
| Devices | `iphone` |
| Log out | `rectangle.portrait.and.arrow.right` |
| Card, card payments | `creditcard` |
| Frozen | `snowflake` |
| Limits | `slider.horizontal.3` |
| Replace, repeat, subscriptions | `arrow.triangle.2.circlepath`, `repeat` |
| Delivery, parcel | `shippingbox` |
| Money in | `arrow.down.left` |
| Send, money out | `arrow.up` |
| Add, top up | `plus` |
| Declined, error | `xmark.circle` |
| Pace, budget trend | `chart.line.uptrend.xyaxis` |
| Date | `calendar` |
| Reminder | `clock` |
| News, tips | `sparkles` |
| Statements, documents | `doc.text` |

Never: an eye for a passcode, a document for the chat, the re:verse logo as a hint icon. Goals use `"avatar": { "goal": true }`, merchants their `merchant` avatar, people their photo.

<!-- generated:icons -->
## All icons in the library
Not generated yet: run the `sync-library` skill.
