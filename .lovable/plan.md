

## Add Cost/Expense Logging to Product History

### What
Add a "Registrar gasto" (Log expense) form in the ProductHistoryDialog so users can record costs associated with a product (tune-ups, repairs, shipping, parts, etc.). Each expense entry gets logged as a new event type (`expense`) in the existing `product_history` table with the amount in `new_value` and a description in `reason`.

### Changes

**`src/components/admin/ProductHistoryDialog.tsx`**
- Add two new event types to `eventLabels`: `expense` (Gasto) and `cost` (Costo) with a `Receipt`/`Banknote` icon in red/orange
- Add a collapsible "Registrar gasto/costo" section below the note input with:
  - A text input for the concept/description (e.g. "Tune up motor", "Flete")
  - A number input for the amount (MXN)
  - A select to choose between "Gasto" and "Costo"
  - A submit button
- On submit, call `addEntry` with `event_type: 'expense'` or `'cost'`, `new_value: "$5,000 MXN"`, `reason: "Tune up motor"`
- In the timeline, format expense/cost entries to show the amount prominently with a currency style

**No DB or hook changes needed** — the existing `product_history` table and `addEntry` mutation already support arbitrary `event_type`, `new_value`, and `reason` fields.

### Files
```
src/components/admin/ProductHistoryDialog.tsx  → add expense/cost form + event labels
```

One file change. No migrations.

