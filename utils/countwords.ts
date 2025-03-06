const countWords = async (text: string, done: () => void) => {
  const limit = 400;
  let count = 0;
  let prev = false;
  const array = Array.from(text);
  const n = array.length;

  const tick = async (start: number): Promise<number> =>
    new Promise((resolve) => {
      const words = Math.min(start + limit , n)
      for (let i = start; i < words; i++) {
        const ch = text[i];
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
      resolve(words);
    });

  for (let i = 0; i < n; ) {
    i = await tick(i);
  }

  if (prev) count++;
  done();
  return count;
};

export default countWords;
