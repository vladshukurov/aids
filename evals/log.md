# Eval log

| Date | Prompt | Agent | Frame | Audit | Rubric | Main friction → fix |
|---|---|---|---|---|---|---|
| 29.10 | #2 Confirm €40 to Anna | cold, docs only | 29:138 → became `Confirm_example` | 0 errors | 19/20 | search empty (unpublished); TopBar hid a 2nd Primary; old Confirm_example broken; no persona data → TopBar props, persona.md, lookup scripts, new Confirm_example |
| 29.10 | #10 Spirit: top up Spain trip €100 | cold, docs only | 35:2 (Polygon) | 0 errors after fill fix | 18/20 | User message raw fill; BottomBar built-in chips; Check/Top bar without props; no goal avatar; two-tone Lead resets on edit → component props, Avatar Goal, chat recipe cases + Lead snippet |
| 29.10 | F1 Split bill €84 (build-flow, self-run) | me, by eye | 51:293, 51:471, 51:619 | 0 errors ×3 | ~17–18/20 | Cell checkbox was Apple-only (always checked) → Selection control exposed in Cell; Suggest Light invisible on white → chip/default fill; Lead couldn't take variables → two-layer Answer / Lead. Left: "You" checkbox should be locked; "€28 each" duplicates rows; Cell has no badge slot |
| 29.10 | F1 Split bill — fixes | me, by eye | same | 0 errors ×3 | ~19/20 | Selection control + State=Locked ("You"); duplicate "€28 each" removed; Cell got a Badge slot (Pending); rows were stacked with 0 gap → 16 per product rule, cell.md corrected |
