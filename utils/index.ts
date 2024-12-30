export function trim(word: string) {
  return word.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, "");
}

