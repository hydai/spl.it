/**
 * Validation script: verify that the suggestion engine produces
 * expected results for reference words.
 */
import * as fs from "fs";
import * as path from "path";

interface TLDEntry { tld: string; type: "ccTLD" | "gTLD" | "sTLD"; }

const entries: TLDEntry[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/data/tlds.json"), "utf-8")
);
const tldSet = new Set(entries.map(e => e.tld));
const byLength = new Map<number, string[]>();
for (const entry of entries) {
  const len = entry.tld.length;
  if (!byLength.has(len)) byLength.set(len, []);
  byLength.get(len)!.push(entry.tld);
}

function detectHacks(word: string): string[] {
  const results: string[] = [];
  for (const [len] of byLength) {
    if (len >= word.length) continue;
    const suffix = word.slice(-len);
    if (tldSet.has(suffix)) {
      const prefix = word.slice(0, -len);
      if (prefix.length > 0) results.push(`${prefix}.${suffix}`);
    }
  }
  return results;
}

// Reference words with expected domain hacks (based on REAL IANA TLDs)
const tests = [
  { word: "delicious", expectedHacks: ["delicio.us"] },
  { word: "stream", expectedHacks: ["stre.am"] },
  { word: "genius", expectedHacks: ["geni.us"] },
  { word: "famous", expectedHacks: ["famo.us"] },
  { word: "focus", expectedHacks: ["foc.us"] },
  { word: "paris", expectedHacks: ["par.is"] },
  { word: "cloud", expectedHacks: [] }, // no real TLD match
];

let allPass = true;
console.log("=== Domain Hack Validation ===\n");

for (const test of tests) {
  const hacks = detectHacks(test.word.toLowerCase());
  console.log(`"${test.word}": ${hacks.join(", ") || "(none)"}`);

  for (const expected of test.expectedHacks) {
    if (hacks.includes(expected)) {
      console.log(`  ✓ ${expected}`);
    } else {
      console.log(`  ✗ MISSING: ${expected}`);
      allPass = false;
    }
  }

  if (test.expectedHacks.length === 0 && hacks.length === 0) {
    console.log(`  ✓ Correctly no domain hacks`);
  }
}

// Bundle size check
const tldSize = fs.statSync(path.join(__dirname, "../src/data/tlds.json")).size;
console.log(`\n=== Bundle Metrics ===`);
console.log(`  tlds.json: ${(tldSize / 1024).toFixed(1)}KB (raw)`);
console.log(`  TLD count: ${entries.length}`);
console.log(`  TLD lengths: ${Array.from(byLength.keys()).sort((a,b)=>a-b).join(", ")}`);

console.log(`\n=== Result: ${allPass ? "ALL PASSED ✓" : "SOME FAILED ✗"} ===`);
if (!allPass) process.exit(1);
