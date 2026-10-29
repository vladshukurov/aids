# Amount, Keyboard, Action button, Segmented control

## Amount + Keyboard
Big money entry for Send, Top up, Move. `Amount` shows currency and number centered; `Keyboard` sits at the bottom (`_Keyboard body` is internal). Above the keyboard: the source row (`Cell`: "From Main account · €1,340.00") and the Primary button "Send €40" / "Top up €100". The Primary is disabled-looking (`text/tertiary`) until an amount is typed — keep it Primary.

## Action button
Round 48 icon + label below. Row of 3–4 under a balance: "Add money", "Send", "Card", "More". 16 gap, centered. Only one row per screen.

## Segmented control
2–6 items via `Item 1…6` booleans. Switches views of the same data (Week / Month / Year). Not navigation between different screens.
