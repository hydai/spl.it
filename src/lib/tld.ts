import tldEntries from "@/data/tlds.json";
import type { TLDData, TLDEntry } from "./types";

const entries = tldEntries as TLDEntry[];

const byLength = new Map<number, string[]>();
const tldSet = new Set<string>();

for (const entry of entries) {
  tldSet.add(entry.tld);
  const len = entry.tld.length;
  if (!byLength.has(len)) {
    byLength.set(len, []);
  }
  byLength.get(len)!.push(entry.tld);
}

export const tldData: TLDData = {
  list: entries,
  byLength,
  set: tldSet,
};

export const POPULAR_TLDS = new Set([
  "com", "io", "ly", "co", "me", "us", "am", "to", "is",
  "dev", "app", "ai", "net", "org", "so", "it", "do",
]);

export function getTldType(tld: string): "ccTLD" | "gTLD" | "sTLD" | undefined {
  const entry = entries.find((e) => e.tld === tld);
  return entry?.type;
}
