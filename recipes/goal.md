# Recipe: Goal

Spec: `specs/examples/goal.json` · archetype Object

## When
A savings goal: how much is there, how it gets to the target, what went in.

## Structure
1. `TopBar`: Back; no title (the hero names the goal).
2. Hero amount: label = goal name, amount = saved so far, caption = "of €3,500 · ready Sep 2027".
3. Action row, pair: "Top up" / "Withdraw" + "···" (rename, change target, close goal).
4. "Plan": the monthly top-up (action row with the rule as caption), when it will be ready (state row), the reminder (toggle).
5. "History", aside "View all": top-ups as money rows; money into the goal is "+" (green), withdrawals "−".
6. Bottom chat: questions about the plan ("Can I go sooner?", "Pause for a month").

## Rules
- History adds up to the hero amount (persona.md → Spain trip history).
- Goal, never "pocket".
- Reaching the target is a real milestone: that one state may celebrate (layout, not a success screen after a routine top-up).
