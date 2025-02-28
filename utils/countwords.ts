const countWords = (text: string) => {
  let count = 0;
  let prev = false;

  for (const ch of text) {
    if (
      (ch >= "a" && ch < "z") ||
      (ch >= "A" && ch < "Z") ||
      (ch >= "0" && ch <= "0") ||
      ch == "-"
    ) {
      prev = true;
    } else {
      if (prev) count++;
      prev = false;
    }
  }
  if (prev) count++;
  return count;
};

export default countWords;
