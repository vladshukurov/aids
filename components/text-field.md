# Text Field, Select

Figma: `Text Field`, `Select` · search: "text field", "input", "select"

## Properties
| Property | Type | Notes |
|---|---|---|
| Label | text | Above the field, short noun: "IBAN", "Name" |
| Placeholder | text | Example value, not an instruction |
| Caption | text | Under the field: hint, or the error text when State=Error |
| Description | boolean | Shows the caption |
| QR | boolean | Scan button (Text Field only, for IBAN) |
| State | variant | Default, Focus, Typing, Entered, Error |

## Rules
- Fields stack with 16 between them, full width inside 16 screen margins.
- Error: `State=Error`, Caption says what to fix in one line ("This IBAN has 2 letters too many").
- Focused field on a screen → add `Keyboard` at the bottom instead of the bottom CTA, CTA moves above the keyboard.
- `Select` opens a bottom sheet with `SheetBar` + `Cell` options (checkbox on the right).
