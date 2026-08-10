const fs = require("fs");
const path = require("path");

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === "page.tsx") {
      let c = fs.readFileSync(p, "utf8");
      const o = c;
      c = c.split("export const revalidate = DATA_REVALIDATE;").join(
        "export const revalidate = 1800;",
      );
      c = c.split(", DATA_REVALIDATE").join("");
      c = c.split("DATA_REVALIDATE, ").join("");
      c = c.split('DATA_REVALIDATE,\n').join("");
      // clean import-only DATA_REVALIDATE lines later manually if needed
      if (c.includes("DATA_REVALIDATE")) {
        c = c
          .split("\n")
          .filter((line) => !line.includes("DATA_REVALIDATE"))
          .join("\n");
      }
      if (c !== o) {
        fs.writeFileSync(p, c);
        console.log("fixed", p);
      }
    }
  }
}

walk(path.join(__dirname, "..", "src", "app"));
