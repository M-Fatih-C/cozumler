import fs from "node:fs";
fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist");
for (const name of [
  "index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  ".nojekyll",
])
  fs.copyFileSync(name, `dist/${name}`);
for (const dir of ["assets", "css", "js"])
  fs.cpSync(dir, `dist/${dir}`, { recursive: true });
console.log("Static site built in dist/. Original site files are unchanged.");
