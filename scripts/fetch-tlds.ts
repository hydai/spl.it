import * as fs from "fs";
import * as path from "path";

const IANA_URL = "https://data.iana.org/TLD/tlds-alpha-by-domain.txt";

const SPONSORED_TLDS = new Set([
  "aero", "asia", "cat", "coop", "edu", "gov", "int", "jobs",
  "mil", "museum", "post", "tel", "travel", "xxx",
]);

interface TLDEntry {
  tld: string;
  type: "ccTLD" | "gTLD" | "sTLD";
}

function classifyTLD(tld: string): "ccTLD" | "gTLD" | "sTLD" {
  if (SPONSORED_TLDS.has(tld)) return "sTLD";
  if (tld.length === 2) return "ccTLD";
  return "gTLD";
}

async function main() {
  console.log(`Fetching TLDs from ${IANA_URL}...`);
  const response = await fetch(IANA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  const text = await response.text();
  const lines = text.split("\n").filter((line) => line && !line.startsWith("#"));

  const entries: TLDEntry[] = lines
    .map((line) => line.trim().toLowerCase())
    .filter((tld) => /^[a-z]+$/.test(tld)) // ASCII only, skip IDN
    .map((tld) => ({ tld, type: classifyTLD(tld) }));

  const outPath = path.join(__dirname, "..", "src", "data", "tlds.json");
  fs.writeFileSync(outPath, JSON.stringify(entries, null, 2));
  console.log(`Wrote ${entries.length} TLDs to ${outPath}`);

  // Stats
  const cc = entries.filter((e) => e.type === "ccTLD").length;
  const g = entries.filter((e) => e.type === "gTLD").length;
  const s = entries.filter((e) => e.type === "sTLD").length;
  console.log(`  ccTLD: ${cc}, gTLD: ${g}, sTLD: ${s}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
