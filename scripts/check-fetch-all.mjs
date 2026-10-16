// Run: node scripts/check-fetch-all.mjs
import assert from "node:assert/strict";
import { fetchAll, PAGE_SIZE } from "../src/lib/fetch-all.ts";

// fake table of `total` rows: rows are their own index, range() is inclusive
const table = (total) => async (from, to) => ({
  data: Array.from({ length: Math.max(0, Math.min(to + 1, total) - from) }, (_, i) => from + i),
  error: null,
});

for (const n of [0, 1, PAGE_SIZE - 1, PAGE_SIZE, PAGE_SIZE + 1, 2500]) {
  const rows = await fetchAll(table(n));
  assert.equal(rows.length, n, `n=${n}`);
  assert.equal(new Set(rows).size, n, `duplicates at n=${n}`);
}
await assert.rejects(
  fetchAll(async () => ({ data: null, error: { message: "boom" } })),
  /boom/,
);
console.log("fetch-all ok");
