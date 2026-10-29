# Recipe: Spirit chat answer

Figma examples: `Chat · one fact_example`, `Chat · numbers_example`, `Chat · money check_example` (product screens with absolute layout — read them for content and spacing, but build yours with auto layout as below).
Full rules: [../components/chat.md](../components/chat.md), voice: [../foundations/voice.md](../foundations/voice.md), data: [../foundations/persona.md](../foundations/persona.md).

## Screen
402×874 frame, `Color` mode `dark`, vertical auto layout, clip.
1. `Spirit / Chat background` — first child, absolute at 0,0. Never draw your own glow, gradient or fade mask.
2. `StatusBar`, `Chat / Top bar` (exposed Title: topic in mono caps, 1–2 words, e.g. "SPAIN TRIP"; Subtitle off).
3. Messages wrapper (vertical, padding 16, fills the remaining height, content aligned to the bottom):
   `Chat / User message` (right) → `Answer / Space` 28 → answer parts.
4. Row of 1–3 `Suggest Theme=Dark` (gap `space/8`, padding 16).
5. `BottomBar` with `Suggestions` **off**, then `HomeIndicator`.

## Pick the answer shape
| Question | Shape | Example |
|---|---|---|
| One fact (when, how much) | Lead only: white answer + grey "what I'll do" | one fact |
| Compare / how am I doing | Lead + Number row (2–3) + Body | numbers |
| Move money (send, top up a goal, exchange) | Lead + Check + three chips | money check |
| Explain, why | Plain Body text, 1–3 sentences, no Lead | — |
| List of objects | Lead + Cells (no chevrons) | — |
"Confirm X" means the Check before the money moves, unless the request says "after" / "done".

## Lead (two-tone)
`Answer / Lead` has one text node: white part, line break, grey part. Setting `characters` resets the colors, so re-apply them:
```js
const t = lead.findOne(n => n.type === 'TEXT');
const segs = t.getStyledTextSegments(['fills']);           // [white, grey] before editing
const white = segs[0].fills, grey = segs[segs.length - 1].fills;
for (const s of t.getStyledTextSegments(['fontName'])) await figma.loadFontAsync(s.fontName);
const a = 'Alright, €100 to Spain trip', b = 'It lands at €500 of €3,500';
t.characters = a + '\n' + b;
t.setRangeFills(0, a.length, white); t.setRangeFills(a.length + 1, t.characters.length, grey);
```
Length: each part max ~28 characters so the Lead stays within 2–3 lines when a block follows. Shorten the grey part first. No full stop at the end of either part.

## Check (money moves)
`Answer / Check` properties: `Label`, `Amount`, `Caption`; exposed Cells `From` and `To`.
| Case | Label | Caption | To cell avatar | Chips | Face ID |
|---|---|---|---|---|---|
| Send to a re:verse user | You send | BY PHONE · NO FEE · INSTANT | Avatar Image (person) | Send €40 / Other amount / Cancel | no |
| SEPA to another bank | You send | SEPA INSTANT · NO FEE · ARRIVES IN SECONDS | Avatar Default | Send €120 / Other amount / Cancel | yes |
| Top up a goal | You top up | NO FEE · INSTANT | Avatar `Style=Goal, Type=Transaction` | Top up €100 / Other amount / Cancel | no |
| Exchange | You exchange | 1 EUR = 0.84 GBP · NO FEE · INSTANT | Avatar Currency | Exchange €200 / Change amount / Cancel | no |
From cell: account name, balance in the caption, Avatar `Style=Re:verse`.

## After the action ("done")
New answer under the person's chip message: Lead "Moved / Spain trip has €500 of €3,500" (or "Sent / Anna gets it in seconds") + one receipt `Cell`. No success screen, no extra chips except "Undo".
