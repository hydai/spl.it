import type { Suggestion, TLDData } from "../types";

export function detectDomainHack(
  _word: string,
  _tldData: TLDData
): Suggestion[] {
  // Stub — will be implemented by strategy-core agent
  return [];
}

export function findDomainHacks(
  _input: string,
  _tldData: TLDData
): Suggestion[] {
  // Stub — will be implemented by strategy-core agent
  return [];
}
