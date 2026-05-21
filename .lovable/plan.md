## Remove Channel 24 press entry

Delete the first press item (Channel 24, sort_order=10) from the `press_items` table so the Public Record archive shows the remaining 18 verified outlets.

**Change:**
- `DELETE FROM press_items WHERE id = '7b67bf1e-0a48-43e6-990e-669127bdcf86'` (Channel 24 — "জাবি ছাত্রলীগের অপরাধনামা…")

No code, schema, or sort_order changes needed — the remaining 18 entries keep their order.