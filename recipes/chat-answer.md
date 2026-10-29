# Recipe: Spirit chat answer

Figma examples: `Chat · one fact_example`, `Chat · numbers_example`, `Chat · money check_example`
Full rules: [../components/chat.md](../components/chat.md), voice: [../foundations/voice.md](../foundations/voice.md).

## Screen
Frame in `Color` mode `dark` with the Spirit glow background (clone the background from an example; never draw your own glow).
1. `StatusBar`, `Chat / Top bar` with the topic in mono caps (1–2 words: "SALARY", "OCTOBER").
2. `Chat / User message` (right).
3. Answer stack (itemSpacing 0, `Answer / Space` between parts by the pair rule).
4. 1–3 `Suggest Theme=Dark` above the input, `BottomBar`, `HomeIndicator`.

## Pick the answer shape
| Question | Shape | Example |
|---|---|---|
| One fact (when, how much) | Lead only: white answer + grey "what I'll do" | one fact |
| Compare / how am I doing | Lead + Number row (2–3) + Body | numbers |
| Move money | Lead + Check (from → to + amount + "method · fee · when") + three chips | money check |
| Explain, why | Plain Body text, 1–3 sentences, no Lead | — |
| List of objects | Lead + Cells (no chevrons) | — |

## Rules
- One main thought; at most one GUI piece.
- No full stop at the end of sentences.
- Money confirmation chips: "Send €40" / "Other amount" / "Cancel".
- Numbers must match the person's other screens.
