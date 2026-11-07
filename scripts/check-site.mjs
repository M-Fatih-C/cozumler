import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const html = fs.readFileSync("index.html", "utf8");
assert.equal((html.match(/<h1\b/g) || []).length, 1, "One page heading");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(new Set(ids).size, ids.length, "Unique element IDs");
for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  const url = m[1];
  if (url.startsWith("#"))
    assert.ok(ids.includes(url.slice(1)), `Missing anchor ${url}`);
  else if (!/^(?:https?:|mailto:)/.test(url))
    assert.ok(
      fs.existsSync(url === "./" ? "index.html" : url),
      `Missing file ${url}`,
    );
}
for (const m of html.matchAll(/aria-(?:controls|labelledby)="([^"]+)"/g))
  for (const id of m[1].split(" "))
    assert.ok(ids.includes(id), `Missing ARIA target ${id}`);
assert.equal((html.match(/role="tab"/g) || []).length, 4);
assert.equal((html.match(/role="tabpanel"/g) || []).length, 4);
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
    );
for (const file of ["index.html", "404.html", ...walk("css"), ...walk("js")]) {
  const text = fs.readFileSync(file, "utf8");
  assert.ok(
    !/cetintas\.dev|muhammedfatihcetint54@gmail|fonts\.googleapis|fonts\.gstatic|\/Users\/|-----BEGIN .*PRIVATE KEY/.test(
      text,
    ),
    `Stale or private value ${file}`,
  );
  if (file.startsWith("js/"))
    assert.ok(
      !/\bfetch\s*\(|\.innerHTML\s*=|localStorage|sessionStorage|document\.cookie/.test(
        text,
      ),
      `Unexpected network/storage/HTML injection in ${file}`,
    );
  if (file.endsWith(".css"))
    for (const m of text.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) {
      const url = m[1];
      if (!url.startsWith("data:"))
        assert.ok(
          fs.existsSync(path.resolve(path.dirname(file), url)),
          `Missing CSS asset ${url}`,
        );
    }
}
const schema = JSON.parse(
  html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1],
);
assert.equal(schema.url, "https://m-fatih-c.github.io/cozumler/");
console.log(
  `Site PASS: ${ids.length} unique IDs, all local/ARIA references, 4 tabs, structured data, no stale domain/email, remote fonts or contact network code.`,
);
