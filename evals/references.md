# Reference screens per archetype

What the screen-critic compares against. All references live in this repo's Figma file (`qUknPCIey4DG3PH19e1OmD`), so everyone with access to the file can use them. Golden renders of `specs/examples/*` are the current standard; the hand-built `_example` frames show the product look they come from.

| Archetype | Reference | Where |
|---|---|---|
| Object (account) | `Account_example`; golden `USD account` | Examples · 21:26776; golden 82:3520 |
| Object (card) | `Card screen_example`; golden `C1 · Card frozen`, `C4 · Card after` | Examples · 21:26527; golden table below |
| Object (profile-like) | golden `Profile` | golden table below |
| List (settings) | golden `Notifications` | golden table below |
| Picker / Sheet | `Source picker_example`; golden `Send · pay from` | Examples · 21:27134; golden table below |
| Amount / confirm | `Amount entry_example`, `Confirm_example`; golden `Send · confirm` | Examples · 21:27409, 31:5165 |
| Chat | `Chat · money check_example`, `Chat · numbers_example`, `Chat · one fact_example`, personas | Examples · 21:27763, 21:27681, 21:27608, 46:2134 |
| Home | `Home feed_example` | Examples · 21:26447 |

After each `run-evals`, update the table below so critics find the latest golden frames.

## Latest golden frames (29 Oct, renderer 015658da2d3d)
| Screen | Frame id | Spec |
|---|---|---|
| Profile | 82:2211 | specs/examples/profile.json |
| Profile · Atlas | 89:3838 | same spec, `--theme Atlas` |
| Notifications | 82:2961 | specs/examples/notifications.json |
| USD account | 82:3520 | specs/examples/account-usd.json |
| Send · confirm / pay from | 86:3837, 86:3988 | specs/examples/send-confirm.json |
| C1–C4 Freeze card | 91:4069, 91:4784, 91:5396, 91:5720 | scenarios/freeze-card.json |
| Chat · one fact / numbers | 86:6530, 86:6627 | specs/examples/chat-salary.json, chat-food-october.json |
| Chat · money check (neutral, caregiver), after | 86:6739, 86:6952, 86:7135 | specs/examples/chat-spain-topup.json |
| Chat · money check (analyst, trickster) | 96:5972, 96:6190 | same spec, `persona` changed |
| Spain trip (goal) | 96:4070 | specs/examples/goal.json |
| Transactions | 96:6455 | specs/examples/transactions.json |
| C1 · Atlas | 96:5386 | scenarios/freeze-card.json c1, `theme: Atlas` |
