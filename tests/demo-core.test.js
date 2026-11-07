import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseInvoiceRows,
  toCsv,
  createRows,
  appendRow,
  headers,
} from "../js/demo-core.js";
const invoice = (
  amount = "1.250,50 TL",
  date = "01.11.2026",
  description = "Örnek hizmet",
) =>
  `Belge No: ORNEK-001\nTarih: ${date}\nAçıklama: ${description}\nTutar: ${amount}`;
test("Turkish decimal and thousands separators preserve integer minor units", () => {
  const r = parseInvoiceRows(invoice());
  assert.equal(r.rows[0].amountMinor, 125050);
  assert.deepEqual(r.errors, []);
});
test("Partial documents do not silently produce final rows", () => {
  const r = parseInvoiceRows(invoice() + "\n\nBelge No: EKSIK");
  assert.equal(r.rows.length, 1);
  assert.equal(r.errors.length, 1);
});
test("Invalid calendar dates are rejected", () => {
  assert.equal(parseInvoiceRows(invoice("10 TL", "31.02.2026")).rows.length, 0);
});
test("Malformed amounts, zero and overflow are rejected", () => {
  for (const value of [
    "1.23.45 TL",
    "0 TL",
    "-5 TL",
    "99.999.999.999.999.999 TL",
  ])
    assert.equal(parseInvoiceRows(invoice(value)).rows.length, 0, value);
});
test("Inserted records appear in export and resetting has no shared mutation", () => {
  const initial = createRows("service");
  const next = appendRow(initial, "service");
  const csv = toCsv(headers.service, next);
  assert.equal(next.length, 4);
  assert.equal(initial.length, 3);
  assert.ok(csv.includes("Yeni örnek kayıt"));
  next[0][0] = "CHANGED";
  assert.notEqual(createRows("service")[0][0], "CHANGED");
});
test("CSV quotes separators and newlines and neutralizes spreadsheet formulas", () => {
  const csv = toCsv(
    ["Örnek"],
    [["a;b"], ["çok\nsatır"], ['=HYPERLINK("x")'], ["\t=1+1"]],
  );
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"a;b"'));
  assert.ok(csv.includes('"çok\nsatır"'));
  assert.ok(csv.includes('"\'=HYPERLINK(""x"")"'));
  assert.ok(csv.includes('"\'\t=1+1"'));
});
test("Empty input returns a readable error and text content stays data", () => {
  assert.ok(parseInvoiceRows("").errors.length);
  const r = parseInvoiceRows(
    invoice("10 TL", "01.11.2026", "<img src=x onerror=alert(1)>"),
  );
  assert.equal(r.rows[0].description, "<img src=x onerror=alert(1)>");
});
