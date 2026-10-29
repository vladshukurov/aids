# Recipe: Profile

Spec: `specs/examples/profile.json` · archetype Object (the object is the person)

## When
"Profile", "me", personal details, the entry to settings and security.

## Structure
1. `TopBar`: Back; no title (the hero names the person).
2. Hero person: avatar 96 + name (`Title/Display 3`) + one-line caption with a fact ("ID verified · customer since Mar 2024").
3. No action row unless there is a real action on the person.
4. "Personal details": Phone, Email, Address — title = field, caption = value, chevron (edit).
5. "Security": Face ID (toggle, caption = when it is asked), Passcode, Devices, Log out (no chevron, caption "On this iPhone").
6. "App": Notifications, Appearance, Language — caption = current value.
7. Bottom chat: questions about the person's own data or safety ("Change my address", "Is my money safe?").

## Rules
- Profile is about the person. Account actions (Share IBAN, statements, close account) live on the account.
- Icons: grey plates with SF outline icons, one family (`components/icons.md`).
- Every value from persona.md → Profile. A value that is not there is not on the screen.
- Never a "Spirit" or "Assistant" section here: the bottom chat is the entry.
