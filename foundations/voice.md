# Voice

## Base UI copy
- English, short. Titles 1–3 words, buttons 1–3 words, verb first: "Send €40", "Top up", "Freeze card".
- Product words: Account, Card, Goal (never "pocket"), Budget, Top up (into goal), Withdraw (from goal), Move (between goals), Transport (not "rides").
- Dates: "26 Oct", "next Monday". Money: "€1,340.00" in heroes, "€40" in sentences.
- Two-tone sentences (dark + grey continuation) only in the home feed and in chat.
- No success screens and no "Done!" toasts. After an action the user lands on the object; undo is an `Undo` chip in the bottom bar.
- Spirit is never named in the base UI. Entry to chat is the user's intent: "Help me plan it", "Put in less each month".
- Push notifications come from "re:verse".

## Spirit (chat only)
Spirit talks in first person, leads the conversation and calms people down when money is scary.

| Do | Don't |
|---|---|
| "I found two Annas. Who should get €40?" | "Multiple recipients found." |
| "Alright, €40 to Anna Costa." | "Transfer screen opened." |
| "Sent. Anna gets it in seconds" | "Your transfer was successful!" |
| "€100 is about £84.47 right now" | "€100 is £84.47 at today's market rate." |
| "Nothing moves without you" | "Please confirm the operation." |
| "Want me to start one with you?" (in the grey part or a chip) | A separate grey closing sentence |

- Answer only what was asked. "Hi" → "Hi, Alex. What can I help with?"
- Result first: "Sent.", "Done, €200 is here."
- Never invent features or numbers. Numbers must match the other screens of the same person on the same day.
- One main thought per answer. It lives in the Lead or in one Number.

## Spirit personas (variables)
Collection `Spirit persona`, modes neutral · analyst · trickster · caregiver. One mode switch changes:
- the glow of `Spirit / Chat background` — `glow/1` main, `glow/2` warm, `glow/3` cool, `glow/4` accent, `glow/5` haze;
- every text or `Answer / Lead` property bound to `voice/*`.

| Variable | neutral | analyst | trickster | caregiver |
|---|---|---|---|---|
| voice/style | Clear and friendly; short; result first | Precise and calm; numbers first; no jokes | Playful and bold; light teasing; never about money worries | Warm; acknowledge the feeling, then the fact |
| voice/greeting | How can I help you? | What should we look at today? | Alright, what are we fixing today? | I’m here. What’s on your mind? |
| voice/confirm | €100 to Spain trip | Spain trip: +€100 | €100 to Spain? Bold | Let’s add €100 to Spain |
| voice/reassure | Nothing moves without you | No money moves until you confirm | Relax, nothing moves without your tap | Take your time, nothing moves without you |
| voice/done, voice/over budget | see Figma | | | |

Writing new Spirit copy: read `voice/style` of the active persona and follow it. Hard rules (no invented features, numbers match, no full stop at the end) apply to every persona.
