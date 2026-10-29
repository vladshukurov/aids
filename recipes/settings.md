# Recipe: Settings list

Spec: `specs/examples/notifications.json` · archetype List

## When
Any screen of switches or preferences: notifications, privacy, card controls, a settings menu.

## Structure
1. `TopBar`: Back, title in mono caps ("NOTIFICATIONS").
2. 2–4 sections named by what the person cares about ("Payments", "Budget and goals", "Email"), 2–5 rows each.
3. Rows: toggle rows for settings that apply at once; action rows (chevron) for settings that open a choice; caption = what exactly happens or the current value.
4. No bottom CTA: switches save themselves. Bottom chat is optional.

## Rules
- A toggle applies immediately → no Save button, no confirmation.
- A choice of several values → action row with the current value as caption → a sheet with radios.
- Captions are concrete: "To alex.morgan@mail.de on the 1st", not "Email notifications".
- A settings *menu* (rows that open sub-screens) is the same recipe with action rows only.
