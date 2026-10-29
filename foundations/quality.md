# Quality bar

What finished work satisfies before anyone sees it. Collected on re:verse across many features and owner corrections. Critics get the relevant parts in their brief.

## 1. Before drawing
- **Discovery first, even for small requests.** 3–5 market models (Mobbin) and how the domain really works. Write the conclusions and the chosen model in the md.
- **Search the system first.** A recipe, a spec in `specs/examples/`, a scenario. Adapt; invent only where nothing exists, and say so.
- **References: translate, don't copy.** Name a reference's 2–3 signature ideas and rebuild them with our blocks. Never copy its chrome.
- **Direction checkpoint.** Direction unclear → 2–3 really different variants with a recommendation; continue with it unless the owner objects.
- **The chat is new on purpose.** Don't pull the assistant back to market patterns; use the market only for domain logic.

## 2. Product logic
- **Entry points.** The person can learn about a feature and get into it from where they would look: home, push, profile, a statement. No banners.
- **Land on the object.** From a push or the feed, open the thing itself and act from there.
- **No dead ends.** Every screen has a next step and a way back; nothing promises a screen that isn't drawn.
- **The other side.** Draw what the second participant sees; names, amounts and statuses match on both sides.
- **States.** Async (waiting, partial, done, cancelled, error) and object states (empty, frozen, on the way) through component properties, never overlays.
- **Money and risk.** Before confirming: amount, recipient, source, fee. Face ID where money leaves re:verse. Irreversible actions ask first; routine ones land on the object with Undo. Real milestones (goal reached) keep their celebration.
- **Fewer steps, fewer elements.** List a screen's elements; cut what doesn't serve the task.
- **Right element for the job.** Toggle, checkbox, radio, chip, row, button, sheet or full screen. Chips don't duplicate rows. Settings are plain rows.
- **Never invent.** No features, data or claims beyond the product, persona.md, the md or the brief. Unknowns are open questions.
- **One persona, one day, one set of numbers.** Recalculate every sum, date and weekday.
- **Domain words.** Banking names (Account, Card, Goal, Budget), never cute labels.

## 3. Copy
- Base UI: short interface copy, no explanatory paragraphs; status goes into rows and badges.
- The assistant: first person, warm, short, offers the next step, answers only what was asked. Its name and logo stay out of base UI.
- A big phrase only for one main thought; a big number only for the main amount the person has.
- Line breaks: no one-word last line, no function word (a, to, of, in, at, the) at a line end, never split "amount + word", names or dates (non-breaking spaces).
- re:verse rules exactly: lowercase brand, no full stop at the end of chat sentences, captions and list items.

## 4. Visual and components
- **Kit only.** Kit components at kit sizes, kit text styles, colour and spacing variables. A missing token or component is a question.
- **Craft at 100%.** Vertical centring in cells, one text style per role, no clipped or overlapping text, auto layout not collapsed, 16 margins, frame height per layout.md §3.
- **Spacing by meaning.** Related items tight, groups apart — the numbers are in layout.md §3.
- **Minimal substrates.** Rows straight on the background under a section header. No grey plates around info blocks.
- **Clone hygiene.** Replace every text and badge; photo matches the name everywhere; no hidden leftovers; 9:41; green only for money in.
- **Brand effects** (glow, shader) are the product's own; never draw one.

## 5. Canvas and docs
- The md is the source of truth (brief, decisions, data, screens with ids, review rounds, open questions); the canvas holds the screens, section titles and one caption above each screen.
- A caption a PM understands cold: what happens and why.
- One row per flow; a branch sits under the screen it starts from; core scenario first, edge cases after.

## 6. Working with the owner
- Tidy ≠ redesign: "put in order" means move, align, rename. Changing finished screens or the kit needs agreement.
- The owner edits in parallel: re-read the current state before each batch; hidden or deleted things are decisions.
- Report honestly: scores per round, what wasn't checked, decisions the owner may want to reverse.
- Every correction becomes a system fix for the whole team (`report-friction`), not a personal note.
