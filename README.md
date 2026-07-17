# Card Brand Refund/OCT Config — Mockup

Static, dependency-free HTML/CSS/JS mockup of the "Configure by Card Brand" feature
for Credit Card Gateway Accounts. Built to demo the business logic before this gets
built for real — nothing here talks to a backend, all state is in-memory.

## Run it
Just open `index.html` in a browser. No build step, no server needed.

## Files
- `index.html` — markup
- `styles.css` — all styling
- `script.js` — interaction logic (master-toggle → brand-column locking, add/remove brand, save toast, confirmation popup)

## What it demonstrates
- The 4 master toggles (Refund Settings) gate the matching column in the
  "Configure by Card Brand" modal — disabled master toggle greys out and
  unchecks that column for every brand.
- Visa & Mastercard are always present by default; other brands are added
  manually via "+ Add Card Brand" and default to whatever the master toggles
  currently allow.
- Removing a brand requires confirmation.
- The modal's Save is independent of the parent account form's Save.

See the accompanying requirement doc for the full business rules and open questions.
