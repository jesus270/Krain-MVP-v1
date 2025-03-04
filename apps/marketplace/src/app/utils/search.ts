// Common words to filter out from search
export const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  // ... rest of the stop words
]);

// Process natural language query into search terms
export const processSearchQuery = (query: string): string[] => {
  return query
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !stopWords.has(word));
};
