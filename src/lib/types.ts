export interface TLDEntry {
  tld: string;
  type: "ccTLD" | "gTLD" | "sTLD";
}

export interface TLDData {
  list: TLDEntry[];
  byLength: Map<number, string[]>;
  set: Set<string>;
}

export type StrategyName =
  | "domainHack"
  | "prefix"
  | "suffix"
  | "abbreviation"
  | "altSpelling"
  | "wordPlay";

export interface Suggestion {
  domain: string;
  tld: string;
  prefix: string;
  strategy: StrategyName;
  score: number;
  isMultiLevel?: boolean;
}

export type StrategyFn = (input: string, tldData: TLDData) => Suggestion[];

export interface FilterState {
  tldType: ("ccTLD" | "gTLD" | "sTLD")[];
  strategy: StrategyName[];
  tldLengthMin: number;
  tldLengthMax: number;
  searchWithin: string;
}

export type SortOption = "score" | "alpha" | "length";
